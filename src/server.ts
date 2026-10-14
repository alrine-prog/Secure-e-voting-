import express from 'express';
import dotenv from 'dotenv';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/admin', adminRouter);

app.get('/', (req, res) => res.send('Secure E-Voting API'));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
