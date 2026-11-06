import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

type AuthenticatedRequest = Request & { auth?: { userId: string; role: string; universityId: string | null }; user?: { email?: string } };

const getApprovedVoter = async (req: AuthenticatedRequest) => {
  const auth = req.auth;
  const email = req.user?.email;
  if (!auth || auth.role !== 'voter' || !auth.universityId || !email) return null;
  return prisma.voter.findFirst({ where: { universityId: auth.universityId, email: { equals: email, mode: 'insensitive' }, approved: true } });
};

// Assign one opaque, server-managed single-use token to each post in every open election.
// Only the token hash is stored; the voter uses their authenticated session to cast.
export const listVoterBallotsHandler = async (req: AuthenticatedRequest, res: Response) => {
  const auth = req.auth;
  if (!auth || auth.role !== 'voter' || !auth.universityId) return res.status(403).json({ error: 'Voter access required.' });
  try {
    const voter = await getApprovedVoter(req);
    if (!voter) return res.status(403).json({ error: 'No approved voter record matches this account.' });

    const now = new Date();
    const elections = await prisma.election.findMany({
      where: { universityId: auth.universityId, status: 'open', startAt: { lte: now }, endAt: { gte: now } },
      include: { candidates: { orderBy: [{ position: 'asc' }, { name: 'asc' }] } },
      orderBy: { startAt: 'asc' }
    });

    const ballots = await Promise.all(elections.map(async (election) => {
      const positions = Array.from(new Set(election.candidates.map((candidate) => candidate.position)));
      if (positions.length) {
        await prisma.voteToken.createMany({
          data: positions.map((position) => ({ electionId: election.id, voterId: voter.id, position, tokenHash: crypto.randomBytes(32).toString('hex') })),
          skipDuplicates: true
        });
      }
      const assignedTokens = await prisma.voteToken.findMany({ where: { electionId: election.id, voterId: voter.id }, select: { position: true, used: true } });
      const tokenByPosition = new Map(assignedTokens.map((token) => [token.position, token]));
      const positionsWithStatus = positions.map((position) => ({
        position,
        voted: tokenByPosition.get(position)?.used || false,
        candidates: election.candidates.filter((candidate) => candidate.position === position).map(({ id, name, description }) => ({ id, name, description }))
      }));
      return { id: election.id, title: election.title, description: election.description, startAt: election.startAt, endAt: election.endAt, positions: positionsWithStatus };
    }));

    return res.json({ success: true, ballots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not load voter ballots.' });
  }
};

export const castAuthenticatedPostVoteHandler = async (req: AuthenticatedRequest, res: Response) => {
  const electionId = req.params.electionId as string;
  const position = typeof req.body.position === 'string' ? req.body.position.trim() : '';
  const candidateId = typeof req.body.candidateId === 'string' ? req.body.candidateId : '';
  const auth = req.auth;
  if (!auth || auth.role !== 'voter' || !auth.universityId) return res.status(403).json({ error: 'Voter access required.' });
  if (!position || !candidateId) return res.status(400).json({ error: 'position and candidateId are required.' });

  try {
    const voter = await getApprovedVoter(req);
    if (!voter) return res.status(403).json({ error: 'No approved voter record matches this account.' });
    const election = await prisma.election.findFirst({ where: { id: electionId, universityId: auth.universityId } });
    if (!election) return res.status(404).json({ error: 'Election not found for this university.' });
    const now = new Date();
    if (election.status !== 'open' || now < election.startAt || now > election.endAt) return res.status(400).json({ error: 'Election is not currently open for voting.' });

    const candidateRecord = await prisma.candidate.findFirst({ where: { id: candidateId, electionId, position } });
    if (!candidateRecord) return res.status(400).json({ error: 'Choose a candidate registered for this post.' });

    const result = await prisma.$transaction(async (tx) => {
      let token = await tx.voteToken.findUnique({ where: { electionId_voterId_position: { electionId, voterId: voter.id, position } } });
      if (!token) {
        try {
          token = await tx.voteToken.create({ data: { electionId, voterId: voter.id, position, tokenHash: crypto.randomBytes(32).toString('hex') } });
        } catch (error: any) {
          if (error?.code !== 'P2002') throw error;
          token = await tx.voteToken.findUnique({ where: { electionId_voterId_position: { electionId, voterId: voter.id, position } } });
        }
      }
      if (!token) throw new Error('Could not assign a voting token for this post.');
      const claimed = await tx.voteToken.updateMany({ where: { id: token.id, voterId: voter.id, electionId, position, used: false }, data: { used: true, usedAt: new Date() } });
      if (claimed.count !== 1) throw new Error('You have already voted for this post.');
      return tx.vote.create({ data: { electionId, candidate: candidateRecord.name, candidateId: candidateRecord.id, position, tokenHash: token.tokenHash } });
    });

    return res.json({ success: true, voteId: result.id, position, message: `Your vote for ${position} has been recorded.` });
  } catch (error: any) {
    if (error?.code === 'P2002' || error?.message?.includes('already voted')) return res.status(409).json({ error: error.message || 'You have already voted for this post.' });
    if (error?.message?.includes('token')) return res.status(409).json({ error: error.message });
    console.error(error);
    return res.status(400).json({ error: error.message || 'Could not record your vote.' });
  }
};

export const castVoteHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const { token, candidateId, candidate, position } = req.body;
  if (!token || (!candidateId && !candidate)) return res.status(400).json({ error: 'token and a candidate selection are required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    const now = new Date();
    if (election.status !== 'open' || now < election.startAt || now > election.endAt) return res.status(400).json({ error: 'Election is not currently open for voting.' });
    const candidateRecord = candidateId
      ? await prisma.candidate.findFirst({ where: { id: candidateId, electionId } })
      : await prisma.candidate.findFirst({ where: { electionId, name: String(candidate).trim(), ...(position ? { position: String(position).trim() } : {}) } });
    if (!candidateRecord) return res.status(400).json({ error: 'Select a registered candidate for this election.' });
    const effectivePosition = (position || candidateRecord.position || '').toString().trim();
    if (!effectivePosition || candidateRecord.position !== effectivePosition) return res.status(400).json({ error: 'The selected candidate does not belong to the chosen post.' });
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const result = await prisma.$transaction(async (tx) => {
      const voteToken = await tx.voteToken.findUnique({ where: { tokenHash } });
      if (!voteToken || voteToken.electionId !== electionId || voteToken.position !== effectivePosition || voteToken.used) throw new Error('Invalid, wrong-post, or already used token.');
      const voter = await tx.voter.findUnique({ where: { id: voteToken.voterId } });
      if (!voter?.approved || voter.universityId !== election.universityId) throw new Error('Voter is not approved for this election.');
      const updated = await tx.voteToken.updateMany({ where: { id: voteToken.id, used: false }, data: { used: true, usedAt: new Date() } });
      if (updated.count !== 1) throw new Error('Token already used.');
      return tx.vote.create({ data: { electionId, candidate: candidateRecord.name, candidateId: candidateRecord.id, position: effectivePosition, tokenHash } });
    });
    return res.json({ success: true, voteId: result.id, position: effectivePosition });
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message || 'Failed to cast vote.' });
  }
};

export const issueTokensHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role) || !auth.universityId) return res.status(403).json({ error: 'University administrator access required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.universityId !== auth.universityId) return res.status(404).json({ error: 'Election not found for this university.' });
    if (election.status === 'closed') return res.status(400).json({ error: 'Cannot issue tokens for a closed election.' });
    const positions = await prisma.candidate.findMany({ where: { electionId }, select: { position: true }, distinct: ['position'] });
    const voters = await prisma.voter.findMany({ where: { universityId: auth.universityId, approved: true }, select: { id: true } });
    const tokenRows = voters.flatMap((voter) => positions.map(({ position }) => ({ electionId, voterId: voter.id, position, tokenHash: crypto.randomBytes(32).toString('hex') })));
    const created = tokenRows.length ? await prisma.voteToken.createMany({ data: tokenRows, skipDuplicates: true }) : { count: 0 };
    return res.json({ success: true, count: created.count, positions: positions.map((item) => item.position) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to issue tokens.' });
  }
};
