import express from 'express';
import dotenv from 'dotenv';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';
import staffRouter from './routes/staff';
import voteRouter from './routes/vote';
import prisma from './prismaClient';
import { hashPassword } from './utils/hash';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/staff', staffRouter);
app.use('/elections', voteRouter);

app.get('/', (req, res) => res.send('Secure E-Voting API'));

// Ensure default system owner exists
const ensureDefaultOwner = async () => {
  const defaultEmail = process.env.DEFAULT_OWNER_EMAIL || 'info.alrine@gmail.com';
  const defaultPassword = process.env.DEFAULT_OWNER_PASSWORD || 'alrine@26';
  const existing = await prisma.user.findUnique({ where: { email: defaultEmail } });
  if (!existing) {
    const pw = await hashPassword(defaultPassword);
    await prisma.user.create({ data: { email: defaultEmail, username: 'system_owner', firstName: 'System', secondName: 'Owner', role: 'system_owner', passwordHash: pw } });
    console.log('Created default system owner:', defaultEmail);
  }
};

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  await ensureDefaultOwner();
  console.log(`Server running on http://localhost:${port}`);
});
