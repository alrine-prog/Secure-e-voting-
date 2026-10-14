import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './jwt';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization header' });
  try {
    const payload = verifyJwt(parts[1]);
    (req as any).auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    if (auth.role !== role && auth.role !== 'system_owner') return res.status(403).json({ error: 'Forbidden' });
    next();
  };
};
