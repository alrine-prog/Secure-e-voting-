import { Request, Response } from 'express';
import prisma from '../prismaClient';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

export const createElectionHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  const { title, description, startAt, endAt } = req.body;
  if (!title || !startAt || !endAt) return res.status(400).json({ error: 'title, startAt and endAt are required' });
  if (!auth || !isUniversityAdmin(auth.role) || auth.universityId !== universityId) return res.status(403).json({ error: 'University administrator access required for this institution.' });

  try {
    const election = await prisma.election.create({ data: { title, description: description || null, startAt: new Date(startAt), endAt: new Date(endAt), status: 'open', university: { connect: { id: universityId } }, createdBy: { connect: { id: auth.userId } } } });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'create_election', resourceType: 'election', resourceId: election.id } });
    return res.json({ success: true, election });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
};

export const addCandidateHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const { name, description } = req.body;
  const auth = (req as any).auth;
  if (!name) return res.status(400).json({ error: 'Candidate name is required' });
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (auth.universityId !== election.universityId) return res.status(403).json({ error: 'University access denied' });
    const candidate = await (prisma as any).candidate.create({ data: { electionId, name, description: description || null } });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'add_candidate', resourceType: 'candidate', resourceId: candidate.id } });
    return res.json({ success: true, candidate });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
};

export const listElectionsHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role) || auth.universityId !== universityId) return res.status(403).json({ error: 'University access denied' });
  try {
    const elections = await prisma.election.findMany({ where: { universityId } });
    const candidates = await (prisma as any).candidate.findMany({ where: { electionId: { in: elections.map((e) => e.id) } } });
    return res.json({ success: true, elections: elections.map((e) => ({ ...e, candidates: candidates.filter((candidate: any) => candidate.electionId === e.id) })) });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
};

export const getResultsHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  if (!auth || !isUniversityAdmin(auth.role)) return res.status(403).json({ error: 'University administrator access required.' });
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (auth.universityId !== election.universityId) return res.status(403).json({ error: 'University access denied' });
    const candidates = await (prisma as any).candidate.findMany({ where: { electionId } });
    const votes = await prisma.vote.groupBy({ by: ['candidate'], where: { electionId }, _count: { candidate: true } });
    const results = candidates.map((candidate: any) => ({ candidateId: candidate.id, name: candidate.name, description: candidate.description, votes: votes.find((vote) => vote.candidate === candidate.name)?._count?.candidate ?? 0 }));
    return res.json({ success: true, results });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
};
