// src/middleware/rateLimiters.ts
import rateLimit from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Safely validate that REDIS_URL exists and starts with a valid protocol scheme
const rawRedisUrl = process.env.REDIS_URL?.trim();
const isValidRedisUrl = 
  typeof rawRedisUrl === 'string' && 
  (rawRedisUrl.startsWith('redis://') || rawRedisUrl.startsWith('rediss://'));

const redisClient = isValidRedisUrl ? new Redis(rawRedisUrl) : null;

if (!redisClient) {
  console.warn('⚠️ REDIS_URL missing or invalid. Rate limiter is using default MemoryStore.');
}

/**
 * Creates an express-rate-limit middleware with sane defaults.
 * Automatically uses RedisStore in production/when REDIS_URL is configured.
 */
export const createRateLimiter = (opts?: {
  windowMs?: number;
  max?: number;
  message?: string;
}): RateLimitRequestHandler => {
  const { windowMs = 15 * 60 * 1000, max = 30, message } = opts || {};

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: message || 'Too many requests, please try again later.',
    ...(redisClient && {
      store: new RedisStore({
        // @ts-ignore
        sendCommand: (...args: string[]) => redisClient.call(...args),
      }),
    }),
  });
};
