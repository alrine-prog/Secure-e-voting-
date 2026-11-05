import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

export const castVoteHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const { token, candidate } = req.body;
  if (!token || !candidate) return res.status(400).json({ error: 'token and candidate are required' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    const now = new Date();
    if (now < new Date(election.startAt) || now > new Date(election.endAt)) return res.status(400).json({ error: 'Election not open' });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await prisma.$transaction(async (tx) => {
      const voteToken = await tx.voteToken.findUnique({ where: { tokenHash } });
      if (!voteToken || voteToken.electionId !== electionId || voteToken.used) throw new Error('Invalid or already used token');
      const voter = await tx.voter.findUnique({ where: { id: voteToken.voterId } });
      if (!voter?.approved) throw new Error('Voter is not approved');
      const updated = await tx.voteToken.updateMany({ where: { id: voteToken.id, used: false }, data: { used: true, usedAt: new Date() } });
      if (updated.count !== 1) throw new Error('Token already used');
      return tx.vote.create({ data: { electionId, candidate, tokenHash } });
    });
    return res.json({ success: true, voteId: result.id });
  } catch (error: any) { console.error(error); return res.status(400).json({ error: error.message || 'Failed to cast vote' }); }
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
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Failed to issue tokens' }); }
};
