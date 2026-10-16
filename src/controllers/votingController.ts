import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

// Cast vote using token (anonymous) - updated to verify voter approved status
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
      // find token
      const vt = await tx.voteToken.findUnique({ where: { tokenHash } });
      if (!vt) throw new Error('Invalid token');
      if (vt.electionId !== electionId) throw new Error('Token not valid for this election');
      if (vt.used) throw new Error('Token already used');

      // verify voter is approved
      const voter = await tx.voter.findUnique({ where: { id: vt.voterId } });
      if (!voter) throw new Error('Voter not found');
      if (!voter.approved) throw new Error('Voter not approved');

      // mark token used (ensure single-use)
      const updated = await tx.voteToken.updateMany({ where: { id: vt.id, used: false }, data: { used: true, usedAt: new Date() } });
      if (updated.count !== 1) throw new Error('Token already used');

      // create vote
      const vote = await tx.vote.create({ data: { electionId, candidate, tokenHash } });
      return vote;
    });

    return res.json({ success: true, voteId: result.id });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Failed to cast vote' });
  }
};

// Exported handler required by src/routes/voting.ts
export const issueTokensHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;

  try {
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });

    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    // Fetch approved voters for the election's university
    const voters = await prisma.voter.findMany({
      where: { universityId: election.universityId, approved: true }
    });

    const tokensCreated = [];

    for (const voter of voters) {
      // Check if token already exists for voter in this election
      const existingToken = await prisma.voteToken.findFirst({
        where: { electionId, voterId: voter.id }
      });

      if (!existingToken) {
        const rawToken = crypto.randomBytes(16).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await prisma.voteToken.create({
          data: {
            electionId,
            voterId: voter.id,
            tokenHash,
            used: false
          }
        });

        tokensCreated.push({ voterId: voter.id, token: rawToken });
      }
    }

    return res.json({ success: true, count: tokensCreated.length });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to issue tokens' });
  }
};
