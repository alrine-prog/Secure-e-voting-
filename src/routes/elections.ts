import express from 'express';
import { requireAuth, requireRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { createElectionHandler, listElectionsHandler, getResultsHandler } from '../controllers/electionController';
import {
  createCandidateHandler,
  getCandidatePhotoHandler,
  listCandidatesHandler,
  updateCandidateHandler,
} from '../controllers/candidateController';
import { candidatePhotoUpload } from '../utils/candidateUpload';

const router = express.Router();

router.get('/candidate-photos/:filename', getCandidatePhotoHandler);
router.post('/:universityId/create', requireAuth, requireRole('university_admin'), requireUniversityAccess, createElectionHandler);
router.post('/:electionId/candidates', requireAuth, requireRole('university_admin'), candidatePhotoUpload.single('photo'), createCandidateHandler);
router.get('/:electionId/candidates', requireAuth, requireRole('university_admin'), listCandidatesHandler);
router.put('/:electionId/candidates/:candidateId', requireAuth, requireRole('university_admin'), candidatePhotoUpload.single('photo'), updateCandidateHandler);
router.get('/:universityId', requireAuth, requireRole('university_admin'), requireUniversityAccess, listElectionsHandler);
router.get('/:electionId/results', requireAuth, requireRole('university_admin'), getResultsHandler);

export default router;
