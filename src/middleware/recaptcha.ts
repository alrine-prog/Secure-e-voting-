// src/middleware/recaptcha.ts
import { Request, Response, NextFunction } from 'express';

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
const DEFAULT_THRESHOLD = Number(process.env.RECAPTCHA_THRESHOLD || 0.5);

// Interface to type Google reCAPTCHA's API response
interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Expects the client to send { recaptchaToken } in the JSON body.
 * For reCAPTCHA v3 we verify score >= threshold. For v2 (checkbox/invisible)
 * the response will be success=true and score may be absent.
 */
export const recaptchaVerify = async (req: Request, res: Response, next: NextFunction) => {
  if (!RECAPTCHA_SECRET) {
    // If not configured, allow (you may prefer to fail closed instead)
    return next();
  }

  const token = (req.body && (req.body.recaptchaToken || req.body.recaptcha)) as string | undefined;
  if (!token) return res.status(400).json({ error: 'Missing recaptcha token' });

  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);

    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params
    });

    // Cast the JSON response to RecaptchaResponse to resolve TS2339 errors
    const data = (await r.json()) as RecaptchaResponse;

    if (!data || !data.success) {
      return res.status(400).json({ error: 'Failed recaptcha verification' });
    }

    // v3 returns a score (0.0 - 1.0). If present, ensure score meets threshold.
    const threshold = DEFAULT_THRESHOLD;
    if (typeof data.score === 'number') {
      if (data.score < threshold) {
        return res.status(400).json({ error: 'reCAPTCHA score too low' });
      }
    }

    // optionally attach verification result to request for logging
    (req as any).recaptcha = data;
    return next();
  } catch (err) {
    console.error('recaptcha verify error', err);
    return res.status(500).json({ error: 'recaptcha verification failed' });
  }
};
