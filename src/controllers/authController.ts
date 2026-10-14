import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendNotificationToContact } from '../services/notificationService';

// login
export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // create JWT
    const jwt = (await import('../utils/jwt')).signJwt({ userId: user.id, role: user.role, universityId: user.universityId });

    return res.json({ token: jwt, user: { id: user.id, email: user.email, role: user.role, universityId: user.universityId } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password -> create OTP and send
export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { emailOrPhone, channel } = req.body; // channel: email|sms
  if (!emailOrPhone) return res.status(400).json({ error: 'emailOrPhone required' });

  try {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.passwordResetOtp.create({ data: { userId: user.id, otpHash, channel: channel || 'email', expiresAt } });

    const contact = channel === 'sms' ? user.phone : user.email;
    if (contact) {
      await sendNotificationToContact({ to: contact, subject: 'Password reset OTP', text: `Your OTP is: ${otp}. It expires in 10 minutes.` });
    }

    await prisma.auditLog.create({ data: { userId: user.id, action: 'request_password_reset', resourceType: 'user', resourceId: user.id } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password using OTP
export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { emailOrPhone, otp, newPassword } = req.body;
  if (!emailOrPhone || !otp || !newPassword) return res.status(400).json({ error: 'emailOrPhone, otp and newPassword required' });

  try {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const pr = await prisma.passwordResetOtp.findFirst({ where: { userId: user.id, otpHash, used: false, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if (!pr) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.passwordResetOtp.update({ where: { id: pr.id }, data: { used: true } });

    await prisma.auditLog.create({ data: { userId: user.id, action: 'reset_password', resourceType: 'user', resourceId: user.id } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
