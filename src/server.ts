import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import next from 'next';

import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import universityRouter from './routes/university';
import staffRouter from './routes/staff';
import electionsRouter from './routes/elections';
import votingRouter from './routes/voting';
import csvRouter from './routes/csv';
import supportRouter from './routes/support';
import { seedSystemOwner } from './seed';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT || 4000);
const nextApp = next({ dev, dir: path.resolve(__dirname, '../frontend') });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

  const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${port}`;
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));

  app.use('/auth', authRouter);
  app.use('/universities', universityRouter);
  app.use('/admin', adminRouter);
  app.use('/staff', staffRouter);
  app.use('/staff', csvRouter);
  app.use('/support', supportRouter);
  app.use('/elections', electionsRouter);
  app.use('/voting', votingRouter);

  setupSwagger(app);
  app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));
  app.all('*', (req: Request, res: Response) => nextHandler(req, res));
  app.use(errorHandler);

  await seedSystemOwner();
  app.listen(port, () => console.log(`> Server running on port ${port} in ${dev ? 'development' : 'production'} mode`));
}).catch((err) => {
  console.error('Failed to initialize server or seed system owner:', err);
  process.exit(1);
});
