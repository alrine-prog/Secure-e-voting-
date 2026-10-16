import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import prisma from '../prismaClient';

const upload = multer({ dest: '/tmp' });

export const uploadVotersCsvHandler = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    const { universityId } = req.params.universityId as string;
    const auth = (req as any).auth;

    try {
      if (!auth) return res.status(401).json({ error: 'Unauthorized' });
      if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

      const raw = fs.readFileSync(req.file.path, 'utf8');
      const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

      const created: any[] = [];
      for (const row of records) {
        const voter = await prisma.voter.create({
          data: {
            universityId,
            registeredByUserId: auth.userId,
            studentRegistrationNumber: row.studentRegistrationNumber || null,
            nationalId: row.nationalId || null,
            firstName: row.firstName,
            secondName: row.secondName,
            email: row.email || null,
            phone: row.phone || null,
            faculty: row.faculty || null,
            college: row.college || null,
            yearOfStudy: row.yearOfStudy ? Number(row.yearOfStudy) : null,
            approved: false
          }
        });

        created.push({ id: voter.id, firstName: voter.firstName, secondName: voter.secondName });
      }

      return res.json({ success: true, imported: created.length, voters: created });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to import CSV' });
    }
  }
];
