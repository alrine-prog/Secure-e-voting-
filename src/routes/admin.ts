import express from 'express';
import { approveVoterHandler, notifyApprovedVotersHandler } from '../controllers/voterController';
import { requireUniversityAdmin } from '../utils/authMiddleware';

const router = express.Router();

// Approve a voter (only university admin)
router.post('/universities/:universityId/voters/:voterId/approve', requireUniversityAdmin, approveVoterHandler);

// Notify all approved voters for an election (only university admin)
router.post('/universities/:universityId/elections/:electionId/notify', requireUniversityAdmin, notifyApprovedVotersHandler);

export default router;
