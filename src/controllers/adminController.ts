import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { sendNotificationToContact } from '../services/notificationService';

export const listPendingUniversitiesHandler = async (req: Request, res: Response) => {
  try {
    const pending = await prisma.university.findMany({ where: { status: 'pending' } });
    return res.json({ success: true, universities: pending });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveUniversityHandler = async (req: Request, res: Response) => {
  const { universityId } = req.params;
  const adminUserId = (req as any).auth?.userId || null;

  try {
    const uni = await prisma.university.findUnique({ where: { id: universityId } });
    if (!uni) return res.status(404).json({ error: 'University not found' });
    if (uni.status === 'approved') return res.status(400).json({ error: 'University already approved' });

    // set university approved
    await prisma.university.update({ where: { id: universityId }, data: { status: 'approved' } });

    // activate the university_admin user(s)
    const admins = await prisma.user.findMany({ where: { universityId, role: 'university_admin' } });
    for (const a of admins) {
      await prisma.user.update({ where: { id: a.id }, data: { isActive: true } });
      // notify admin
      const contact = a.email || a.phone;
      if (contact) {
        await sendNotificationToContact({ to: contact, subject: 'University Approved', text: `Your university ${uni.name} has been approved. You can now log in.` });
      }
    }

    await prisma.auditLog.create({ data: { userId: adminUserId, action: 'approve_university', resourceType: 'university', resourceId: universityId } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectUniversityHandler = async (req: Request, res: Response) => {
  const { universityId } = req.params;
  const { reason } = req.body;
  const adminUserId = (req as any).auth?.userId || null;

  try {
    const uni = await prisma.university.findUnique({ where: { id: universityId } });
    if (!uni) return res.status(404).json({ error: 'University not found' });

    await prisma.university.update({ where: { id: universityId }, data: { status: 'rejected' } });

    // notify admins
    const admins = await prisma.user.findMany({ where: { universityId, role: 'university_admin' } });
    for (const a of admins) {
      const contact = a.email || a.phone;
      if (contact) {
        await sendNotificationToContact({ to: contact, subject: 'University Registration Rejected', text: `Your university ${uni.name} has been rejected. Reason: ${reason || 'No reason provided'}` });
      }
    }

    await prisma.auditLog.create({ data: { userId: adminUserId, action: 'reject_university', resourceType: 'university', resourceId: universityId, details: { reason } as any } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUniversitySummaryHandler = async (req: Request, res: Response) => {
  const { universityId } = req.params;

  try {
    const totalVoters = await prisma.voter.count({ where: { universityId } });
    const approvedVoters = await prisma.voter.count({ where: { universityId, approved: true } });
    const pendingVoters = totalVoters - approvedVoters;
    const elections = await prisma.election.findMany({ where: { universityId } });

    return res.json({ success: true, summary: { totalVoters, approvedVoters, pendingVoters, electionsCount: elections.length } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
