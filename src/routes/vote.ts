import express from 'express';
import { castVoteHandler, issueTokensHandler } from '../controllers/voteController';
import { requireAuth } from '../utils/authMiddleware';

const router = express.Router();

// Issue tokens (only university_admin)
router.post('/:electionId/issue-tokens', requireAuth, issueTokensHandler);

// Cast vote (public endpoint uses token)
router.post('/:electionId/cast', castVoteHandler);

export default router;
