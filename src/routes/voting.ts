import express from 'express';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { issueTokensHandler, castVoteHandler, listAvailableElectionsHandler } from '../controllers/votingController';

const router = express.Router();
router.get('/available', requireAuth, requireRole('voter'), listAvailableElectionsHandler);
router.post('/:electionId/issue-tokens', requireAuth, requireRole('university_admin'), issueTokensHandler);
// A single-use voting token is the credential for casting; no user session is required.
router.post('/:electionId/cast', castVoteHandler);

export default router;
