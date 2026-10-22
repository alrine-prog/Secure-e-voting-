import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';

// Initialize Redis Client
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Helper to execute Express middleware in Next.js API routes
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Rate Limiter: Max 10 registration attempts per hour per IP
const limiter = rateLimit({
  store: new RedisStore({
    // Cast to 'any' to fix TypeScript build error on Render (SendCommandFn mismatch)
    sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as any,
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many registration requests from this IP. Please try again in an hour.' },
});

// Verify Google reCAPTCHA v3 Token
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY is missing. Skipping verification.');
    return true; // Bypass in dev if secret isn't set
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();
    return Boolean(data.success && data.score >= 0.5);
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Run rate limiter middleware
  try {
    await runMiddleware(req, res, limiter);
  } catch (err) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // 2. Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { name, country, districtCity, admin, recaptchaToken } = req.body || {};

    // 3. Input Validation
    if (
      !name?.trim() ||
      !country?.trim() ||
      !districtCity?.trim() ||
      !admin?.username?.trim() ||
      !admin?.firstName?.trim() ||
      !admin?.email?.trim() ||
      !admin?.password
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // 4. Verify reCAPTCHA token if present
    if (recaptchaToken) {
      const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidCaptcha) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
      }
    }

    // 5. Success Response (Replace or connect your database helper here when ready)
    return res.status(201).json({
      success: true,
      message: 'University registration submitted successfully and is pending approval.',
      data: {
        id: `uni_${Date.now()}`,
        name,
        country,
        districtCity,
        admin: {
          username: admin.username,
          firstName: admin.firstName,
          secondName: admin.secondName,
          email: admin.email,
          phone: admin.phone,
        },
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ error: 'Internal server error occurred.' });
  }
}
