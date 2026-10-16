import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Helper: hash token
const hashToken = async (token: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

// Issue tokens for all approved voters in the university for this election
export const issueTokensHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  const universityId = auth?.universityId;

  if (!universityId) return res.status(401).json({ error: 'unauthenticated' });

  // Verify election belongs to university
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || election.universityId !== universityId) return res.status(404).json({ error: 'election not found' });

  // Find approved voters
  const voters = await prisma.voter.findMany({ where: { universityId, approved: true } });

  const issued: Array<{ voterId: string; token?: string }> = [];

  for (const v of voters) {
    const token = crypto.randomBytes(12).toString('hex');
    const tokenHash = await hashToken(token);
    try {
      await prisma.voteToken.create({ data: { voterId: v.id, electionId, tokenHash } });
      // In a real system, send the plaintext token to the voter via a secure channel
      issued.push({ voterId: v.id, token });
    } catch (err) {
      console.error('token issue error', err);
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: auth.userId,
      action: 'issue_tokens',
      resourceType: 'election',
      resourceId: electionId,
      details: { count: issued.length } as any
    }
  });

  return res.json({ success: true, issued });
};

// Cast vote using token; anonymous (do not link to voter)
export const castVoteHandler = async (req: Request, res: Response) => {
  const electionId = req.params.electionId as string;
  const { token, candidate } = req.body;
  if (!token || !candidate) return res.status(400).json({ error: 'token and candidate required' });

  // Find election
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election) return res.status(404).json({ error: 'election not found' });

  // Hash compare token against stored token hashes
  const tokens = await prisma.voteToken.findMany({ where: { electionId, used: false } });

  let matched: any = null;
  for (const t of tokens) {
    const ok = await bcrypt.compare(token, t.tokenHash);
    if (ok) {
      matched = t;
      break;
    }
  }

  if (!matched) return res.status(400).json({ error: 'invalid or used token' });

  // Ensure voter is approved
  const voter = await prisma.voter.findUnique({ where: { id: matched.voterId } });
  if (!voter || !voter.approved) return res.status(403).json({ error: 'voter not approved' });

  // Atomically mark token used and create vote
  const updateRes = await prisma.voteToken.updateMany({
    where: { id: matched.id, used: false },
    data: { used: true, usedAt: new Date() }
  });
  if (updateRes.count === 0) return res.status(400).json({ error: 'token already used' });

  await prisma.vote.create({ data: { electionId, candidate, tokenHash: matched.tokenHash } });

  return res.json({ success: true });
};
