import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendNotificationToContact } from '../services/notificationService';

const authForUniversity = (req: Request, res: Response) => {
  const auth = (req as any).auth;
  const universityId = req.params.universityId as string;
  if (!auth) { res.status(401).json({ error: 'Unauthorized.' }); return null; }
  if (!['university_admin', 'uni_admin'].includes(auth.role) || auth.universityId !== universityId) {
    res.status(403).json({ error: 'University administrator access required for this institution.' });
    return null;
  }
  return auth;
};

const createAccount = (role: 'staff' | 'observer') => async (req: Request, res: Response) => {
  const auth = authForUniversity(req, res);
  if (!auth) return;
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const name = typeof (req.body.name || req.body.fullName) === 'string' ? (req.body.name || req.body.fullName).trim() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !name) return res.status(400).json({ error: 'A valid email address and full name are required.' });

  try {
    const temporaryPassword = crypto.randomBytes(18).toString('base64url');
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const [firstName, ...rest] = name.split(/\s+/);
    const username = `${email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 30) || role}_${crypto.randomBytes(4).toString('hex')}`;
    const user = await prisma.user.create({
      data: { universityId: auth.universityId, role, username, firstName, secondName: rest.join(' ') || '-', email, phone: phone || null, passwordHash, isActive: true }
    });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: `create_${role}`, resourceType: 'user', resourceId: user.id } });

    let notificationSent = true;
    try {
      await sendNotificationToContact({ to: email, subject: `Your ${role} account`, text: `Hello ${name},\n\nA ${role} account has been created for you. Sign in with this email and temporary password:\n\n${temporaryPassword}\n\nPlease sign in and use Forgot password to set a new password. Keep this password private.` });
    } catch (error) {
      notificationSent = false;
      console.error('Could not send account credentials notification:', error);
    }
    return res.status(201).json({ success: true, notificationSent, account: { id: user.id, name, email: user.email, role: user.role, isActive: user.isActive } });
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'An account with that email already exists.' });
    console.error(error);
    return res.status(500).json({ error: 'Could not create account.' });
  }
};

export const createStaffAccountHandler = createAccount('staff');
export const createObserverAccountHandler = createAccount('observer');

export const listUniversityAccountsHandler = async (req: Request, res: Response) => {
  const auth = authForUniversity(req, res);
  if (!auth) return;
  try {
    const accounts = await prisma.user.findMany({
      where: { universityId: auth.universityId, role: { in: ['staff', 'observer'] } },
      select: { id: true, username: true, firstName: true, secondName: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, accounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const setUniversityAccountStatusHandler = async (req: Request, res: Response) => {
  const auth = authForUniversity(req, res);
  if (!auth) return;
  const userId = req.params.userId as string;
  const suspend = req.params.action === 'suspend';
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  if (suspend && reason.length < 5) return res.status(400).json({ error: 'Please provide a misconduct/suspension reason of at least 5 characters.' });
  try {
    const target = await prisma.user.findFirst({ where: { id: userId, universityId: auth.universityId, role: { in: ['staff', 'observer'] } } });
    if (!target) return res.status(404).json({ error: 'Staff or observer account not found.' });
    const updated = await prisma.user.update({ where: { id: target.id }, data: { isActive: !suspend } });
    await prisma.auditLog.create({
      data: { userId: auth.userId, action: suspend ? 'suspend_account' : 'reactivate_account', resourceType: 'user', resourceId: target.id, details: suspend ? { reason } : { previousStatus: 'suspended' } }
    });
    return res.json({ success: true, account: { id: updated.id, isActive: updated.isActive } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listUniversityAuditLogsHandler = async (req: Request, res: Response) => {
  const auth = authForUniversity(req, res);
  if (!auth) return;
  try {
    const [users, elections, voters] = await Promise.all([
      prisma.user.findMany({ where: { universityId: auth.universityId }, select: { id: true } }),
      prisma.election.findMany({ where: { universityId: auth.universityId }, select: { id: true } }),
      prisma.voter.findMany({ where: { universityId: auth.universityId }, select: { id: true } })
    ]);
    const resourceIds = [...users.map((item) => item.id), ...elections.map((item) => item.id), ...voters.map((item) => item.id)];
    const logs = await prisma.auditLog.findMany({
      where: { OR: [{ userId: { in: users.map((item) => item.id) } }, { resourceId: { in: resourceIds } }] },
      include: { user: { select: { firstName: true, secondName: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return res.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
