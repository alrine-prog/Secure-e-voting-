import { Request, Response, NextFunction } from 'express';

// NOTE: This is a very small mocked auth middleware for development/stubbing.
// In production you must implement proper JWT/session auth and role checks.

export const requireUniversityAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Expect headers: x-user-id, x-user-role, x-university-id
  const userId = req.header('x-user-id');
  const role = req.header('x-user-role');
  const uni = req.header('x-university-id');

  if (!userId || !role || !uni) return res.status(401).json({ error: 'Missing auth headers for dev middleware' });
  if (role !== 'university_admin') return res.status(403).json({ error: 'Requires university_admin role' });

  // attach a simple auth object
  (req as any).auth = { userId, role, universityId: uni };

  // ensure the route's university matches header
  const routeUni = req.params.universityId;
  if (routeUni && routeUni !== uni) return res.status(403).json({ error: 'University mismatch' });

  next();
};
