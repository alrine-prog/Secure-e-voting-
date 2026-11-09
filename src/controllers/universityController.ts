import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { profilePhotoPath } from '../utils/profilePhotoUpload';

const removeUploadedPhoto = (req: Request) => {
  if (req.file?.path) fs.unlink(req.file.path, () => undefined);
};

// Register university and its initial university administrator.
export const registerUniversityHandler = async (req: Request, res: Response) => {
  const { name, country, districtCity, admin } = req.body;
  const universityName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof admin?.email === 'string' ? admin.email.trim().toLowerCase() : '';
  const username = typeof admin?.username === 'string' ? admin.username.trim() : '';
  const firstName = typeof admin?.firstName === 'string' ? admin.firstName.trim() : '';
  const secondName = typeof admin?.secondName === 'string' ? admin.secondName.trim() : '-';
  const password = admin?.password;
  const phone = typeof admin?.phone === 'string' ? admin.phone.trim() : '';

  if (!universityName || typeof country !== 'string' || !country.trim() || typeof districtCity !== 'string' || !districtCity.trim() ||
      !username || !/^[a-zA-Z0-9._-]{3,30}$/.test(username) || !firstName || !/^\S+@\S+\.\S+$/.test(normalizedEmail) ||
      typeof password !== 'string' || password.length < 12 || !req.file) {
    removeUploadedPhoto(req);
    return res.status(400).json({ error: 'University, administrator name, valid username, email, password (at least 12 characters), and profile photo are required.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const university = await prisma.university.create({
      data: { name: universityName, country: country.trim(), districtCity: districtCity.trim(), status: 'pending' }
    });
    const user = await prisma.user.create({
      data: {
        universityId: university.id,
        role: 'university_admin',
        username,
        firstName,
        secondName: secondName || '-',
        email: normalizedEmail,
        phone: phone || null,
        photoUrl: `/auth/profile-photos/${req.file.filename}`,
        passwordHash,
        isActive: false
      }
    });

    await prisma.auditLog.create({
      data: { userId: null, action: 'register_university', resourceType: 'university', resourceId: university.id, details: { createdAdminId: user.id } as any }
    });
    return res.status(201).json({
      success: true,
      university: { id: university.id, name: university.name, status: university.status },
      admin: { id: user.id, username: user.username, email: user.email, photoUrl: user.photoUrl }
    });
  } catch (error: any) {
    removeUploadedPhoto(req);
    if (error?.code === 'P2002') return res.status(409).json({ error: 'That administrator email or username is already registered.' });
    console.error('University registration failed:', error);
    return res.status(500).json({ error: 'Could not register the university.' });
  }
};

export const getRegisteredUniversityPhoto = (filename: string) => profilePhotoPath(filename);
