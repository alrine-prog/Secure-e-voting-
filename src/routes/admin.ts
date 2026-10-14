import express from 'express';
import { approveVoterHandler, notifyApprovedVotersHandler } from '../controllers/voterController';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { listPendingUniversitiesHandler, approveUniversityHandler, rejectUniversityHandler, getUniversitySummaryHandler } from '../controllers/adminController';

const router = express.Router();

// System owner: list pending universities
router.get('/universities/pending', requireAuth, requireRole('system_owner'), listPendingUniversitiesHandler);

// System owner: approve/reject university
router.post('/universities/:universityId/approve', requireAuth, requireRole('system_owner'), approveUniversityHandler);
router.post('/universities/:universityId/reject', requireAuth, requireRole('system_owner'), rejectUniversityHandler);

// University admin: approve a voter
router.post('/universities/:universityId/voters/:voterId/approve', requireAuth, requireRole('university_admin'), approveVoterHandler);

// University admin: notify approved voters for an election
router.post('/universities/:universityId/elections/:electionId/notify', requireAuth, requireRole('university_admin'), notifyApprovedVotersHandler);

// Admin dashboard: summary for a university (university_admin or system_owner)
router.get('/universities/:universityId/summary', requireAuth, requireRole('university_admin'), getUniversitySummaryHandler);

export default router;
