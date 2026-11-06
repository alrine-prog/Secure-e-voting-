import { Request, Response } from 'express';
import prisma from '../prismaClient';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendCredentialEmail } from '../services/notificationService';
import { signJwt } from '../utils/jwt';

const PASSWORD_MIN_LENGTH = 12;
const passwordIsStrong = (password: string) =>
  password.length >= PASSWORD_MIN_LENGTH && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);

const cookieOptions = () => {
  const options: any = { httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000, path: '/' };
  if (process.env.NODE_ENV === 'production') options.secure = true;
  return options;
};

export const loginHandler = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body.password;
  if (!email || typeof password !== 'string' || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive || !await bcrypt.compare(password, user.passwordHash)) {
      res.clearCookie('token', { path: '/' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signJwt({ userId: user.id, role: user.role, universityId: user.universityId });
    res.cookie('token', token, cookieOptions());
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
        mustChangePassword: user.mustChangePassword
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: 'Unable to sign in right now.' });
  }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const userId = (req as any).auth?.userId as string | undefined;
  const { currentPassword, newPassword } = req.body;
  if (!userId) return res.status(401).json({ error: 'Authentication required.' });
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') return res.status(400).json({ error: 'Current and new passwords are required.' });
  if (!passwordIsStrong(newPassword)) return res.status(400).json({ error: 'New password must be at least 12 characters and include upper/lowercase letters, a number, and a symbol.' });
  if (newPassword === currentPassword) return res.status(400).json({ error: 'Choose a password different from your temporary/current password.' });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid or inactive account.' });
    if (!await bcrypt.compare(currentPassword, user.passwordHash)) return res.status(400).json({ error: 'Current password is incorrect.' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash, mustChangePassword: false } }),
      prisma.auditLog.create({ data: { userId, action: 'change_password', resourceType: 'user', resourceId: userId } })
    ]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Password change failed:', error);
    return res.status(500).json({ error: 'Could not change password.' });
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  return res.json({ success: true });
};

// Always return the same response for known and unknown accounts. Reset codes are
// emailed only through a configured provider; they are never logged as fallback output.
export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase()
    : typeof req.body.emailOrPhone === 'string' ? req.body.emailOrPhone.trim().toLowerCase() : '';
  const genericResponse = { success: true, message: 'If that account exists, password reset instructions will be emailed.' };
  if (!email) return res.status(200).json(genericResponse);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(200).json(genericResponse);

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const reset = await prisma.passwordResetOtp.create({ data: { userId: user.id, otpHash, channel: 'email', expiresAt } });
    try {
      await sendCredentialEmail({ to: user.email, subject: 'Password reset code', text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.` });
    } catch (error) {
      await prisma.passwordResetOtp.update({ where: { id: reset.id }, data: { used: true } });
      console.error('Password-reset email delivery failed.');
      return res.status(200).json(genericResponse);
    }
    await prisma.auditLog.create({ data: { userId: user.id, action: 'request_password_reset', resourceType: 'user', resourceId: user.id } });
    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Password reset request failed:', error);
    return res.status(200).json(genericResponse);
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase()
    : typeof req.body.emailOrPhone === 'string' ? req.body.emailOrPhone.trim().toLowerCase() : '';
  const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
  const newPassword = req.body.newPassword;
  if (!email || !/^\d{6}$/.test(otp) || typeof newPassword !== 'string') return res.status(400).json({ error: 'A valid email, six-digit code, and new password are required.' });
  if (!passwordIsStrong(newPassword)) return res.status(400).json({ error: 'New password must be at least 12 characters and include upper/lowercase letters, a number, and a symbol.' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(400).json({ error: 'Invalid or expired reset code.' });
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const reset = await prisma.passwordResetOtp.findFirst({
      where: { userId: user.id, otpHash, channel: 'email', used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
    if (!reset) return res.status(400).json({ error: 'Invalid or expired reset code.' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetOtp.updateMany({ where: { id: reset.id, used: false, expiresAt: { gt: new Date() } }, data: { used: true } });
      if (claimed.count !== 1) throw new Error('RESET_CODE_ALREADY_USED');
      await tx.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } });
      await tx.auditLog.create({ data: { userId: user.id, action: 'reset_password', resourceType: 'user', resourceId: user.id } });
    });
    res.clearCookie('token', { path: '/' });
    return res.json({ success: true, message: 'Password updated. Sign in with your new password.' });
  } catch (error: any) {
    if (error?.message === 'RESET_CODE_ALREADY_USED') return res.status(400).json({ error: 'Invalid or expired reset code.' });
    console.error('Password reset failed:', error);
    return res.status(500).json({ error: 'Could not reset password.' });
  }
};
