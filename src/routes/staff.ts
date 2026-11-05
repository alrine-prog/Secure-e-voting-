import express from 'express';
import { requireAuth, requireAnyRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { createStaffHandler, registerVoterHandler } from '../controllers/staffController';

const router = express.Router();
router.post('/:universityId/staff', requireAuth, requireRole('university_admin'), requireUniversityAccess, createStaffHandler);
router.post('/:universityId/voters', requireAuth, requireAnyRole(['staff', 'university_admin']), requireUniversityAccess, registerVoterHandler);

export default router;
