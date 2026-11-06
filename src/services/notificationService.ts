import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { sendSmsViaTwilio } from './smsService';

type Notification = { to: string; subject?: string; text: string };

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const SMTP_HOST = process.env.SMTP_HOST;
if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY as string);

export const sendEmail = async (to: string, subject: string, text: string) => {
  if (SENDGRID_KEY) {
    await sgMail.send({ to, from: process.env.EMAIL_FROM || 'no-reply@example.com', subject, text });
    return;
  }
  if (SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to, subject, text });
    return;
  }
  console.log('--- email (fallback) ---');
  console.log(`to: ${to}`);
  console.log(`subject: ${subject}`);
  console.log(text);
  console.log('------------------------');
};

// Credential-bearing email must never be written to logs as a fallback.
export const sendCredentialEmail = async (notification: Notification) => {
  const configured = Boolean(SENDGRID_KEY || (SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
  if (!configured) throw new Error('Email delivery is not configured.');
  await sendEmail(notification.to, notification.subject || 'Account credentials', notification.text);
};

export const sendSms = async (to: string, text: string) => {
  try { await sendSmsViaTwilio(to, text); }
  catch (err: any) {
    console.log('--- sms (fallback) ---');
    console.log(`to: ${to}`);
    console.log(text);
    console.log('----------------------');
  }
};

export const sendNotificationToContact = async (n: Notification) => {
  if (n.to.includes('@')) await sendEmail(n.to, n.subject || 'Notification', n.text);
  else await sendSms(n.to, n.text);
};
