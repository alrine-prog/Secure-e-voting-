// src/seed.ts
import prisma from './prismaClient';
import bcrypt from 'bcrypt';

type SeedOptions = {
  force?: boolean;
};

const isProduction = process.env.NODE_ENV === 'production';

const warn = (msg: string) => console.warn('[seed] WARNING:', msg);
const info = (msg: string) => console.log('[seed]', msg);

const isWeakPassword = (p: string) => {
  if (!p) return true;
  if (p.length < 8) return true;
  const weakList = ['password', '123456', 'admin', 'alrine@26', 'changeme', '12345678'];
  return weakList.includes(p.toLowerCase());
};

export const seedSystemOwner = async (opts: SeedOptions = {}) => {
  const force = !!opts.force || process.env.FORCE_SEED === 'true';
  const systemEmail = process.env.SYSTEM_OWNER_EMAIL || 'info.alrine@gmail.com';
  const systemPassword = process.env.SYSTEM_OWNER_PASSWORD || 'alrine@26';

  if (isProduction && !force) {
    info('NODE_ENV=production and FORCE_SEED not set. Skipping seeding. Set FORCE_SEED=true to override.');
    return;
  }

  try {
    info(`Starting seed (force=${force})...`);

    let systemUserId: string | null = null;

    const existing = await prisma.user.findUnique({ where: { email: systemEmail } });
    if (existing) {
      info(`System owner already exists: ${systemEmail}`);
      systemUserId = existing.id;
    } else {
      if (isWeakPassword(systemPassword)) {
        warn('The SYSTEM_OWNER_PASSWORD looks weak or is set to the default; please set a stronger password in production.');
      }

      const passwordHash = await bcrypt.hash(systemPassword, 12);
      const user = await prisma.user.create({
        data: {
          role: 'system_owner',
          username: 'system_owner',
          firstName: 'System',
          secondName: 'Owner',
          email: systemEmail,
          passwordHash,
          isActive: true
        }
      });
      info(`Seeded system owner: ${systemEmail} (id=${user.id})`);
      systemUserId = user.id;

      await prisma.auditLog.create({
        data: {
          userId: systemUserId,
          action: 'seed_create_system_owner',
          resourceType: 'user',
          resourceId: user.id,
          details: { seededEmail: systemEmail }
        }
      });
    }

    // Optional: create an initial university + its admin when environment variables are provided
    const uniName = process.env.INITIAL_UNIVERSITY_NAME;
    let adminUserId: string | null = null;
    let createdUniId: string | null = null;

    if (uniName) {
      const uniCountry = process.env.INITIAL_UNIVERSITY_COUNTRY || 'Unknown';
      const uniCity = process.env.INITIAL_UNIVERSITY_CITY || 'Unknown';
      const adminEmail = process.env.INITIAL_UNIVERSITY_ADMIN_EMAIL;
      const adminPassword = process.env.INITIAL_UNIVERSITY_ADMIN_PASSWORD;
      const adminUsername = process.env.INITIAL_UNIVERSITY_ADMIN_USERNAME || 'uni_admin';

      const existingUni = await prisma.university.findFirst({ where: { name: uniName } });
      if (existingUni) {
        info(`Initial university already exists: ${uniName}`);
        createdUniId = existingUni.id;
      } else {
        const approveUni = process.env.INITIAL_UNIVERSITY_APPROVE === 'true';
        const uni = await prisma.university.create({
          data: {
            name: uniName,
            country: uniCountry,
            districtCity: uniCity,
            status: approveUni ? 'approved' : 'pending'
          }
        });
        info(`Created initial university: ${uni.name} (id=${uni.id}, status=${uni.status})`);
        createdUniId = uni.id;

        await prisma.auditLog.create({
          data: {
            userId: systemUserId,
            action: 'seed_create_university',
            resourceType: 'university',
            resourceId: uni.id,
            details: { seededName: uniName }
          }
        });
      }

      // create admin if provided
      if (adminEmail && adminPassword) {
        const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingAdmin) {
          info(`Initial university admin already exists: ${adminEmail}`);
          adminUserId = existingAdmin.id;
        } else {
          if (isWeakPassword(adminPassword)) {
            warn('INITIAL_UNIVERSITY_ADMIN_PASSWORD looks weak — change before production use.');
          }
          const hash = await bcrypt.hash(adminPassword, 12);
          const user = await prisma.user.create({
            data: {
              universityId: createdUniId!,
              role: 'university_admin',
              username: adminUsername,
              firstName: 'University',
              secondName: 'Admin',
              email: adminEmail,
              passwordHash: hash,
              isActive: process.env.INITIAL_UNIVERSITY_APPROVE === 'true' ? true : false
            }
          });
          info(`Created initial university admin: ${adminEmail} (id=${user.id}, active=${user.isActive})`);
          adminUserId = user.id;

          await prisma.auditLog.create({
            data: {
              userId: systemUserId,
              action: 'seed_create_university_admin',
              resourceType: 'user',
              resourceId: user.id,
              details: { universityId: createdUniId }
            }
          });
        }
      } else {
        info('No INITIAL_UNIVERSITY_ADMIN_EMAIL/INITIAL_UNIVERSITY_ADMIN_PASSWORD provided — skipping admin creation.');
      }
    } else {
      info('No INITIAL_UNIVERSITY_NAME provided — skipping initial university creation.');
    }

    // New: Seed voters for the initial university if requested
    const votersCount = Number(process.env.INITIAL_VOTERS_COUNT || 0);
    const votersApprove = process.env.INITIAL_VOTERS_APPROVE === 'true';

    if (votersCount > 0 && createdUniId) {
      // Ensure we have a registrant user to assign as registeredByUserId
      const registrantId = adminUserId || systemUserId;
      if (!registrantId) {
        warn('No admin or system owner user available to register voters; skipping voter seeding.');
      } else {
        const existingVoters = await prisma.voter.count({ where: { universityId: createdUniId } });
        if (existingVoters > 0) {
          info(`University already has ${existingVoters} voters; skipping seeding additional voters.`);
        } else {
          info(`Seeding ${votersCount} voters for university id=${createdUniId} (approved=${votersApprove})`);
          const baseReg = (process.env.INITIAL_VOTERS_REG_PREFIX || 'STU').toUpperCase();
          const createPromises: Promise<any>[] = [];

          for (let i = 1; i <= votersCount; i++) {
            const firstName = process.env.INITIAL_VOTER_FIRSTNAME_PREFIX ? `${process.env.INITIAL_VOTER_FIRSTNAME_PREFIX}${i}` : `Student${i}`;
            const secondName = process.env.INITIAL_VOTER_SECONDNAME_PREFIX || 'Test';
            const studentRegistrationNumber = `${baseReg}-${1000 + i}`;
            const nationalId = `NID${100000 + i}`;
            const email = process.env.INITIAL_VOTER_EMAIL_DOMAIN ? `student${i}@${process.env.INITIAL_VOTER_EMAIL_DOMAIN}` : undefined;
            const phone = process.env.INITIAL_VOTER_PHONE_PREFIX ? `${process.env.INITIAL_VOTER_PHONE_PREFIX}${i}` : undefined;
            const faculty = process.env.INITIAL_VOTER_FACULTY || 'General Studies';
            const college = process.env.INITIAL_VOTER_COLLEGE || 'Main College';
            const yearOfStudy = Number(process.env.INITIAL_VOTER_YEAR) || 2;

            createPromises.push(
              prisma.voter.create({
                data: {
                  universityId: createdUniId,
                  registeredByUserId: registrantId,
                  studentRegistrationNumber,
                  nationalId,
                  firstName,
                  secondName,
                  email,
                  phone,
                  faculty,
                  college,
                  yearOfStudy,
                  approved: votersApprove
                }
              })
            );
          }

          const created = await Promise.all(createPromises);
          info(`Created ${created.length} voters for university ${createdUniId}`);

          // audit log entry
          await prisma.auditLog.create({
            data: {
              userId: registrantId,
              action: 'seed_create_voters',
              resourceType: 'voter',
              resourceId: null,
              details: { universityId: createdUniId, count: created.length }
            }
          });
        }
      }
    }

    info('Seeding completed.');
  } catch (err: any) {
    console.error('[seed] Error during seeding:', err);
    throw err;
  }
};

// If invoked directly
if (require.main === module) {
  const forceFlag = process.env.FORCE_SEED === 'true' || process.argv.includes('--force');
  seedSystemOwner({ force: forceFlag })
    .then(() => {
      console.log('[seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[seed] Failed:', err);
      process.exit(1);
    });
  }
