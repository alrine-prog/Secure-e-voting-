import Twilio from 'twilio';

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM;

let client: Twilio.Twilio | null = null;
if (SID && TOKEN) client = Twilio(SID, TOKEN);

export const sendSmsViaTwilio = async (to: string, text: string) => {
  if (!client || !FROM) throw new Error('Twilio not configured');
  return client.messages.create({
    to,
    from: FROM,
    body: text
  });
};
