import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendNotificationToContact } from '../services/notificationService';
import { signJwt } from '../utils/jwt';

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt({ userId: user.id, role: user.role, universityId: user.universityId });
    const cookieOptions: any = { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000 };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('token', token, cookieOptions);
    return res.json({ user: { id: user.id, email: user.email, role: user.role, universityId: user.universityId, mustChangePassword: user.mustChangePassword } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const userId = (req as any).auth?.userId;
  const { currentPassword, newPassword } = req.body;
  if (!userId) return res.status(401).json({ error: 'Authentication required.' });
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') return res.status(400).json({ error: 'Current and new passwords are required.' });
  if (newPassword.length < 12) return res.status(400).json({ error: 'New password must be at least 12 characters.' });
  if (newPassword === currentPassword) return res.status(400).json({ error: 'Choose a password different from the temporary password.' });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid or inactive account.' });
    if (!await bcrypt.compare(currentPassword, user.passwordHash)) return res.status(400).json({ error: 'Current password is incorrect.' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash, mustChangePassword: false } });
    await prisma.auditLog.create({ data: { userId, action: 'change_password', resourceType: 'user', resourceId: userId } });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Could not change password.' });
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { emailOrPhone, channel } = req.body;
  if (!emailOrPhone) return res.status(400).json({ error: 'emailOrPhone required' });
  try {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.passwordResetOtp.create({ data: { userId: user.id, otpHash, channel: channel || 'email', expiresAt } });
    const contact = channel === 'sms' ? user.phone : user.email;
    if (contact) await sendNotificationToContact({ to: contact, subject: 'Password reset OTP', text: `Your OTP is: ${otp}. It expires in 10 minutes.` });
    await prisma.auditLog.create({ data: { userId: user.id, action: 'request_password_reset', resourceType: 'user', resourceId: user.id } });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { emailOrPhone, otp, newPassword } = req.body;
  if (!emailOrPhone || !otp || !newPassword) return res.status(400).json({ error: 'emailOrPhone, otp and newPassword required' });
  if (typeof newPassword !== 'string' || newPassword.length < 12) return res.status(400).json({ error: 'New password must be at least 12 characters.' });
  try {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const reset = await prisma.passwordResetOtp.findFirst({ where: { userId: user.id, otpHash, used: false, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if (!reset) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } }),
      prisma.passwordResetOtp.update({ where: { id: reset.id }, data: { used: true } }),
      prisma.auditLog.create({ data: { userId: user.id, action: 'reset_password', resourceType: 'user', resourceId: user.id } })
    ]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
