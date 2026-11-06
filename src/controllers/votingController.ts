import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

export const castVoteHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;
  const { token, candidate } = req.body as { token?: string; candidate?: string };
  if (!token || !candidate) return res.status(400).json({ error: 'token and candidate are required' });

  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    const now = new Date();
    if (election.status !== 'open' || now < election.startAt || now > election.endAt) {
      return res.status(400).json({ error: 'Election is not open for voting' });
    }

    const selectedCandidate = await prisma.candidate.findFirst({ where: { id: candidate, electionId } });
    if (!selectedCandidate) return res.status(400).json({ error: 'Choose a valid candidate for this election' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await prisma.$transaction(async (tx) => {
      const voteToken = await tx.voteToken.findUnique({ where: { tokenHash } });
      if (!voteToken || voteToken.electionId !== electionId || voteToken.used) throw new Error('Invalid or already used voting token');
      const voter = await tx.voter.findUnique({ where: { id: voteToken.voterId } });
      if (!voter?.approved) throw new Error('Voter is not approved');
      if (voter.universityId !== election.universityId) throw new Error('Voting token does not belong to this university');
      const updated = await tx.voteToken.updateMany({ where: { id: voteToken.id, used: false }, data: { used: true, usedAt: new Date() } });
      if (updated.count !== 1) throw new Error('Voting token has already been used');
      return tx.vote.create({ data: { electionId, candidate: selectedCandidate.id, tokenHash } });
    });
    return res.json({ success: true, voteId: result.id });
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || 'Failed to cast vote' });
  }
};

export const listAvailableElectionsHandler = async (req: Request, res: Response) => {
  const auth = (req as any).auth;
  if (!auth?.universityId) return res.status(403).json({ error: 'Voter must be assigned to a university.' });

  try {
    const now = new Date();
    const elections = await prisma.election.findMany({
      where: {
        universityId: auth.universityId,
        status: 'open',
        startAt: { lte: now },
        endAt: { gte: now },
      },
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
    console.error(error);
    return res.status(500).json({ error: 'Could not load available elections.' });
  }
};

export const issueTokensHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role) || !auth.universityId) return res.status(403).json({ error: 'University administrator access required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.universityId !== auth.universityId) return res.status(404).json({ error: 'Election not found for this university.' });
    const voters = await prisma.voter.findMany({ where: { universityId: auth.universityId, approved: true } });
    const tokensCreated = [];
    for (const voter of voters) {
      const existingToken = await prisma.voteToken.findFirst({ where: { electionId, voterId: voter.id } });
      if (!existingToken) {
        const rawToken = crypto.randomBytes(16).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        await prisma.voteToken.create({ data: { electionId, voterId: voter.id, tokenHash, used: false } });
        tokensCreated.push({ voterId: voter.id, token: rawToken });
      }
    }
    return res.json({ success: true, count: tokensCreated.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to issue tokens' });
  }
};
