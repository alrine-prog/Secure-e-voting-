import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { sendSmsViaTwilio } from './smsService';

type Notification = { to: string; subject?: string; text: string };

const DEFAULT_FROM = 'info.alrine@gmail.com';

/**
 * Attempts to deliver an email via SendGrid or SMTP based on process.env.
 * Returns `true` if configured and sent, or `false` if no credentials exist.
 */
const deliverEmail = async (to: string, subject: string, text: string): Promise<boolean> => {
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  // 1. SendGrid Provider
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    sgMail.setApiKey(sendgridKey);
    await sgMail.send({ to, from, subject, text });
    return true;
  }

  // 2. SMTP Provider
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({ from, to, subject, text });
    return true;
  }

  return false;
};

// Standard email delivery with console fallback
export const sendEmail = async (to: string, subject: string, text: string) => {
  const sent = await deliverEmail(to, subject, text);
  if (sent) return;

  console.log('--- email (fallback) ---');
  console.log(`to: ${to}`);
  console.log(`subject: ${subject}`);
  console.log(text);
  console.log('------------------------');
};

// Sensitive credential delivery: fails safely without logging payload
export const sendCredentialEmail = async (notification: Notification) => {
  const { to, subject = 'Account Credentials', text } = notification;

  const sent = await deliverEmail(to, subject, text);
  if (!sent) {
    throw new Error('Failed to send credential email: No valid email transport configured (SENDGRID_API_KEY or SMTP credentials required).');
  }
};

/**
 * Sends generic notifications to a contact. Accepts individual parameters or an object.
 */
export const sendNotificationToContact = async (
  toOrNotification: string | Notification,
  subject?: string,
  text?: string
) => {
  if (typeof toOrNotification === 'object') {
    const { to, subject: sub = 'Notification', text: body } = toOrNotification;
    return sendEmail(to, sub, body);
  }

  return sendEmail(toOrNotification, subject || 'Notification', text || '');
};
