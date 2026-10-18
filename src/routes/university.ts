import express from 'express';
import { createRateLimiter } from '../middleware/rateLimiters';
import { recaptchaVerify } from '../middleware/recaptcha';
import { registerUniversityHandler } from '../controllers/universityController';

const router = express.Router();

const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many registrations. Try later.' });

router.post('/register', registerLimiter, recaptchaVerify, registerUniversityHandler);

export default router;
