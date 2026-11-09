import express from 'express';
import { approveVoterHandler, notifyApprovedVotersHandler } from '../controllers/voterController';
import { requireAuth, requireRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { listPendingUniversitiesHandler, approveUniversityHandler, rejectUniversityHandler, getUniversitySummaryHandler } from '../controllers/adminController';
import {
  createObserverAccountHandler,
  createStaffAccountHandler,
  listUniversityAccountsHandler,
  listUniversityAuditLogsHandler,
  setUniversityAccountStatusHandler
} from '../controllers/universityAdminController';
import { profilePhotoUpload } from '../utils/profilePhotoUpload';

const router = express.Router();
router.get('/universities/pending', requireAuth, requireRole('system_owner'), listPendingUniversitiesHandler);
router.post('/universities/:universityId/approve', requireAuth, requireRole('system_owner'), approveUniversityHandler);
router.post('/universities/:universityId/reject', requireAuth, requireRole('system_owner'), rejectUniversityHandler);
router.post('/universities/:universityId/voters/:voterId/approve', requireAuth, requireRole('university_admin'), requireUniversityAccess, approveVoterHandler);
router.post('/universities/:universityId/elections/:electionId/notify', requireAuth, requireRole('university_admin'), requireUniversityAccess, notifyApprovedVotersHandler);
router.get('/universities/:universityId/summary', requireAuth, requireRole('university_admin'), requireUniversityAccess, getUniversitySummaryHandler);
router.post('/universities/:universityId/staff', requireAuth, requireRole('university_admin'), requireUniversityAccess, createStaffAccountHandler);
router.post('/universities/:universityId/observers', requireAuth, requireRole('university_admin'), requireUniversityAccess, createObserverAccountHandler);
router.post('/universities/:universityId/:accountType(staff|observers)', requireAuth, requireRole('university_admin'), requireUniversityAccess, profilePhotoUpload.single('photo'), (req, res, next) => {
  if (req.params.accountType === 'staff') return createStaffAccountHandler(req, res, next);
  return createObserverAccountHandler(req, res, next);
});
router.get('/universities/:universityId/accounts', requireAuth, requireRole('university_admin'), requireUniversityAccess, listUniversityAccountsHandler);
router.post('/universities/:universityId/accounts/:userId/:action(suspend|reactivate)', requireAuth, requireRole('university_admin'), requireUniversityAccess, setUniversityAccountStatusHandler);
router.get('/universities/:universityId/audit-logs', requireAuth, requireRole('university_admin'), requireUniversityAccess, listUniversityAuditLogsHandler);
export default router;
