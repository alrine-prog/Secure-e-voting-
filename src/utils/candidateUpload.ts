import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'candidates');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensionsByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${extensionsByMimeType[file.mimetype]}`),
});

export const candidatePhotoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!extensionsByMimeType[file.mimetype]) return callback(new Error('Candidate photo must be a JPEG, PNG, or WebP image.'));
    return callback(null, true);
  },
});
