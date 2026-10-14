import express from 'express';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { createElectionHandler, addCandidateHandler, listElectionsHandler, getResultsHandler } from '../controllers/electionController';

const router = express.Router();

router.post('/:universityId/create', requireAuth, requireRole('university_admin'), createElectionHandler);
router.post('/:electionId/candidates', requireAuth, requireRole('university_admin'), addCandidateHandler);
router.get('/:universityId', requireAuth, requireRole('university_admin'), listElectionsHandler);
router.get('/:electionId/results', requireAuth, requireRole('university_admin'), getResultsHandler);

export default router;
