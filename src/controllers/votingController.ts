import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendNotificationToContact } from '../services/notificationService';

// Issue one-time tokens for all approved voters in the election's university
export const issueTokensHandler = async (req: Request, res: Response) => {
  const { electionId } = req.params;
  const auth = (req as any).auth;
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    // verify the requester belongs to the same university (if auth present)
    if (auth && auth.universityId !== election.universityId && auth.role !== 'system_owner') return res.status(403).json({ error: 'Forbidden' });

    const approvedVoters = await prisma.voter.findMany({ where: { universityId: election.universityId, approved: true } });

    const results: Array<{ voterId: string; sentTo?: string; token?: string; error?: string }> = [];

    for (const v of approvedVoters) {
      try {
        // generate random token
        const token = crypto.randomBytes(8).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        await prisma.voteToken.create({ data: { voterId: v.id, electionId, tokenHash } });

        // send token to voter via email or sms
        const contact = v.email || v.phone;
        if (contact) {
          const message = `Dear ${v.firstName},\n\nYour voting token for election \"${election.title}\" is: ${token}\n\nKeep it safe and use it once to cast your vote.`;
          await sendNotificationToContact({ to: contact, subject: 'Your voting token', text: message });
          results.push({ voterId: v.id, sentTo: contact });
        } else {
          results.push({ voterId: v.id, token }); // no contact; return token in response (admin only)
        }
      } catch (e: any) {
        results.push({ voterId: v.id, error: e.message || 'failed' });
      }
    }

    await prisma.auditLog.create({ data: { userId: auth?.userId || null, action: 'issue_tokens', resourceType: 'election', resourceId: electionId, details: { count: results.length } as any } });

    return res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Cast vote using token (anonymous)
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

    // Try to atomically mark token used and create vote
    const result = await prisma.$transaction(async (tx) => {
      // mark token used if not used
      const updated = await tx.voteToken.updateMany({ where: { tokenHash, electionId, used: false }, data: { used: true, usedAt: new Date() } });
      if (updated.count !== 1) {
        throw new Error('Invalid or already used token');
      }

      // create vote (store tokenHash only, not voterId)
      const vote = await tx.vote.create({ data: { electionId, candidate, tokenHash } });
      return vote;
    });

    return res.json({ success: true, voteId: result.id });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: err.message || 'Failed to cast vote' });
  }
};
