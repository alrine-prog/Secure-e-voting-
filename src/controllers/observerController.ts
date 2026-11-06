import { Request, Response } from 'express';
import prisma from '../prismaClient';

const getObserverAuth = (req: Request, res: Response) => {
  const auth = (req as any).auth;
  if (!auth) { res.status(401).json({ error: 'Authentication required.' }); return null; }
  if (auth.role !== 'observer' || !auth.universityId) {
    res.status(403).json({ error: 'University observer access required.' });
    return null;
  }
  return auth;
};

export const listObserverElectionsHandler = async (req: Request, res: Response) => {
  const auth = getObserverAuth(req, res);
  if (!auth) return;
  try {
    const elections = await prisma.election.findMany({
      where: { universityId: auth.universityId },
      select: { id: true, title: true, description: true, startAt: true, endAt: true, status: true },
      orderBy: [{ startAt: 'desc' }]
    });
    return res.json({ success: true, elections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not load university elections.' });
  }
};

export const getObserverElectionTallyHandler = async (req: Request, res: Response) => {
  const auth = getObserverAuth(req, res);
  if (!auth) return;
  const electionId = req.params.electionId as string;
  try {
    const election = await prisma.election.findFirst({
      where: { id: electionId, universityId: auth.universityId },
      select: { id: true, title: true, description: true, startAt: true, endAt: true, status: true }
    });
    if (!election) return res.status(404).json({ error: 'Election not found for this university.' });

    const [approvedVoters, candidates, votes] = await Promise.all([
      prisma.voter.count({ where: { universityId: auth.universityId, approved: true } }),
      prisma.candidate.findMany({ where: { electionId }, orderBy: [{ position: 'asc' }, { name: 'asc' }] }),
      prisma.vote.findMany({ where: { electionId }, select: { candidateId: true, candidate: true, tokenHash: true } })
    ]);

    // Count unique approved voters with at least one ballot, rather than total votes across posts.
    const votedVoterIds = votes.length
      ? await prisma.voteToken.findMany({
          where: { electionId, used: true, voter: { approved: true, universityId: auth.universityId } },
          select: { voterId: true },
          distinct: ['voterId']
        })
      : [];
    const votersVoted = Math.min(approvedVoters, votedVoterIds.length);
    const votesByPosition = new Map<string, { position: string; totalVotes: number; candidates: Array<{ id: string; name: string; description: string | null; votes: number; percentage: number }> }>();

    for (const candidate of candidates) {
      const candidateVotes = votes.filter((vote) => vote.candidateId === candidate.id || (!vote.candidateId && vote.candidate === candidate.name)).length;
      const positionData = votesByPosition.get(candidate.position) || { position: candidate.position, totalVotes: 0, candidates: [] };
      positionData.totalVotes += candidateVotes;
      positionData.candidates.push({ id: candidate.id, name: candidate.name, description: candidate.description, votes: candidateVotes, percentage: 0 });
      votesByPosition.set(candidate.position, positionData);
    }

    const positions = Array.from(votesByPosition.values()).map((position) => ({
      ...position,
      candidates: position.candidates.map((candidate) => ({
        ...candidate,
        percentage: position.totalVotes ? Number(((candidate.votes / position.totalVotes) * 100).toFixed(1)) : 0
      }))
    }));

    return res.json({
      success: true,
      election,
      summary: {
        approvedVoters,
        votersVoted,
        votersRemaining: Math.max(approvedVoters - votersVoted, 0),
        totalBallotsCast: votes.length,
        turnoutPercentage: approvedVoters ? Number(((votersVoted / approvedVoters) * 100).toFixed(1)) : 0
      },
      positions,
      refreshedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not load election tally.' });
  }
};
