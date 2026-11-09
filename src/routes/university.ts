import express from 'express';
import { createRateLimiter } from '../middleware/rateLimiters';
import { recaptchaVerify } from '../middleware/recaptcha';
import { registerUniversityHandler } from '../controllers/universityController';
import { profilePhotoUpload } from '../utils/profilePhotoUpload';

const router = express.Router();
const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many registrations. Try later.' });

// Multer must run before reCAPTCHA verification so multipart form fields are available in req.body.
router.post('/register', registerLimiter, profilePhotoUpload.single('adminPhoto'), recaptchaVerify, registerUniversityHandler);

export default router;
