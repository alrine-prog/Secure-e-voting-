import express from 'express';
import { requireAuth, requireRole } from '../utils/jwtMiddleware';
import { getObserverElectionTallyHandler, listObserverElectionsHandler } from '../controllers/observerController';

const router = express.Router();
router.use(requireAuth, requireRole('observer'));
router.get('/elections', listObserverElectionsHandler);
router.get('/elections/:electionId/tally', getObserverElectionTallyHandler);

export default router;
