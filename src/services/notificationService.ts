import nodemailer from 'nodemailer';

type Notification = {
  to: string;
  subject: string;
  text: string;
};

export const sendNotificationToContact = async (n: Notification) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to: n.to, subject: n.subject, text: n.text });
    return;
  }

  // Fallback: log to console
  console.log('--- notification (fallback) ---');
  console.log(`to: ${n.to}`);
  console.log(`subject: ${n.subject}`);
  console.log(n.text);
  console.log('------------------------------');
};
