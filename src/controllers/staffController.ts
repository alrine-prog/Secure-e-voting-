import { Request, Response } from 'express';
import prisma from '../prismaClient';

// Register a voter (by staff or university_admin)
export const registerVoterHandler = async (req: Request, res: Response) => {
  const { universityId } = req.params;
  const auth = (req as any).auth;

  try {
    if (auth.universityId !== universityId && auth.role !== 'system_owner') return res.status(403).json({ error: 'Forbidden' });

    const {
      studentRegistrationNumber,
      nationalId,
      firstName,
      secondName,
      email,
      phone,
      faculty,
      college,
      yearOfStudy
    } = req.body;

    if (!firstName || !secondName) return res.status(400).json({ error: 'firstName and secondName required' });

    const voter = await prisma.voter.create({ data: {
      universityId,
      registeredByUserId: auth.userId,
      studentRegistrationNumber: studentRegistrationNumber || null,
      nationalId: nationalId || null,
      firstName,
      secondName,
      email: email || null,
      phone: phone || null,
      faculty: faculty || null,
      college: college || null,
      yearOfStudy: yearOfStudy || null,
      approved: false
    } });

    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'register_voter', resourceType: 'voter', resourceId: voter.id } });

    return res.json({ success: true, voter: { id: voter.id, firstName: voter.firstName, secondName: voter.secondName, approved: voter.approved } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
