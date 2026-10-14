import express from 'express';
import dotenv from 'dotenv';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import universityRouter from './routes/university';
import staffRouter from './routes/staff';
import votingRouter from './routes/voting';
import { seedSystemOwner } from './seed';

dotenv.config();

const app = express();
app.use(express.json());

// Public routes
app.use('/auth', authRouter);
app.use('/universities', universityRouter);

// Protected/admin routes
app.use('/admin', adminRouter);
app.use('/staff', staffRouter);
app.use('/elections', votingRouter);

app.get('/', (req, res) => res.send('Secure E-Voting API'));

const port = process.env.PORT || 4000;

// seed default system owner and then start
seedSystemOwner().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to seed system owner', err);
  process.exit(1);
});
