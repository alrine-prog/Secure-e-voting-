import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import universityRouter from './routes/university';
import staffRouter from './routes/staff';
import electionsRouter from './routes/elections';
import csvRouter from './routes/csv';
import { seedSystemOwner } from './seed';

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/auth', authRouter);
app.use('/universities', universityRouter);
app.use('/admin', adminRouter);
app.use('/staff', staffRouter);
app.use('/staff', csvRouter);
app.use('/elections', electionsRouter);

app.get('/', (_req, res) => res.json({ name: 'Secure E-Voting API', version: '1.0.0' }));

const port = Number(process.env.PORT || 4000);

seedSystemOwner().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to seed system owner', err);
  process.exit(1);
});
