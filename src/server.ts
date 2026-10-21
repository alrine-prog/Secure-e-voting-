import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Required for ESM

import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import universityRouter from './routes/university.js';
import staffRouter from './routes/staff.js';
import electionsRouter from './routes/elections.js';
import csvRouter from './routes/csv.js';
import supportRouter from './routes/support.js';
import { seedSystemOwner } from './seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './swagger.js';

dotenv.config();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// --- API Endpoints ---
app.use('/auth', authRouter);
app.use('/universities', universityRouter);
app.use('/admin', adminRouter);
app.use('/staff', staffRouter);
app.use('/staff', csvRouter);
app.use('/support', supportRouter);
app.use('/elections', electionsRouter);

setupSwagger(app);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// --- Locate Frontend Directory ---
const getFrontendBuildPath = () => {
  const possiblePaths = [
    path.resolve(__dirname, '../frontend/out'),
    path.resolve(__dirname, '../../frontend/out'),
    path.resolve(process.cwd(), 'frontend/out'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), 'frontend/build')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const frontendBuildPath = getFrontendBuildPath();

// --- Serve Frontend Static Assets ---
if (frontendBuildPath) {
  console.log(`Serving frontend static files from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    // Exclude API and Swagger routes
    if (
      req.path.startsWith('/auth') ||
      req.path.startsWith('/admin') ||
      req.path.startsWith('/universities') ||
      req.path.startsWith('/staff') ||
      req.path.startsWith('/elections') ||
      req.path.startsWith('/api-docs') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/support')
    ) {
      return next();
    }

    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
} else {
  console.warn('Frontend build folder not found. Running in API-only mode.');
  app.get('/', (_req, res) => {
    res.json({
      message: 'Secure E-Voting API Server is running live!',
      status: 'online',
      endpoints: {
        swagger: '/api-docs',
        health: '/health'
      }
    });
  });
}

// Global error handler
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);

seedSystemOwner()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to seed system owner:', err);
    process.exit(1);
  });
