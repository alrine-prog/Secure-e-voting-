import prisma from '../prismaClient';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const createAndSendOtp = async (userId: string, channel: 'email' | 'sms' | 'both') => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.passwordResetOtp.create({ data: { userId, otpHash: hash, channel, expiresAt } });

  // send via email if user has email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  if (((channel as string) === 'email' || (channel as string) === 'both') && user.email) {
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to: user.email, subject: 'Password reset OTP', text: `Your OTP is: ${otp}` });
      return;
    }
  }

  // Fallback to console or SMS (not implemented)
  console.log('OTP for user', userId, otp);
};
