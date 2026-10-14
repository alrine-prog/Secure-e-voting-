import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendNotificationToContact } from '../services/notificationService';

// Register university and create initial university_admin account (inactive until system owner approves)
export const registerUniversityHandler = async (req: Request, res: Response) => {
  const { name, country, districtCity, admin } = req.body; // admin: { username, firstName, secondName, email, phone, password }
  if (!name || !country || !districtCity || !admin) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const university = await prisma.university.create({ data: { name, country, districtCity, status: 'pending' } });

    const passwordHash = await bcrypt.hash(admin.password, 10);

    const user = await prisma.user.create({ data: { universityId: university.id, role: 'university_admin', username: admin.username, firstName: admin.firstName, secondName: admin.secondName, email: admin.email, phone: admin.phone, passwordHash, isActive: false } });

    await prisma.auditLog.create({ data: { userId: null, action: 'register_university', resourceType: 'university', resourceId: university.id, details: { createdAdminId: user.id } as any } });

    return res.json({ success: true, university: { id: university.id, status: university.status }, admin: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
