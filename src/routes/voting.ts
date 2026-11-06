import express from 'express';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { castAuthenticatedPostVoteHandler, castVoteHandler, issueTokensHandler, listVoterBallotsHandler } from '../controllers/votingController';

const router = express.Router();
router.post('/:electionId/issue-tokens', requireAuth, requireRole('university_admin'), issueTokensHandler);
router.get('/ballots', requireAuth, requireRole('voter'), listVoterBallotsHandler);
router.post('/:electionId/ballot', requireAuth, requireRole('voter'), castAuthenticatedPostVoteHandler);
router.post('/:electionId/cast', castVoteHandler);

export default router;
