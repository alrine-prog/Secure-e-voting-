import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { createTextPdf } from '../utils/textPdf';

type DirectoryType = 'staff' | 'observers' | 'voters';
type DirectoryRow = Record<string, string | number | boolean | null>;

const directoryType = (value: unknown): DirectoryType | null =>
  value === 'staff' || value === 'observers' || value === 'voters' ? value : null;

const buildDirectory = async (universityId: string, type: DirectoryType) => {
  const university = await prisma.university.findUnique({ where: { id: universityId }, select: { id: true, name: true } });
  if (!university) return null;

  if (type !== 'voters') {
    const role = type === 'staff' ? 'staff' : 'observer';
    const users = await prisma.user.findMany({
      where: { universityId, role },
      select: { firstName: true, secondName: true, username: true, email: true, phone: true, isActive: true, createdAt: true },
      orderBy: [{ firstName: 'asc' }, { secondName: 'asc' }]
    });
    const rows: DirectoryRow[] = users.map((user) => ({
      name: `${user.firstName} ${user.secondName}`.trim(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.isActive ? 'Active' : 'Suspended',
      createdAt: user.createdAt.toISOString()
    }));
    return { organizationName: university.name, type, rows };
  }

  const voterUsers = await prisma.user.findMany({
    where: { universityId, role: 'voter' },
    select: { firstName: true, secondName: true, username: true, email: true, phone: true, isActive: true, createdAt: true },
    orderBy: [{ firstName: 'asc' }, { secondName: 'asc' }]
  });
  const emails = voterUsers.map((user) => user.email);
  const voterRecords = emails.length ? await prisma.voter.findMany({
    where: { universityId, email: { in: emails, mode: 'insensitive' } },
    select: { email: true, studentRegistrationNumber: true, faculty: true, college: true, yearOfStudy: true, approved: true }
  }) : [];
  const voterByEmail = new Map(voterRecords.map((record) => [record.email?.toLowerCase() || '', record]));
  const rows: DirectoryRow[] = voterUsers.map((user) => {
    const record = voterByEmail.get(user.email.toLowerCase());
    return {
      name: `${user.firstName} ${user.secondName}`.trim(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      studentRegistrationNumber: record?.studentRegistrationNumber || null,
      faculty: record?.faculty || null,
      college: record?.college || null,
      yearOfStudy: record?.yearOfStudy ?? null,
      approval: record ? (record.approved ? 'Approved' : 'Pending') : 'Voter record unavailable',
      accountStatus: user.isActive ? 'Active' : 'Suspended',
      createdAt: user.createdAt.toISOString()
    };
  });
  return { organizationName: university.name, type, rows };
};

const displayValue = (value: DirectoryRow[string]) => value === null || value === undefined || value === '' ? '—' : String(value);

export const universityDirectoryHandler = async (req: Request, res: Response) => {
  const type = directoryType(req.params.type);
  if (!type) return res.status(400).json({ error: 'Directory type must be staff, observers, or voters.' });

  try {
    const directory = await buildDirectory(req.params.universityId as string, type);
    if (!directory) return res.status(404).json({ error: 'University not found.' });

    if (req.query.format === 'pdf') {
      const title = `${directory.organizationName} — ${type === 'observers' ? 'Observers' : type[0].toUpperCase() + type.slice(1)} directory`;
      const columns = type === 'voters'
        ? ['name', 'username', 'email', 'phone', 'studentRegistrationNumber', 'faculty', 'college', 'yearOfStudy', 'approval', 'accountStatus']
        : ['name', 'username', 'email', 'phone', 'status'];
      const rows = [columns.join(' | '), ...directory.rows.map((row) => columns.map((column) => displayValue(row[column])).join(' | '))];
      const pdf = createTextPdf(title, rows);
      const filename = `${type}-directory.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(pdf);
    }

    return res.json({ success: true, organizationName: directory.organizationName, type, count: directory.rows.length, rows: directory.rows });
  } catch (error) {
    console.error('University directory export failed:', error);
    return res.status(500).json({ error: 'Could not load this university directory.' });
  }
};
