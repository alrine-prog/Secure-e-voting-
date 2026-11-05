import express from 'express';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { issueTokensHandler, castVoteHandler } from '../controllers/votingController';

const router = express.Router();
router.post('/:electionId/issue-tokens', requireAuth, requireRole('university_admin'), issueTokensHandler);
router.post('/:electionId/cast', castVoteHandler);

export default router;
