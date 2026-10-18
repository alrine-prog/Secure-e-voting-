import express from 'express';
import { sendSupportHandler } from '../controllers/supportController';

const router = express.Router();

router.post('/', sendSupportHandler);

export default router;
