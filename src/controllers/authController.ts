import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { comparePasswords, hashPassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import { createAndSendOtp } from '../services/otpService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await comparePasswords(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const token = jwt.sign({ userId: user.id, role: user.role, universityId: user.universityId }, JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { emailOrPhone, channel } = req.body;
  if (!emailOrPhone) return res.status(400).json({ error: 'emailOrPhone required' });

  // Find user by email or phone
  const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
  if (!user) return res.status(200).json({ success: true }); // don't reveal user existence

  try {
    await createAndSendOtp(user.id, channel === 'sms' ? 'sms' : 'email');
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to send otp' });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !otp || !newPassword) return res.status(400).json({ error: 'userId, otp and newPassword required' });

  const record = await prisma.passwordResetOtp.findFirst({ where: { userId, used: false }, orderBy: { createdAt: 'desc' } });
  if (!record) return res.status(400).json({ error: 'invalid or expired otp' });

  const now = new Date();
  if (record.expiresAt < now) return res.status(400).json({ error: 'otp expired' });

  // compare otp
  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare(otp, record.otpHash);
  if (!match) return res.status(400).json({ error: 'invalid otp' });

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } });
  await prisma.passwordResetOtp.update({ where: { id: record.id }, data: { used: true } });

  return res.json({ success: true });
};
