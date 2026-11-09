import express from 'express';
import { changePasswordHandler, loginHandler, forgotPasswordHandler, resetPasswordHandler, logoutHandler } from '../controllers/authController';
import { getProfilePhotoHandler, updateProfilePhotoHandler } from '../controllers/profileController';
import { createRateLimiter } from '../middleware/rateLimiters';
import { requireAuth } from '../utils/jwtMiddleware';
import { profilePhotoUpload } from '../utils/profilePhotoUpload';

const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts; try again later.' });
const forgotPasswordLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many reset requests; try again later.' });
const resetPasswordLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many reset attempts; try again later.' });
const router = express.Router();

router.get('/profile-photos/:filename', getProfilePhotoHandler);
router.post('/login', loginLimiter, loginHandler);
router.get('/me', requireAuth, (req, res) => res.json({ user: (req as any).user }));
router.post('/profile/photo', requireAuth, profilePhotoUpload.single('photo'), updateProfilePhotoHandler);
router.post('/change-password', requireAuth, changePasswordHandler);
router.post('/logout', logoutHandler);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordHandler);
router.post('/reset-password', resetPasswordLimiter, resetPasswordHandler);

export default router;
