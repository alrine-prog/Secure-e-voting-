import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

// Cast vote using token (anonymous) - updated to verify voter approved status
export const castVoteHandler = async (req: Request, res: Response) => {
  const { electionId } = req.params;
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
