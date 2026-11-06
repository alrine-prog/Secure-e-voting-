import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendCredentialEmail } from '../services/notificationService';

export const createStaffHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  try {
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    if (auth.universityId !== universityId && auth.role !== 'system_owner') return res.status(403).json({ error: 'Forbidden' });
    const { username, firstName, secondName, email, phone, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password are required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const staff = await prisma.user.create({ data: { universityId, role: 'staff', username, firstName: firstName || '', secondName: secondName || '', email, phone: phone || null, passwordHash, isActive: true } });
    await prisma.auditLog.create({ data: { userId: auth.userId, action: 'create_staff', resourceType: 'user', resourceId: staff.id } });
    return res.json({ success: true, staff: { id: staff.id, username: staff.username, email: staff.email, universityId: staff.universityId } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerVoterHandler = async (req: Request, res: Response) => {
  const universityId = req.params.universityId as string;
  const auth = (req as any).auth;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (auth.universityId !== universityId && auth.role !== 'system_owner') return res.status(403).json({ error: 'Forbidden' });

  const { studentRegistrationNumber, nationalId, firstName, secondName, email, phone, faculty, college, yearOfStudy } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const givenName = typeof firstName === 'string' ? firstName.trim() : '';
  const familyName = typeof secondName === 'string' ? secondName.trim() : '';
  if (!givenName || !familyName) return res.status(400).json({ error: 'firstName and secondName are required' });
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ error: 'A valid voter email address is required.' });
  if (studentRegistrationNumber && typeof studentRegistrationNumber !== 'string') return res.status(400).json({ error: 'studentRegistrationNumber must be text.' });

  const temporaryPassword = crypto.randomBytes(12).toString('base64url');
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  const baseUsername = normalizedEmail.split('@')[0].replace(/[^a-z0-9._-]/g, '').slice(0, 24) || 'voter';
  const username = `${baseUsername}-${crypto.randomBytes(5).toString('hex')}`;

  try {
    const { voter, user } = await prisma.$transaction(async (tx) => {
      const createdVoter = await tx.voter.create({
        data: {
          universityId,
          registeredByUserId: auth.userId,
          studentRegistrationNumber: studentRegistrationNumber || null,
          nationalId: nationalId || null,
          firstName: givenName,
          secondName: familyName,
          email: normalizedEmail,
          phone: phone || null,
          faculty: faculty || null,
          college: college || null,
          yearOfStudy: yearOfStudy ? Number(yearOfStudy) : null,
          approved: false
        }
      });
      const createdUser = await tx.user.create({
        data: {
          universityId,
          role: 'voter',
          username,
          firstName: givenName,
          secondName: familyName,
          email: normalizedEmail,
          phone: phone || null,
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
        text: `Hello ${givenName} ${familyName},\n\nYour voter account has been created. Your registration must be approved by your university before you can vote.\n\nUsername: ${username}\nTemporary password: ${temporaryPassword}\n\nAfter your first sign-in, you will be required to set a new password. Do not share your password with anyone.`
      });
      credentialEmailSent = true;
    } catch (emailError) {
      // Do not return or log the temporary password; voter can use Forgot password if delivery fails.
      console.error('Could not send voter credentials email:', emailError);
    }

    return res.status(201).json({ success: true, credentialEmailSent, voter: { id: voter.id, firstName: voter.firstName, secondName: voter.secondName, approved: false, email: normalizedEmail } });
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'A voter or user account with this email or student registration number already exists.' });
    console.error(error);
    return res.status(500).json({ error: 'Voter registration failed.' });
  }
};
