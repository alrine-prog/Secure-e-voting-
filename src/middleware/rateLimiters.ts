// src/middleware/rateLimiters.ts
import rateLimit from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Create an express-rate-limit middleware with sane defaults.
 * Use this per-route to protect sensitive endpoints.
 *
 * Important: the default memory store is NOT suitable for multi-instance production.
 * For production, configure a Redis store (see notes below).
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
    // store: new RedisStore({ client: redisClient }) // uncomment in production
  });
};
