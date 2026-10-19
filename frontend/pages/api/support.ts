import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// 1. Configure Redis Rate Limiting
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const supportRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Limit each IP to 10 requests per window
  message: { error: 'Too many requests from this IP, please try again after an hour.' },
});

// 2. Function to verify reCAPTCHA token with Google
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true; // Skip verification if secret key isn't configured

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  const data = await response.json();
  return data.success && data.score >= 0.5; // Ensure high trust score for v3
}
