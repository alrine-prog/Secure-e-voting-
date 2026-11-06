import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { verifyJwt } from './jwt';

const normalizeRole = (role: unknown): string | null => {
  if (typeof role !== 'string') return null;
  return role === 'uni_admin' ? 'university_admin' : role;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header('authorization');
  let token = (req as Request & { cookies?: Record<string, string> }).cookies?.token;
  if (authorization) {
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) return res.status(401).json({ error: 'Invalid Authorization header' });
    token = parts[1];
  }
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = verifyJwt(token) as { userId?: string };
    if (!payload.userId) return res.status(401).json({ error: 'Invalid token' });
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid or inactive account' });
    (req as any).auth = { userId: user.id, role: user.role, universityId: user.universityId };
    (req as any).user = { id: user.id, email: user.email, role: user.role, universityId: user.universityId, mustChangePassword: user.mustChangePassword };

    const pathname = req.originalUrl.split('?')[0];
    const allowed = ['/auth/me', '/auth/change-password', '/auth/logout'];
    if (user.mustChangePassword && !allowed.includes(pathname)) {
      return res.status(403).json({ error: 'You must change your temporary password before continuing.', code: 'PASSWORD_CHANGE_REQUIRED' });
    }
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (normalizeRole(auth.role) !== normalizeRole(role)) return res.status(403).json({ error: 'Forbidden' });
  return next();
};

export const requireAnyRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const role = normalizeRole(auth.role);
  if (!role || !roles.some((allowedRole) => normalizeRole(allowedRole) === role)) return res.status(403).json({ error: 'Forbidden' });
  return next();
};

export const requireUniversityAccess = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req as any).auth;
  const universityId = req.params.universityId || req.params.uid;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!universityId || auth.universityId !== universityId) return res.status(403).json({ error: 'University access denied' });
  return next();
};
