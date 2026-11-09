import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';
import { sendCredentialEmail } from '../services/notificationService';
import { profilePhotoPath } from '../utils/profilePhotoUpload';

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

const cleanupPhoto = (file?: Express.Multer.File) => {
  if (file?.path) fs.unlink(file.path, () => undefined);
};

const createAccount = (role: 'staff' | 'observer') => async (req: Request, res: Response) => {
  const auth = authForUniversity(req, res);
  if (!auth) { cleanupPhoto(req.file); return; }
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const name = typeof (req.body.name || req.body.fullName) === 'string' ? (req.body.name || req.body.fullName).trim() : '';
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !name || !username || !/^[a-zA-Z0-9._-]{3,30}$/.test(username) || !req.file) {
    cleanupPhoto(req.file);
    return res.status(400).json({ error: 'A valid full name, username (3–30 letters, numbers, dots, underscores or hyphens), email, and profile photo are required.' });
  }

  try {
    const temporaryPassword = crypto.randomBytes(18).toString('base64url');
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const [firstName, ...rest] = name.split(/\s+/);
    const university = await prisma.university.findUnique({ where: { id: auth.universityId }, select: { name: true } });
    if (!university) { cleanupPhoto(req.file); return res.status(404).json({ error: 'University not found.' }); }
    const user = await prisma.user.create({
      data: {
        universityId: auth.universityId,
        role,
        username,
        firstName,
        secondName: rest.join(' ') || '-',
        email,
        phone: phone || null,
        photoUrl: `/auth/profile-photos/${req.file.filename}`,
        passwordHash,
        isActive: true
      }
    });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: `create_${role}`, resourceType: 'user', resourceId: user.id } });

    let notificationSent = false;
    try {
      await sendCredentialEmail({
        to: email,
        subject: `Your ${role} account`,
        text: `Hello ${name},\n\nA ${role} account has been created for you at ${university.name}.\n\nUsername: ${username}\nSign in with this email and temporary password:\n\n${temporaryPassword}\n\nPlease sign in and use Forgot password to set a new password. Keep this password private.`
      });
      notificationSent = true;
    } catch (error) {
      console.error('Could not send account credentials notification:', error);
    }
    return res.status(201).json({ success: true, notificationSent, account: { id: user.id, name, username: user.username, photoUrl: user.photoUrl, organizationName: university.name, email: user.email, role: user.role, isActive: user.isActive } });
  } catch (error: any) {
    cleanupPhoto(req.file);
    if (error?.code === 'P2002') return res.status(409).json({ error: 'That email or username is already in use.' });
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
    const [accounts, university] = await Promise.all([
      prisma.user.findMany({
        where: { universityId: auth.universityId, role: { in: ['staff', 'observer'] } },
        select: { id: true, username: true, firstName: true, secondName: true, email: true, photoUrl: true, phone: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.university.findUnique({ where: { id: auth.universityId }, select: { name: true } })
    ]);
    return res.json({ success: true, organizationName: university?.name || null, accounts });
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
