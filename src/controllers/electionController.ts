import { Request, Response } from 'express';
import prisma from '../prismaClient';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';
const singleString = (value: unknown): string => typeof value === 'string' ? value : '';

export const createElectionHandler = async (req: Request, res: Response) => {
  const universityId = singleString(req.params.universityId);
  const auth = (req as any).auth;
  const body = req.body as { title?: unknown; description?: unknown; startAt?: unknown; endAt?: unknown };
  const title = singleString(body?.title).trim();
  const description = singleString(body?.description).trim();
  const startAt = body?.startAt;
  const endAt = body?.endAt;
  const start = new Date(String(startAt ?? ''));
  const end = new Date(String(endAt ?? ''));

  if (!title || !startAt || !endAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: 'A title and valid startAt/endAt dates are required.' });
  }
  if (end <= start) return res.status(400).json({ error: 'Election end time must be after its start time.' });
  if (!auth || !isUniversityAdmin(auth.role) || auth.universityId !== universityId) {
    return res.status(403).json({ error: 'University administrator access required for this institution.' });
  }

  try {
    const election = await prisma.election.create({
      data: {
        title,
        description: description || null,
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

export const listElectionsHandler = async (req: Request, res: Response) => {
  const universityId = singleString(req.params.universityId);
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
  const electionId = singleString(req.params.electionId);
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });
  if (!electionId) return res.status(400).json({ error: 'Election ID is required.' });
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
  const electionId = singleString(req.params.electionId);
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });
  if (!electionId) return res.status(400).json({ error: 'Election ID is required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found.' });
    if (auth.universityId !== election.universityId) return res.status(403).json({ error: 'University access denied.' });
    const candidates = await prisma.candidate.findMany({ where: { electionId } });
    const voteCounts = await prisma.vote.groupBy({ by: ['candidateId', 'candidate'], where: { electionId }, _count: { _all: true } });
    const results = candidates.map((candidate) => ({
      candidateId: candidate.id,
      name: candidate.name ?? candidate.fullName,
      position: candidate.position,
      description: candidate.description,
      votes: voteCounts.filter((vote) => vote.candidateId === candidate.id || (!vote.candidateId && vote.candidate === (candidate.name ?? candidate.fullName))).reduce((sum, vote) => sum + vote._count._all, 0)
    }));
    return res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
