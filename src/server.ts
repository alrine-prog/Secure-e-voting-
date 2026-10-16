import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import universityRouter from './routes/university';
import staffRouter from './routes/staff';
import electionsRouter from './routes/elections';
import csvRouter from './routes/csv';
import { seedSystemOwner } from './seed';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();

app.use(helmet({
  contentSecurityPolicy: false // Allows inline scripts/styles needed by built frontend apps
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// API Endpoints
app.use('/auth', authRouter);
app.use('/universities', universityRouter);
app.use('/admin', adminRouter);
app.use('/staff', staffRouter);
app.use('/staff', csvRouter);
app.use('/elections', electionsRouter);

setupSwagger(app);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// --- Serve Frontend Static Build Assets ---
const frontendBuildPath = path.join(__dirname, '../frontend/out'); // Use '../frontend/dist' or '../frontend/build' if using Vite or Create-React-App

app.use(express.static(frontendBuildPath));

// Fallback GET / to index.html or welcome payload if frontend build does not exist
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.json({
        message: 'Secure E-Voting API Server is running live!',
        status: 'online',
        endpoints: {
          swagger: '/api-docs',
          health: '/health'
        }
      });
    }
  });
});

app.use(errorHandler);

const port = Number(process.env.PORT || 4000);

seedSystemOwner().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to seed system owner', err);
  process.exit(1);
});
