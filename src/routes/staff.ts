import express from 'express';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { createStaffHandler } from '../controllers/staffController';

const router = express.Router();

// Create staff (only university_admin)
router.post('/:universityId/staff', requireAuth, requireRole('university_admin'), createStaffHandler);

export default router;
