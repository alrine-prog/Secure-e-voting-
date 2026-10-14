import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { sendNotificationToContact } from '../services/notificationService';

// Approve a voter and send them a notification
export const approveVoterHandler = async (req: Request, res: Response) => {
  const { universityId, voterId } = req.params;
  const adminUserId = (req as any).auth?.userId || 'unknown';

  try {
    const voter = await prisma.voter.findUnique({ where: { id: voterId } });
    if (!voter) return res.status(404).json({ error: 'Voter not found' });
    if (voter.universityId !== universityId) return res.status(400).json({ error: 'Voter does not belong to the university' });

    const updated = await prisma.voter.update({
      where: { id: voterId },
      data: { approved: true }
    });

    // send notification to the voter (email or SMS depending on available contact)
    const contact = updated.email || updated.phone;
    if (contact) {
      await sendNotificationToContact({
        to: contact,
        subject: 'You have been approved to vote',
        text: `Hello ${updated.firstName},\n\nYou have been approved to participate in upcoming elections at ${universityId}.\n\nRegards,\nUniversity Admin`
      });
    }

    await prisma.auditLog.create({ data: { userId: adminUserId, action: 'approve_voter', resourceType: 'voter', resourceId: voterId } });

    return res.json({ success: true, voter: { id: updated.id, approved: updated.approved } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Notify all approved voters for a given election
export const notifyApprovedVotersHandler = async (req: Request, res: Response) => {
  const { universityId, electionId } = req.params;
  const { subject, message, channel } = req.body; // channel optional: 'email' or 'sms' or 'both'
  const adminUserId = (req as any).auth?.userId || 'unknown';

  if (!subject || !message) return res.status(400).json({ error: 'subject and message are required' });

  try {
    // Verify election belongs to university
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.universityId !== universityId) return res.status(400).json({ error: 'Election does not belong to the university' });

    const approvedVoters = await prisma.voter.findMany({ where: { universityId, approved: true } });

    const results: Array<{ voterId: string; sentTo?: string; error?: string }> = [];

    for (const v of approvedVoters) {
      const contactMethods = [] as string[];
      if ((channel === 'email' || channel === 'both' || !channel) && v.email) contactMethods.push(v.email);
      if ((channel === 'sms' || channel === 'both' || !channel) && v.phone) contactMethods.push(v.phone!);

      for (const c of contactMethods) {
        try {
          await sendNotificationToContact({ to: c, subject, text: message });
          results.push({ voterId: v.id, sentTo: c });
        } catch (e: any) {
          results.push({ voterId: v.id, error: e.message || 'failed to send' });
        }
      }
    }

    await prisma.auditLog.create({ data: { userId: adminUserId, action: 'notify_approved_voters', resourceType: 'election', resourceId: electionId, details: { count: results.length } as any } });

    return res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
