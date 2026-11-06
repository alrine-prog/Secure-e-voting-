// src/seed.ts
import prisma from './prismaClient';
import bcrypt from 'bcrypt';

type SeedOptions = { force?: boolean };
const info = (message: string) => console.log('[seed]', message);

const isStrongPassword = (value: string) =>
  value.length >= 12 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);

export const seedSystemOwner = async (opts: SeedOptions = {}) => {
  const force = Boolean(opts.force || process.env.FORCE_SEED === 'true');
  const configuredEmail = process.env.SYSTEM_OWNER_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.SYSTEM_OWNER_PASSWORD;

  try {
    // Never invent or log a default system-owner credential. If no email is configured,
    // preserve an existing owner; otherwise require explicit bootstrap credentials.
    let existingOwner = configuredEmail
      ? await prisma.user.findUnique({ where: { email: configuredEmail } })
      : await prisma.user.findFirst({ where: { role: 'system_owner' }, orderBy: { createdAt: 'asc' } });

    if (existingOwner && existingOwner.role !== 'system_owner') {
      throw new Error('SYSTEM_OWNER_EMAIL belongs to a non-system-owner account. Choose a different email.');
    }

    if (!existingOwner) {
      if (!configuredEmail || !configuredPassword) {
        throw new Error('No system owner exists. Set SYSTEM_OWNER_EMAIL and SYSTEM_OWNER_PASSWORD before starting the application.');
      }
      if (!/^\S+@\S+\.\S+$/.test(configuredEmail)) throw new Error('SYSTEM_OWNER_EMAIL must be a valid email address.');
      if (!isStrongPassword(configuredPassword)) {
        throw new Error('SYSTEM_OWNER_PASSWORD must be at least 12 characters and include uppercase, lowercase, a number, and a symbol.');
      }
      const passwordHash = await bcrypt.hash(configuredPassword, 12);
      existingOwner = await prisma.user.create({
        data: {
          role: 'system_owner',
          username: 'system_owner',
          firstName: 'System',
          secondName: 'Owner',
          email: configuredEmail,
          passwordHash,
          mustChangePassword: false,
          isActive: true
        }
      });
      await prisma.auditLog.create({
        data: { userId: existingOwner.id, action: 'seed_create_system_owner', resourceType: 'user', resourceId: existingOwner.id, details: { seededEmail: configuredEmail } }
      });
      info(`Created initial system-owner account for ${configuredEmail}.`);
    } else {
      info(`System-owner account is ready for ${existingOwner.email}. Existing credentials were not changed.`);
      if (force && configuredPassword) {
        if (!isStrongPassword(configuredPassword)) throw new Error('SYSTEM_OWNER_PASSWORD does not meet the minimum strength requirements.');
        const passwordHash = await bcrypt.hash(configuredPassword, 12);
        await prisma.user.update({ where: { id: existingOwner.id }, data: { passwordHash, mustChangePassword: false, isActive: true } });
        await prisma.auditLog.create({ data: { userId: existingOwner.id, action: 'force_reset_system_owner_password', resourceType: 'user', resourceId: existingOwner.id } });
        info('System-owner password reset because FORCE_SEED=true.');
      }
    }

    // Optional initial-university bootstrap is retained, but no default passwords are used.
    const uniName = process.env.INITIAL_UNIVERSITY_NAME;
    let adminUserId: string | null = null;
    let createdUniId: string | null = null;
    if (uniName) {
      const approveUni = process.env.INITIAL_UNIVERSITY_APPROVE === 'true';
      let university = await prisma.university.findFirst({ where: { name: uniName } });
      if (!university) {
        university = await prisma.university.create({
          data: { name: uniName, country: process.env.INITIAL_UNIVERSITY_COUNTRY || 'Unknown', districtCity: process.env.INITIAL_UNIVERSITY_CITY || 'Unknown', status: approveUni ? 'approved' : 'pending' }
        });
        await prisma.auditLog.create({ data: { userId: existingOwner.id, action: 'seed_create_university', resourceType: 'university', resourceId: university.id, details: { seededName: uniName } } });
        info(`Created initial university ${uniName} (${university.status}).`);
      }
      createdUniId = university.id;

      const adminEmail = process.env.INITIAL_UNIVERSITY_ADMIN_EMAIL?.trim().toLowerCase();
      const adminPassword = process.env.INITIAL_UNIVERSITY_ADMIN_PASSWORD;
      if (adminEmail && adminPassword) {
        if (!isStrongPassword(adminPassword)) throw new Error('INITIAL_UNIVERSITY_ADMIN_PASSWORD must be at least 12 characters and include uppercase, lowercase, a number, and a symbol.');
        let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (admin && (admin.role !== 'university_admin' || admin.universityId !== university.id)) throw new Error('INITIAL_UNIVERSITY_ADMIN_EMAIL is already assigned to a different account.');
        if (!admin) {
          admin = await prisma.user.create({
            data: {
              universityId: university.id,
              role: 'university_admin',
              username: process.env.INITIAL_UNIVERSITY_ADMIN_USERNAME || `uni_admin_${university.id.slice(0, 8)}`,
              firstName: 'University',
              secondName: 'Admin',
              email: adminEmail,
              passwordHash: await bcrypt.hash(adminPassword, 12),
              isActive: university.status === 'approved'
            }
          });
          await prisma.auditLog.create({ data: { userId: existingOwner.id, action: 'seed_create_university_admin', resourceType: 'user', resourceId: admin.id, details: { universityId: university.id } } });
          info(`Created initial university administrator ${adminEmail}; active=${admin.isActive}.`);
        }
        adminUserId = admin.id;
      } else {
        info('Initial university admin not created: provide both INITIAL_UNIVERSITY_ADMIN_EMAIL and INITIAL_UNIVERSITY_ADMIN_PASSWORD.');
      }
    }

    const votersCount = Number(process.env.INITIAL_VOTERS_COUNT || 0);
    if (votersCount > 0 && createdUniId) {
      const registrantId = adminUserId || existingOwner.id;
      const existingVoters = await prisma.voter.count({ where: { universityId: createdUniId } });
      if (existingVoters === 0) {
        const count = Math.min(Math.max(Math.floor(votersCount), 0), 5000);
        const baseReg = (process.env.INITIAL_VOTERS_REG_PREFIX || 'STU').toUpperCase();
        for (let i = 1; i <= count; i++) {
          await prisma.voter.create({
            data: {
              universityId: createdUniId,
              registeredByUserId: registrantId,
              studentRegistrationNumber: `${baseReg}-${1000 + i}`,
              nationalId: `NID${100000 + i}`,
              firstName: process.env.INITIAL_VOTER_FIRSTNAME_PREFIX ? `${process.env.INITIAL_VOTER_FIRSTNAME_PREFIX}${i}` : `Student${i}`,
              secondName: process.env.INITIAL_VOTER_SECONDNAME_PREFIX || 'Test',
              email: process.env.INITIAL_VOTER_EMAIL_DOMAIN ? `student${i}@${process.env.INITIAL_VOTER_EMAIL_DOMAIN}` : null,
              phone: process.env.INITIAL_VOTER_PHONE_PREFIX ? `${process.env.INITIAL_VOTER_PHONE_PREFIX}${i}` : null,
              faculty: process.env.INITIAL_VOTER_FACULTY || 'General Studies',
              college: process.env.INITIAL_VOTER_COLLEGE || 'Main College',
              yearOfStudy: Number(process.env.INITIAL_VOTER_YEAR) || 2,
              approved: process.env.INITIAL_VOTERS_APPROVE === 'true'
            }
          });
        }
        await prisma.auditLog.create({ data: { userId: registrantId, action: 'seed_create_voters', resourceType: 'voter', details: { universityId: createdUniId, count } } });
        info(`Created ${count} initial voter records.`);
      } else {
        info(`University already has ${existingVoters} voters; skipping voter seeding.`);
      }
    }
    info('Seeding completed.');
  } catch (error) {
    console.error('[seed] Failed to initialize accounts/data:', error);
    throw error;
  }
};

if (require.main === module) {
  seedSystemOwner({ force: process.argv.includes('--force') })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
