import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { sendSmsViaTwilio } from './smsService';

type Notification = { to: string; subject?: string; text: string };

// Read environment configuration when each message is sent. The server imports
// route modules before dotenv.config() runs, so capturing env values at module load
// makes configured mail providers appear missing.
export const sendEmail = async (to: string, subject: string, text: string) => {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    sgMail.setApiKey(sendgridKey);
    await sgMail.send({ to, from: process.env.EMAIL_FROM || 'info.alrine@gmail.com', subject, text });
    return;
  }
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'info.alrine@gmail.com, to, subject, text });
    return;
  }
  console.log('--- email (fallback) ---');
  console.log(`to: ${to}`);
  console.log(`subject: ${subject}`);
  console.log(text);
  console.log('------------------------');
};

// Never log credential-bearing messages if delivery configuration is missing.
export const sendCredentialEmail = async (notification: Notification) => {
  const configured = Boolean(process.env.SENDGRID_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
  if (!configured) throw new Error('Email delivery is not configured.');
  await sendEmail(notification.to, notification.subject || 'Account credentials', notification.text);
};

export const sendSms = async (to: string, text: string) => {
  try { await sendSmsViaTwilio(to, text); }
  catch (error) {
    console.error('SMS delivery failed:', error);
  }
};

export const sendNotificationToContact = async (notification: Notification) => {
  if (notification.to.includes('@')) await sendEmail(notification.to, notification.subject || 'Notification', notification.text);
  else await sendSms(notification.to, notification.text);
};
