import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';

// Create a staff user under a university (by university admin)
export const createStaffHandler = async (req: Request, res: Response) => {
  const { universityId } = req.params;
  const auth = (req as any).auth;
  try {
    // verify auth university
    if (auth.universityId !== universityId) return res.status(403).json({ error: 'Forbidden' });

    const { username, firstName, secondName, email, phone, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password are required' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({ data: { universityId, role: 'staff', username, firstName, secondName, email, phone, passwordHash, isActive: true } });

    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'create_staff', resourceType: 'user', resourceId: user.id } });

    return res.json({ success: true, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
