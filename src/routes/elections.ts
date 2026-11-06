import express from 'express';
import { requireAuth, requireRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { createElectionHandler, addCandidateHandler, listElectionsHandler, getResultsHandler, openElectionHandler, closeElectionHandler } from '../controllers/electionController';

const router = express.Router();
router.post('/:universityId/create', requireAuth, requireRole('university_admin'), requireUniversityAccess, createElectionHandler);
router.get('/:universityId', requireAuth, requireRole('university_admin'), requireUniversityAccess, listElectionsHandler);
router.post('/:electionId/candidates', requireAuth, requireRole('university_admin'), addCandidateHandler);
router.post('/:electionId/open', requireAuth, requireRole('university_admin'), openElectionHandler);
router.post('/:electionId/close', requireAuth, requireRole('university_admin'), closeElectionHandler);
router.get('/:electionId/results', requireAuth, requireRole('university_admin'), getResultsHandler);

export default router;
