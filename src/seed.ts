import prisma from './prismaClient';
import bcrypt from 'bcrypt';

export const seedSystemOwner = async () => {
  const email = process.env.SYSTEM_OWNER_EMAIL || 'info.alrine@gmail.com';
  const password = process.env.SYSTEM_OWNER_PASSWORD || 'alrine@26';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('System owner already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({ data: { role: 'system_owner', username: 'system_owner', firstName: 'System', secondName: 'Owner', email, passwordHash, isActive: true } });
  console.log('Seeded system owner', email);
};
