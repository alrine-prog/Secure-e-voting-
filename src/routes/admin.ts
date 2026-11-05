import express from 'express';
import { approveVoterHandler, notifyApprovedVotersHandler } from '../controllers/voterController.js';
import { requireAuth, requireRole, requireUniversityAccess } from '../utils/jwtMiddleware.js';
import { listPendingUniversitiesHandler, approveUniversityHandler, rejectUniversityHandler, getUniversitySummaryHandler } from '../controllers/adminController.js';

const router = express.Router();

// System owner: university registration approval only.
router.get('/universities/pending', requireAuth, requireRole('system_owner'), listPendingUniversitiesHandler);
router.post('/universities/:universityId/approve', requireAuth, requireRole('system_owner'), approveUniversityHandler);
router.post('/universities/:universityId/reject', requireAuth, requireRole('system_owner'), rejectUniversityHandler);

// University administrators can only act within their own university.
router.post('/universities/:universityId/voters/:voterId/approve', requireAuth, requireRole('university_admin'), requireUniversityAccess, approveVoterHandler);
router.post('/universities/:universityId/elections/:electionId/notify', requireAuth, requireRole('university_admin'), requireUniversityAccess, notifyApprovedVotersHandler);
router.get('/universities/:universityId/summary', requireAuth, requireRole('university_admin'), requireUniversityAccess, getUniversitySummaryHandler);

export default router;
