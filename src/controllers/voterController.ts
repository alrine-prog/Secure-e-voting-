import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { sendNotificationToContact } from '../services/notificationService';

export const approveVoterHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const voterId = req.params.voterId as string;
  const adminUserId = (req as any).auth?.userId || null;
  try {
    const voter = await prisma.voter.findUnique({ where: { id: voterId } });
    if (!voter || voter.universityId !== universityId) return res.status(404).json({ error: 'Voter not found for this university.' });
    const updated = await prisma.voter.update({ where: { id: voterId }, data: { approved: true } });
    const contact = updated.email || updated.phone;
    if (contact) await sendNotificationToContact({ to: contact, subject: 'You have been approved to vote', text: `Hello ${updated.firstName},\n\nYou have been approved to participate in upcoming elections at your university.\n\nRegards,\nUniversity Admin` });
    await prisma.auditLog.create({ data: { userId: adminUserId, action: 'approve_voter', resourceType: 'voter', resourceId: voterId } });
    return res.json({ success: true, voter: { id: updated.id, approved: updated.approved } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const notifyApprovedVotersHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const electionId = req.params.electionId as string;
  const auth = (req as any).auth;
  try {
    const election = await prisma.election.findUnique({ where: { id: electionId }, include: { university: { select: { name: true } } } });
    if (!election || election.universityId !== universityId) return res.status(404).json({ error: 'Election not found for this university.' });
    if (election.status === 'closed' || election.endAt <= new Date()) return res.status(400).json({ error: 'Cannot send an upcoming-election notice for a closed/past election.' });
    const subject = typeof req.body.subject === 'string' && req.body.subject.trim() ? req.body.subject.trim() : `Upcoming election: ${election.title}`;
    const message = typeof req.body.message === 'string' && req.body.message.trim()
      ? req.body.message.trim()
      : `Hello,\n\n${election.university.name} has an upcoming election: ${election.title}.\nVoting is scheduled from ${election.startAt.toISOString()} until ${election.endAt.toISOString()}. Please sign in to the voting portal during the election period.\n\nUniversity Election Office`;
    const channel = ['email', 'sms', 'both'].includes(req.body.channel) ? req.body.channel : 'both';
    const voters = await prisma.voter.findMany({ where: { universityId, approved: true }, select: { id: true, email: true, phone: true } });
    let sent = 0;
    let failed = 0;
    for (const voter of voters) {
      const contacts = [
        ...(channel === 'email' || channel === 'both' ? [voter.email] : []),
        ...(channel === 'sms' || channel === 'both' ? [voter.phone] : [])
      ].filter((contact): contact is string => Boolean(contact));
      for (const to of contacts) {
        try { await sendNotificationToContact({ to, subject, text: message }); sent += 1; }
        catch (error) { failed += 1; console.error(`Notification failed for voter ${voter.id}:`, error); }
      }
    }
    await prisma.auditLog.create({ data: { userId: auth?.userId || null, action: 'notify_approved_voters', resourceType: 'election', resourceId: electionId, details: { sent, failed, channel } } });
    return res.json({ success: true, sent, failed, voters: voters.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not send election notifications.' });
  }
};
