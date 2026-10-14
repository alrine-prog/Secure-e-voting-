import express from 'express';
import { loginHandler, forgotPasswordHandler, resetPasswordHandler, logoutHandler } from '../controllers/authController';

const router = express.Router();

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

export default router;
