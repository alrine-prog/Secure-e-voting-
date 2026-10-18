import express from 'express';
import { loginHandler, forgotPasswordHandler, resetPasswordHandler, logoutHandler } from '../controllers/authController';
import { createRateLimiter } from '../middleware/rateLimiters';

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts; try again later.' });
const router = express.Router();

router.post('/login', loginLimiter, loginHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

export default router;
