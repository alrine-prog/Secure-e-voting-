import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs';
import { sendCredentialEmail } from '../services/notificationService';
import { profilePhotoPath } from '../utils/profilePhotoUpload';

const cleanupPhoto = (req: Request) => { if (req.file?.path) fs.unlink(req.file.path, () => undefined); };

export const createStaffHandler = async (_req: Request, res: Response) => res.status(410).json({ error: 'Use the university admin account registration form.' });

export const registerVoterHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  if (!auth) { cleanupPhoto(req); return res.status(401).json({ error: 'Unauthorized.' }); }
  if (auth.universityId !== universityId && auth.role !== 'system_owner') { cleanupPhoto(req); return res.status(403).json({ error: 'Forbidden.' }); }

  const {
    studentRegistrationNumber, nationalId, firstName, secondName, username, email, phone,
    faculty, college, yearOfStudy
  } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedUsername = typeof username === 'string' ? username.trim() : '';
  const givenName = typeof firstName === 'string' ? firstName.trim() : '';
  const familyName = typeof secondName === 'string' ? secondName.trim() : '';
  const parsedYear = yearOfStudy === '' || yearOfStudy == null ? null : Number(yearOfStudy);

  if (!givenName || !familyName || !normalizedUsername || !/^[a-zA-Z0-9._-]{3,30}$/.test(normalizedUsername)) {
    cleanupPhoto(req);
    return res.status(400).json({ error: 'Voter first name, surname, and username (3–30 letters, numbers, dots, underscores or hyphens) are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) { cleanupPhoto(req); return res.status(400).json({ error: 'A valid voter email address is required.' }); }
  if (!req.file) return res.status(400).json({ error: 'A voter profile photo is required (JPEG, PNG, or WebP up to 5 MB).' });
  if (studentRegistrationNumber && typeof studentRegistrationNumber !== 'string') { cleanupPhoto(req); return res.status(400).json({ error: 'Student registration number must be text.' }); }
  if (nationalId && typeof nationalId !== 'string') { cleanupPhoto(req); return res.status(400).json({ error: 'National ID must be text.' }); }
  if (parsedYear !== null && (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 20)) { cleanupPhoto(req); return res.status(400).json({ error: 'Year of study must be a whole number between 1 and 20.' }); }

  const temporaryPassword = crypto.randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const photoUrl = `/auth/profile-photos/${req.file.filename}`;
  try {
    const { voter, user } = await prisma.$transaction(async (tx) => {
      const createdVoter = await tx.voter.create({
        data: {
          universityId,
          registeredByUserId: auth.userId,
          studentRegistrationNumber: typeof studentRegistrationNumber === 'string' ? studentRegistrationNumber.trim() || null : null,
          nationalId: typeof nationalId === 'string' ? nationalId.trim() || null : null,
          firstName: givenName,
          secondName: familyName,
          email: normalizedEmail,
          phone: typeof phone === 'string' ? phone.trim() || null : null,
          faculty: typeof faculty === 'string' ? faculty.trim() || null : null,
          college: typeof college === 'string' ? college.trim() || null : null,
          yearOfStudy: parsedYear,
          approved: false
        }
      });
      const createdUser = await tx.user.create({
        data: {
          universityId,
          role: 'voter',
          username: normalizedUsername,
          firstName: givenName,
          secondName: familyName,
          email: normalizedEmail,
          phone: typeof phone === 'string' ? phone.trim() || null : null,
          photoUrl,
          passwordHash,
          mustChangePassword: true,
          isActive: true
        }
      });
      return { voter: createdVoter, user: createdUser };
    });

    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'register_voter', resourceType: 'voter', resourceId: voter.id, details: { voterUserId: user.id } as any } });
    let credentialEmailSent = false;
    try {
      await sendCredentialEmail({
        to: normalizedEmail,
        subject: 'Your university voter account',
        text: `Hello ${givenName} ${familyName},\n\nYour voter account has been created. Your registration must be approved by your university before you can vote.\n\nUsername: ${normalizedUsername}\nTemporary password: ${temporaryPassword}\n\nAfter your first sign-in, you will be required to set a new password. Do not share your password with anyone.`
      });
      credentialEmailSent = true;
    } catch (emailError) {
      console.error('Could not send voter credentials email:', emailError);
    }
    return res.status(201).json({
      success: true,
      credentialEmailSent,
      voter: { id: voter.id, firstName: voter.firstName, secondName: voter.secondName, username: user.username, photoUrl: user.photoUrl, approved: false, email: normalizedEmail }
    });
  } catch (error: any) {
    cleanupPhoto(req);
    if (error?.code === 'P2002') return res.status(409).json({ error: 'A voter or user account with this email, username, or student registration number already exists.' });
    console.error('Voter registration failed:', error);
    return res.status(500).json({ error: 'Voter registration failed.' });
  }
};
