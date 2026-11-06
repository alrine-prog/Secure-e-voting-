import { Request, Response } from 'express';
import prisma from '../prismaClient';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

export const createElectionHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  const { title, description, startAt, endAt } = req.body;
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (!title?.trim() || !startAt || !endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: 'A title and valid startAt/endAt dates are required.' });
  }
  if (end <= start) return res.status(400).json({ error: 'Election end time must be after its start time.' });
  if (!auth || !isUniversityAdmin(auth.role) || auth.universityId !== universityId) {
    return res.status(403).json({ error: 'University administrator access required for this institution.' });
  }

  try {
    const election = await prisma.election.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startAt: start,
        endAt: end,
        status: 'draft',
        universityId,
        createdById: auth.userId
      }
    });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'create_election', resourceType: 'election', resourceId: election.id } });
    return res.status(201).json({ success: true, election });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCandidateHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const position = typeof req.body.position === 'string' ? req.body.position.trim() : '';
  const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
  if (!name || !position) return res.status(400).json({ error: 'Candidate name and election post/position are required.' });
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });

  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    if (auth.universityId !== election.universityId) return res.status(403).json({ error: 'University access denied.' });
    if (election.status !== 'draft') return res.status(409).json({ error: 'Candidates can only be added while an election is in draft.' });

    const candidate = await prisma.candidate.create({ data: { electionId, name, position, description: description || null } });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'add_candidate', resourceType: 'candidate', resourceId: candidate.id, details: { electionId, position } } });
    return res.status(201).json({ success: true, candidate });
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'That candidate is already registered for this post.' });
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listElectionsHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role) || auth.universityId !== universityId) return res.status(403).json({ error: 'University access denied.' });
  try {
    const elections = await prisma.election.findMany({ where: { universityId }, include: { candidates: { orderBy: [{ position: 'asc' }, { name: 'asc' }] } }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, elections });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const setElectionStatus = async (req: Request, res: Response, status: 'open' | 'closed') => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId }, include: { _count: { select: { candidates: true } } } });
    if (!election || election.universityId !== auth.universityId) return res.status(404).json({ error: 'Election not found for this university.' });
    if (status === 'open') {
      if (election.status !== 'draft') return res.status(409).json({ error: 'Only draft elections can be opened.' });
      if (election._count.candidates === 0) return res.status(400).json({ error: 'Add at least one candidate before opening the election.' });
      if (new Date(election.endAt) <= new Date()) return res.status(400).json({ error: 'This election has already passed its end time.' });
    } else if (election.status !== 'open') {
      return res.status(409).json({ error: 'Only open elections can be closed.' });
    }
    const updated = await prisma.election.update({ where: { id: electionId }, data: { status } });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: status === 'open' ? 'open_election' : 'close_election', resourceType: 'election', resourceId: electionId } });
    return res.json({ success: true, election: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const openElectionHandler = (req: Request, res: Response) => setElectionStatus(req, res, 'open');
export const closeElectionHandler = (req: Request, res: Response) => setElectionStatus(req, res, 'closed');

export const getResultsHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    if (auth.universityId !== election.universityId) return res.status(403).json({ error: 'University access denied.' });
    const candidates = await prisma.candidate.findMany({ where: { electionId } });
    const voteCounts = await prisma.vote.groupBy({ by: ['candidateId', 'candidate'], where: { electionId }, _count: { _all: true } });
    const results = candidates.map((candidate) => ({
      candidateId: candidate.id,
      name: candidate.name,
      position: candidate.position,
      description: candidate.description,
      votes: voteCounts.filter((vote) => vote.candidateId === candidate.id || (!vote.candidateId && vote.candidate === candidate.name)).reduce((sum, vote) => sum + vote._count._all, 0)
    }));
    return res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
