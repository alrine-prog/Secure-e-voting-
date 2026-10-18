import { Request, Response } from 'express';
import { sendEmail } from '../services/notificationService';

export const sendSupportHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

    const to = process.env.SUPPORT_EMAIL || 'albertjesocen@gmail.com';
    const subj = subject || `Support request from ${name}`;

    const text = [
      `Support request from ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'N/A'}`,
      '',
      'Message:',
      message
    ].join('\n');

    await sendEmail(to, subj, text);

    return res.json({ success: true });
  } catch (err: any) {
    console.error('sendSupportHandler error', err);
    return res.status(500).json({ error: 'Failed to send support message' });
  }
};
