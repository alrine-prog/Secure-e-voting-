import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../prismaClient';
import { profilePhotoPath } from '../utils/profilePhotoUpload';

const getFilename = (value: unknown) => typeof value === 'string' ? value : '';

export const getProfilePhotoHandler = (req: Request, res: Response) => {
  const filename = getFilename(req.params.filename);
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename)) return res.status(404).end();
  const photoPath = profilePhotoPath(filename);
  if (!fs.existsSync(photoPath)) return res.status(404).end();
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.sendFile(photoPath);
};

export const updateProfilePhotoHandler = async (req: Request, res: Response) => {
  const userId = (req as any).auth?.userId as string | undefined;
  if (!userId) {
    if (req.file) fs.unlink(req.file.path, () => undefined);
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!req.file) return res.status(400).json({ error: 'Choose a JPEG, PNG, or WebP profile photo (up to 5 MB).' });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { photoUrl: true } });
    const photoUrl = `/auth/profile-photos/${req.file.filename}`;
    await prisma.user.update({ where: { id: userId }, data: { photoUrl } });
    if (user?.photoUrl) {
      const previousFilename = path.basename(user.photoUrl);
      if (/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(previousFilename)) {
        const previousPath = profilePhotoPath(previousFilename);
        if (fs.existsSync(previousPath)) fs.unlink(previousPath, () => undefined);
      }
    }
    return res.json({ success: true, photoUrl });
  } catch (error) {
    fs.unlink(req.file.path, () => undefined);
    console.error('Profile photo update failed:', error);
    return res.status(500).json({ error: 'Could not update profile photo.' });
  }
};
