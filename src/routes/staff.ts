import express from 'express';
import { requireAuth, requireRole } from '../utils/authMiddleware';
import { createStaffHandler } from '../controllers/staffController';

const router = express.Router();

// Only university_admin can create staff
router.post('/universities/:universityId/staff', requireAuth, requireRole('university_admin'), createStaffHandler);

export default router;
