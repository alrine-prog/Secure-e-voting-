import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const createElectionHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  const { title, description, startAt, endAt } = req.body;

  if (!title || !startAt || !endAt) {
    return res.status(400).json({ error: 'title, startAt and endAt are required' });
  }

  try {
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    if (auth.universityId !== universityId && auth.role !== 'system_owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const election = await prisma.election.create({
      data: {
        title,
        description: description || null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: 'open',
        university:{
          connect:{ id: universityId},
        },
        createdBy:{
          connect: { id: auth.userId},
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'create_election',
        resourceType: 'election',
        resourceId: election.id
      }
    });

    return res.json({ success: true, election });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCandidateHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const { name, description } = req.body;
  const auth = (req as any).auth;

  if (!name) return res.status(400).json({ error: 'Candidate name is required' });

  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (auth && auth.universityId !== election.universityId && auth.role !== 'system_owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const candidate = await (prisma as any).candidate.create({
      data: { electionId, name, description: description || null }
    });

    await prisma.auditLog.create({
      data: { userId: auth?.userId || null, action: 'add_candidate', resourceType: 'candidate', resourceId: candidate.id }
    });

    return res.json({ success: true, candidate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listElectionsHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;

  try {
    const elections = await prisma.election.findMany({
      where: { universityId }
    });

    // Fetch candidates separately to avoid relation name mismatches
    const candidates = await (prisma as any).candidate.findMany({
      where: { electionId: { in: elections.map(e => e.id) } }
    });

    const results = elections.map(e => ({
      ...e,
      candidates: candidates.filter((c: any) => c.electionId === e.id)
    }));

    return res.json({ success: true, elections: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResultsHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;

  try {
    const election = await prisma.election.findUnique({
      where: { id: electionId }
    });

    if (!election) return res.status(404).json({ error: 'Election not found' });

    const candidates = await (prisma as any).candidate.findMany({
      where: { electionId }
    });

    const votes = await prisma.vote.groupBy({
      by: ['candidate'],
      where: { electionId },
      _count: { candidate: true }
    });

    const results = candidates.map((candidate: any) => {
      const voteEntry = votes.find((v) => v.candidate === candidate.name);
      return {
        candidateId: candidate.id,
        name: candidate.name,
        description: candidate.description,
        votes: voteEntry?._count?.candidate ?? 0
      };
    });

    return res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
