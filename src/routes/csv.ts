import express from 'express';
import { requireAuth, requireAnyRole } from '../utils/jwtMiddleware';
import { uploadVotersCsvHandler } from '../controllers/csvController';

const router = express.Router();

router.post('/:universityId/voters/upload', requireAuth, requireAnyRole(['staff', 'university_admin']), uploadVotersCsvHandler);

export default router;
