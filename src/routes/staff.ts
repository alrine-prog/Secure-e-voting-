import express from 'express';
import { requireAuth, requireAnyRole, requireRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { createStaffHandler, registerVoterHandler } from '../controllers/staffController';
import { profilePhotoUpload } from '../utils/profilePhotoUpload';

const router = express.Router();
router.post('/:universityId/staff', requireAuth, requireRole('university_admin'), requireUniversityAccess, createStaffHandler);
router.post('/:universityId/voters', requireAuth, requireAnyRole(['staff', 'university_admin']), requireUniversityAccess, profilePhotoUpload.single('photo'), registerVoterHandler);
export default router;
