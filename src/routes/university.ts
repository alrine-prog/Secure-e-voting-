import express from 'express';
import { registerUniversityHandler } from '../controllers/universityController';

const router = express.Router();

router.post('/register', registerUniversityHandler);

export default router;
