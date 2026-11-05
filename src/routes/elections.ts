import express from 'express';
import { requireAuth, requireRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { createElectionHandler, addCandidateHandler, listElectionsHandler, getResultsHandler } from '../controllers/electionController';

const router = express.Router();
router.post('/:universityId/create', requireAuth, requireRole('university_admin'), requireUniversityAccess, createElectionHandler);
router.post('/:electionId/candidates', requireAuth, requireRole('university_admin'), addCandidateHandler);
router.get('/:universityId', requireAuth, requireRole('university_admin'), requireUniversityAccess, listElectionsHandler);
router.get('/:electionId/results', requireAuth, requireRole('university_admin'), getResultsHandler);

export default router;
