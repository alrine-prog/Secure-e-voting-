import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import universityRouter from './routes/university';
import staffRouter from './routes/staff';
import electionsRouter from './routes/elections';
import csvRouter from './routes/csv';
import { seedSystemOwner } from './seed';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger';
import supportRouter from './routes/support';

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

// --- API Endpoints ---
app.use('/auth', authRouter);
app.use('/universities', universityRouter);
app.use('/admin', adminRouter);
app.use('/staff', staffRouter);
app.use('/staff', csvRouter);
app.use('/elections', electionsRouter);
app.use('/support', supportRouter);

setupSwagger(app);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// --- Locate Root Level Frontend Directory ---
// Dynamically locates repo root whether server.js ends up in dist/ or dist/src/
const getFrontendBuildPath = (): string => {
  const directRootPath = path.resolve(__dirname, '../frontend/out');
  const nestedRootPath = path.resolve(__dirname, '../../frontend/out');

  if (fs.existsSync(directRootPath)) {
    return directRootPath;
  }
  return nestedRootPath;
};

const frontendBuildPath = getFrontendBuildPath();

// --- Serve Frontend Static Assets ---
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    // Let unhandled API routes pass through to 404/error handlers
    if (
      req.path.startsWith('/auth') ||
      req.path.startsWith('/admin') ||
      req.path.startsWith('/universities') ||
      req.path.startsWith('/staff') ||
      req.path.startsWith('/elections') ||
      req.path.startsWith('/api-docs') ||
      req.path.startsWith('/health')
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
  // API Fallback message if static frontend export wasn't generated
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
