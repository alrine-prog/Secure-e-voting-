import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../prismaClient';

const isUniversityAdmin = (role: unknown) => role === 'university_admin' || role === 'uni_admin';

const cleanText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0].trim();
  return '';
};

const getParam = (param: unknown): string => {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && param.length > 0 && typeof param[0] === 'string') return param[0];
  return '';
};

const cleanupUploadedFile = (file?: Express.Multer.File) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlink(file.path, (err) => {
      if (err) console.error('Failed to cleanup orphan file:', err);
    });
  }
};

type CandidateInput = {
  fullName: string;
  position: string;
  faculty: string;
  college: string;
  party: string;
  symbol: string;
  description: string;
};

type AuthErrorResult = { error: string; status: number };
type AuthSuccessResult = { election: any };
type AuthResult = AuthErrorResult | AuthSuccessResult;

const getAuthorizedElection = async (electionId: string, auth: any): Promise<AuthResult> => {
  if (!auth || !isUniversityAdmin(auth.role)) {
    return { error: 'University administrator access required.', status: 403 };
  }
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election) {
    return { error: 'Election not found', status: 404 };
  }
  if (auth.universityId !== election.universityId) {
    return { error: 'University access denied', status: 403 };
  }
  return { election };
};

const candidateFields = (body: Record<string, unknown> = {}): CandidateInput => ({
  fullName: cleanText(body.fullName),
  position: cleanText(body.position),
  faculty: cleanText(body.faculty),
  college: cleanText(body.college),
  party: cleanText(body.party),
  symbol: cleanText(body.symbol),
  description: cleanText(body.description),
});

const missingRequiredFields = (fields: CandidateInput) =>
  (['fullName', 'position', 'faculty', 'college', 'party', 'symbol'] as const).filter((key) => !fields[key]);

export const createCandidateHandler = async (req: Request, res: Response) => {
  const electionId = getParam(req.params.electionId);
  const auth = (req as any).auth;
  const fields = candidateFields(req.body as Record<string, unknown>);
  const missing = missingRequiredFields(fields);

  if (missing.length) {
    cleanupUploadedFile(req.file);
    return res.status(400).json({ error: `Required candidate fields: ${missing.join(', ')}` });
  }

  try {
    const access = await getAuthorizedElection(electionId, auth);
    if ('error' in access) {
      cleanupUploadedFile(req.file);
      return res.status(access.status).json({ error: access.error });
    }

    const candidate = await prisma.candidate.create({
      data: {
        fullName: fields.fullName,
        position: fields.position,
        faculty: fields.faculty,
        college: fields.college,
        party: fields.party,
        symbol: fields.symbol,
        description: fields.description || undefined,
        photoUrl: req.file ? `/elections/candidate-photos/${req.file.filename}` : undefined,
        electionId,
      },
    });

    await prisma.auditLog.create({
      data: { userId: auth.userId, action: 'add_candidate', resourceType: 'candidate', resourceId: candidate.id },
    });

    return res.status(201).json({ success: true, candidate });
  } catch (error) {
    cleanupUploadedFile(req.file);
    console.error(error);
    return res.status(500).json({ error: 'Could not save candidate. Please try again.' });
  }
};

export const listCandidatesHandler = async (req: Request, res: Response) => {
  const auth = (req as any).auth;
  const electionId = getParam(req.params.electionId);
  try {
    const access = await getAuthorizedElection(electionId, auth);
    if ('error' in access) {
      return res.status(access.status).json({ error: access.error });
    }

    const candidates = await prisma.candidate.findMany({
      where: { electionId: access.election.id },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ success: true, candidates });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not load candidates.' });
  }
};

export const updateCandidateHandler = async (req: Request, res: Response) => {
  const electionId = getParam(req.params.electionId);
  const candidateId = getParam(req.params.candidateId);
  const auth = (req as any).auth;
  const fields = candidateFields(req.body as Record<string, unknown>);
  const missing = missingRequiredFields(fields);

  if (missing.length) {
    cleanupUploadedFile(req.file);
    return res.status(400).json({ error: `Required candidate fields: ${missing.join(', ')}` });
  }

  try {
    const access = await getAuthorizedElection(electionId, auth);
    if ('error' in access) {
      cleanupUploadedFile(req.file);
      return res.status(access.status).json({ error: access.error });
    }

    const existing = await prisma.candidate.findFirst({ where: { id: candidateId, electionId } });
    if (!existing) {
      cleanupUploadedFile(req.file);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        fullName: fields.fullName,
        position: fields.position,
        faculty: fields.faculty,
        college: fields.college,
        party: fields.party,
        symbol: fields.symbol,
        description: fields.description || undefined,
        ...(req.file ? { photoUrl: `/elections/candidate-photos/${req.file.filename}` } : {}),
      },
    });

    await prisma.auditLog.create({
      data: { userId: auth.userId, action: 'update_candidate', resourceType: 'candidate', resourceId: candidate.id },
    });

    return res.json({ success: true, candidate });
  } catch (error) {
    cleanupUploadedFile(req.file);
    console.error(error);
    return res.status(500).json({ error: 'Could not update candidate. Please try again.' });
  }
};

export const getCandidatePhotoHandler = (req: Request, res: Response) => {
  const filename = getParam(req.params.filename);

  if (!filename || !/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename)) {
    return res.status(404).end();
  }

  const photoPath = path.resolve(process.cwd(), 'uploads', 'candidates', filename);
  if (!fs.existsSync(photoPath)) return res.status(404).end();

  return res.sendFile(photoPath);
};
