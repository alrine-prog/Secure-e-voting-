import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');
  if (!authHeader) {
    // fallback to dev headers
    const userId = req.header('x-user-id');
    const role = req.header('x-user-role');
    const uni = req.header('x-university-id');
    if (userId && role) {
      (req as any).auth = { userId, role, universityId: uni };
      return next();
    }
    return res.status(401).json({ error: 'Missing authorization' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });

  const token = parts[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    // Optionally verify user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    (req as any).auth = { userId: user.id, role: user.role, universityId: user.universityId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;
    if (!auth) return res.status(401).json({ error: 'unauthenticated' });
    if (auth.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
};
