import express from 'express';
import { requireAuth } from '../utils/jwtMiddleware';
import { issueTokensHandler, castVoteHandler } from '../controllers/votingController';

const router = express.Router();

// Issue tokens (university_admin)
router.post('/:electionId/issue-tokens', requireAuth, issueTokensHandler);

// Cast vote (public with token)
router.post('/:electionId/cast', castVoteHandler);

export default router;
