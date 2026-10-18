import express from 'express';
import { createRateLimiter } from '../middleware/rateLimiters';
import { recaptchaVerify } from '../middleware/recaptcha';
import { sendSupportHandler } from '../controllers/supportController';

const router = express.Router();

const supportLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 6, message: 'Too many contact requests; wait 1 hour.' });

router.post('/', supportLimiter, recaptchaVerify, sendSupportHandler);

export default router;
