import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

const getSingleString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
};

type AuthenticatedRequest = Request & {
  auth?: { userId: string; role: string; universityId: string | null };
  user?: { email?: string };
};

/**
 * Run a short voting transaction at SERIALIZABLE isolation and retry only
 * PostgreSQL serialization conflicts. The database, not process-local locks,
 * arbitrates requests across multiple application instances.
 */
const withSerializableRetry = async <T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
  const maxAttempts = 4;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      if (error?.code !== 'P2034' || attempt >= maxAttempts - 1) throw error;
      const backoffMs = 20 * (attempt + 1) + Math.floor(Math.random() * 40);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
};

const getApprovedVoter = async (req: AuthenticatedRequest) => {
  const auth = req.auth;
  const email = req.user?.email;
  if (!auth || auth.role !== 'voter' || !auth.universityId || !email) return null;
  return prisma.voter.findFirst({
    where: { universityId: auth.universityId, email: { equals: email, mode: 'insensitive' }, approved: true },
  });
};

export const listVoterBallotsHandler = async (req: AuthenticatedRequest, res: Response) => {
  const auth = req.auth;
  if (!auth || auth.role !== 'voter' || !auth.universityId) {
    return res.status(403).json({ error: 'Voter access required.' });
  }

  try {
    const voter = await getApprovedVoter(req);
    if (!voter) return res.status(403).json({ error: 'No approved voter record matches this account.' });

    const now = new Date();
    const elections = await prisma.election.findMany({
      where: { universityId: auth.universityId, status: 'open', startAt: { lte: now }, endAt: { gte: now } },
      include: { candidates: true },
      orderBy: { startAt: 'asc' },
    });

    const ballots = await Promise.all(
      elections.map(async (election) => {
        const positions = Array.from(new Set(election.candidates.map((candidate: any) => candidate.position)));

        if (positions.length) {
          // skipDuplicates makes simultaneous ballot-page requests safe: the
          // composite unique constraint guarantees one token per voter/position.
          await prisma.voteToken.createMany({
            data: positions.map((position) => ({
              electionId: election.id,
              voterId: voter.id,
              position,
              tokenHash: crypto.randomBytes(32).toString('hex'),
            })),
            skipDuplicates: true,
          });
        }

        const assignedTokens = await prisma.voteToken.findMany({
          where: { electionId: election.id, voterId: voter.id },
          select: { position: true, used: true },
        });

        const tokenByPosition = new Map(assignedTokens.map((token) => [token.position, token]));

        const positionsWithStatus = positions.map((position) => ({
          position,
          voted: tokenByPosition.get(position)?.used || false,
          candidates: election.candidates
            .filter((candidate: any) => candidate.position === position)
            .map((candidate: any) => ({
              id: candidate.id,
              name: candidate.fullName ?? '',
              description: candidate.description ?? null,
            })),
        }));

        return {
          id: election.id,
          title: (election as any).title ?? '',
          description: (election as any).description ?? null,
          startAt: election.startAt,
          endAt: election.endAt,
          positions: positionsWithStatus,
        };
      }),
    );

    return res.json({ success: true, ballots });
  } catch (error) {
    console.error('Could not load voter ballots:', error);
    return res.status(500).json({ error: 'Could not load voter ballots.' });
  }
};

export const castAuthenticatedPostVoteHandler = async (req: AuthenticatedRequest, res: Response) => {
  const electionId = getSingleString(req.params.electionId);
  const body = req.body as { position?: unknown; candidateId?: unknown };
  const position = getSingleString(body?.position).trim();
  const candidateId = getSingleString(body?.candidateId);
  const auth = req.auth;

  if (!auth || auth.role !== 'voter' || !auth.universityId) {
    return res.status(403).json({ error: 'Voter access required.' });
  }
  if (!electionId || !position || !candidateId) {
    return res.status(400).json({ error: 'electionId, position and candidateId are required.' });
  }

  try {
    const voter = await getApprovedVoter(req);
    if (!voter) return res.status(403).json({ error: 'No approved voter record matches this account.' });

    const candidateRecord = await prisma.candidate.findFirst({
      where: { id: candidateId, electionId, position },
    });
    if (!candidateRecord) return res.status(400).json({ error: 'Choose a candidate registered for this post.' });

    const result = await withSerializableRetry(async (tx) => {
      const now = new Date();
      const election = await tx.election.findFirst({
        where: {
          id: electionId,
          universityId: auth.universityId!,
          status: 'open',
          startAt: { lte: now },
          endAt: { gte: now },
        },
        select: { id: true },
      });
      if (!election) throw new Error('Election is not currently open for voting.');

      // Insert without throwing on the voter/election/position unique key. This
      // avoids a losing concurrent request poisoning its database transaction.
      await tx.voteToken.createMany({
        data: [{
          electionId,
          voterId: voter.id,
          position,
          tokenHash: crypto.randomBytes(32).toString('hex'),
        }],
        skipDuplicates: true,
      });

      const token = await tx.voteToken.findUnique({
        where: { electionId_voterId_position: { electionId, voterId: voter.id, position } },
      });
      if (!token) throw new Error('Could not assign a voting token for this post.');

      // Conditional update is the single-winner claim. Concurrent submissions
      // for this voter/position cannot both consume the same token.
      const claimed = await tx.voteToken.updateMany({
        where: { id: token.id, voterId: voter.id, electionId, position, used: false },
        data: { used: true, usedAt: new Date() },
      });
      if (claimed.count !== 1) throw new Error('You have already voted for this post.');

      return tx.vote.create({
        data: {
          electionId,
          candidate: candidateRecord.fullName,
          candidateId: candidateRecord.id,
          position,
          tokenHash: token.tokenHash,
        },
      });
    });

    return res.json({
      success: true,
      voteId: result.id,
      position,
      message: `Your vote for ${position} has been recorded.`,
    });
  } catch (error: any) {
    if (error?.code === 'P2034') {
      return res.status(503).json({ error: 'Voting is busy. Please retry your submission.' });
    }
    if (error?.code === 'P2002' || error?.message?.includes('already voted')) {
      return res.status(409).json({ error: error.message || 'You have already voted for this post.' });
    }
    if (error?.message?.includes('token')) return res.status(409).json({ error: error.message });
    if (error?.message?.includes('not currently open')) return res.status(400).json({ error: error.message });
    console.error('Could not record authenticated vote:', error);
    return res.status(500).json({ error: 'Could not record your vote. Please retry.' });
  }
};

export const castVoteHandler = async (req: Request, res: Response) => {
  const electionId = getSingleString(req.params.electionId);
  const body = req.body as { token?: unknown; candidate?: unknown };
  const token = getSingleString(body?.token);
  const candidate = getSingleString(body?.candidate);

  if (!electionId || !token || !candidate) {
    return res.status(400).json({ error: 'electionId, token and candidate are required' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await withSerializableRetry(async (tx) => {
      const now = new Date();
      const election = await tx.election.findFirst({
        where: { id: electionId, status: 'open', startAt: { lte: now }, endAt: { gte: now } },
      });
      if (!election) throw new Error('Election is not open for voting.');

      const selectedCandidate = await tx.candidate.findFirst({ where: { id: candidate, electionId } });
      if (!selectedCandidate) throw new Error('Choose a valid candidate for this election.');

      const voteToken = await tx.voteToken.findUnique({ where: { tokenHash } });
      if (!voteToken || voteToken.electionId !== electionId || voteToken.used) {
        throw new Error('Invalid or already used voting token.');
      }

      const voter = await tx.voter.findUnique({ where: { id: voteToken.voterId } });
      if (!voter?.approved) throw new Error('Voter is not approved.');
      if (voter.universityId !== election.universityId) throw new Error('Voting token does not belong to this university.');

      const updated = await tx.voteToken.updateMany({
        where: { id: voteToken.id, electionId, used: false },
        data: { used: true, usedAt: new Date() },
      });
      if (updated.count !== 1) throw new Error('Voting token has already been used.');

      return tx.vote.create({
        data: {
          electionId,
          candidate: selectedCandidate.fullName,
          candidateId: selectedCandidate.id,
          position: voteToken.position,
          tokenHash,
        },
      });
    });

    return res.json({ success: true, voteId: result.id });
  } catch (error: any) {
    if (error?.code === 'P2034') {
      return res.status(503).json({ error: 'Voting is busy. Please retry your submission.' });
    }
    if (error?.message?.includes('already used')) return res.status(409).json({ error: 'Invalid or already used voting token.' });
    if (error?.message?.includes('not open')) return res.status(400).json({ error: error.message });
    if (error?.message?.includes('candidate')) return res.status(400).json({ error: error.message });
    if (error?.message?.includes('approved')) return res.status(403).json({ error: error.message });
    console.error('Could not record token vote:', error);
    return res.status(500).json({ error: 'Failed to record vote. Please retry.' });
  }
};

export const listAvailableElectionsHandler = async (req: Request, res: Response) => {
  const auth = (req as any).auth;
  if (!auth?.universityId) return res.status(403).json({ error: 'Voter must be assigned to a university.' });

  try {
    const now = new Date();
    const elections = await prisma.election.findMany({
      where: { universityId: auth.universityId, status: 'open', startAt: { lte: now }, endAt: { gte: now } },
      include: {
        candidates: {
          select: {
            id: true,
            fullName: true,
            position: true,
            faculty: true,
            college: true,
            party: true,
            symbol: true,
            photoUrl: true,
            description: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { startAt: 'asc' },
    });
    return res.json({ success: true, elections });
  } catch (error) {
    console.error('Could not load available elections:', error);
    return res.status(500).json({ error: 'Could not load available elections.' });
  }
};

export const issueTokensHandler = async (req: Request, res: Response) => {
  const electionId = getSingleString(req.params.electionId);
  const auth = (req as any).auth;

  if (!auth || !isUniversityAdmin(auth.role) || !auth.universityId) {
    return res.status(403).json({ error: 'University administrator access required.' });
  }
  if (!electionId) return res.status(400).json({ error: 'Election ID is required.' });

  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.universityId !== auth.universityId) {
      return res.status(404).json({ error: 'Election not found for this university.' });
    }

    const voters = await prisma.voter.findMany({ where: { universityId: auth.universityId, approved: true } });
    let tokensCreated = 0;

    for (const voter of voters) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const created = await prisma.voteToken.createMany({
        data: [{ electionId, voterId: voter.id, tokenHash, used: false }],
        skipDuplicates: true,
      });
      tokensCreated += created.count;
      // Do not return or log plaintext voting credentials. Deliver them through
      // a dedicated, audited credential-delivery flow instead.
    }

    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'issue_tokens',
        resourceType: 'election',
        resourceId: electionId,
        details: { count: tokensCreated } as any,
      },
    });

    return res.json({ success: true, count: tokensCreated });
  } catch (error) {
    console.error('Failed to issue voting tokens:', error);
    return res.status(500).json({ error: 'Failed to issue tokens' });
  }
};
