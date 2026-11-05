import express from 'express';
import { requireAuth, requireAnyRole, requireUniversityAccess } from '../utils/jwtMiddleware';
import { uploadVotersCsvHandler } from '../controllers/csvController';

const router = express.Router();
router.post('/:universityId/voters/upload', requireAuth, requireAnyRole(['staff', 'university_admin']), requireUniversityAccess, uploadVotersCsvHandler);

export default router;
