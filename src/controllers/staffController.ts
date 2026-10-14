import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { hashPassword } from '../utils/hash';

export const createStaffHandler = async (req: Request, res: Response) => {
  const { universityId } = req.params;
  const { username, firstName, secondName, email, phone, password } = req.body;
  const admin = (req as any).auth;

  if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password required' });
  if (admin.universityId !== universityId) return res.status(403).json({ error: 'university mismatch' });

  try {
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { username, firstName, secondName, email, phone, passwordHash: hashed, role: 'staff', universityId } });
    await prisma.auditLog.create({ data: { userId: admin.userId, action: 'create_staff', resourceType: 'user', resourceId: user.id } });
    return res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'failed to create staff' });
  }
};
