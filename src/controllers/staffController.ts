import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';

export const createStaffHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;

  try {
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    if (auth.universityId !== universityId && auth.role !== 'system_owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { username, firstName, secondName, email, phone, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const staff = await prisma.user.create({
      data: {
        universityId,
        role: 'staff',
        username,
        firstName: firstName || '',
        secondName: secondName || '',
        email,
        phone: phone || null,
        passwordHash,
        isActive: true
      }
    });

    await prisma.auditLog.create({
      data: { userId: auth.userId, action: 'create_staff', resourceType: 'user', resourceId: staff.id }
    });

    return res.json({
      success: true,
      staff: {
        id: staff.id,
        username: staff.username,
        email: staff.email,
        universityId: staff.universityId
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerVoterHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;

  try {
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    if (auth.universityId !== universityId && auth.role !== 'system_owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

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

    if (!firstName || !secondName) {
      return res.status(400).json({ error: 'firstName and secondName are required' });
    }

    const voter = await prisma.voter.create({
      data: {
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
        yearOfStudy: yearOfStudy ? Number(yearOfStudy) : null,
        approved: false
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'register_voter',
        resourceType: 'voter',
        resourceId: voter.id
      }
    });

    return res.json({ success: true, voter: { id: voter.id, firstName, secondName, approved: false } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
