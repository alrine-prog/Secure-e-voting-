import express from 'express';
import { requireAuth, requireAnyRole } from '../utils/jwtMiddleware';
import { createStaffHandler, registerVoterHandler } from '../controllers/staffController';

const router = express.Router();

// Create staff (only university_admin)
router.post('/:universityId/staff', requireAuth, requireAnyRole(['university_admin']), createStaffHandler);

// Register voter (staff or university_admin)
router.post('/:universityId/voters', requireAuth, requireAnyRole(['staff','university_admin']), registerVoterHandler);

export default router;
