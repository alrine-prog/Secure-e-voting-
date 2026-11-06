import express from 'express';
import { changePasswordHandler, loginHandler, forgotPasswordHandler, resetPasswordHandler, logoutHandler } from '../controllers/authController';
import { createRateLimiter } from '../middleware/rateLimiters';
import { requireAuth } from '../utils/jwtMiddleware';

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts; try again later.' });
const router = express.Router();

router.post('/login', loginLimiter, loginHandler);
router.get('/me', requireAuth, (req, res) => res.json({ user: (req as any).user }));
router.post('/change-password', requireAuth, changePasswordHandler);
router.post('/logout', logoutHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

export default router;
