import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

export const castVoteHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const { token, candidateId, candidate, position } = req.body;

  if (!token || (!candidateId && !candidate)) {
    return res.status(400).json({ error: 'token and a candidate selection are required.' });
  }

  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    const now = new Date();
    if (election.status !== 'open' || now < election.startAt || now > election.endAt) {
      return res.status(400).json({ error: 'Election is not currently open for voting.' });
    }

    const candidateRecord = candidateId
      ? await prisma.candidate.findFirst({ where: { id: candidateId, electionId } })
      : await prisma.candidate.findFirst({ where: { electionId, name: String(candidate).trim() } });

    if (!candidateRecord) return res.status(400).json({ error: 'Select a registered candidate for this election.' });

    const effectivePosition = (position || candidateRecord.position || '').toString().trim();
    if (!effectivePosition) return res.status(400).json({ error: 'The selected position is required.' });
    if (candidateRecord.position !== effectivePosition) {
      return res.status(400).json({ error: 'The selected candidate does not belong to the chosen post.' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const result = await prisma.$transaction(async (tx) => {
      const voteToken = await tx.voteToken.findUnique({ where: { tokenHash } });
      if (!voteToken || voteToken.electionId !== electionId) throw new Error('Invalid token.');
      if (voteToken.position !== effectivePosition) throw new Error('This token is for a different election post.');
      if (voteToken.used) throw new Error('This vote was already cast for this post.');

      const voter = await tx.voter.findUnique({ where: { id: voteToken.voterId } });
      if (!voter?.approved || voter.universityId !== election.universityId) throw new Error('Voter is not approved for this election.');

      const alreadyVotedForPosition = await tx.vote.findFirst({
        where: { electionId, tokenHash: { not: tokenHash }, candidateId: candidateRecord.id }
      });
      if (alreadyVotedForPosition) {
        throw new Error('A vote has already been cast for this post by the same voter.');
      }

      const updated = await tx.voteToken.updateMany({
        where: { id: voteToken.id, used: false },
        data: { used: true, usedAt: new Date() }
      });
      if (updated.count !== 1) throw new Error('This token was already used.');

      return tx.vote.create({
        data: {
          electionId,
          candidate: candidateRecord.name,
          candidateId: candidateRecord.id,
          position: effectivePosition,
          tokenHash
        }
      });
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

    const positions = await prisma.candidate.groupBy({
      by: ['position'],
      where: { electionId }
    });

    const voters = await prisma.voter.findMany({ where: { universityId: auth.universityId, approved: true } });
    let count = 0;

    for (const voter of voters) {
      for (const position of positions) {
        const effectivePosition = position.position;
        const existingToken = await prisma.voteToken.findFirst({ where: { electionId, voterId: voter.id, position: effectivePosition } });
        if (!existingToken) {
          const rawToken = crypto.randomBytes(16).toString('hex');
          const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
          await prisma.voteToken.create({
            data: {
              electionId,
              voterId: voter.id,
              position: effectivePosition,
              tokenHash,
              used: false
            }
          });
          count += 1;
        }
      }
    }

    return res.json({ success: true, count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to issue tokens.' });
  }
};
