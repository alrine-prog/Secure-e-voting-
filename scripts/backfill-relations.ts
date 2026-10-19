// scripts/backfill-relations.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function backfill() {
  try {
    console.log('Starting backfill...');

    // 1) Backfill voters: copy registeredByUserId -> registeredById if user exists
    const voters = await prisma.voter.findMany({
      where: { registeredById: null },
      select: { id: true, registeredByUserId: true }
    });

    console.log(`Found ${voters.length} voters to check for backfill.`);
    for (const v of voters) {
      if (!v.registeredByUserId) continue;
      // check user exists
      const user = await prisma.user.findUnique({ where: { id: v.registeredByUserId } });
      if (user) {
        await prisma.voter.update({
          where: { id: v.id },
          data: { registeredById: user.id }
        });
      } else {
        console.warn(`No user found with id=${v.registeredByUserId} for voter ${v.id}`);
      }
    }

    // 2) Backfill elections: copy createdBy -> createdById if a user with that id exists
    const elections = await prisma.election.findMany({
      where: { createdById: null },
      select: { id: true, createdBy: true }
    });

    console.log(`Found ${elections.length} elections to check for backfill.`);
    for (const e of elections) {
      if (!e.createdBy) continue;
      // If createdBy contains a user id and user exists, copy it
      const user = await prisma.user.findUnique({ where: { id: e.createdBy } });
      if (user) {
        await prisma.election.update({
          where: { id: e.id },
          data: { createdById: user.id }
        });
      } else {
        // If createdBy might be username or email, try to find by those
        const byEmail = await prisma.user.findUnique({ where: { email: e.createdBy } }).catch(() => null);
        if (byEmail) {
          await prisma.election.update({
            where: { id: e.id },
            data: { createdById: byEmail.id }
          });
        } else {
          const byUsername = await prisma.user.findUnique({ where: { username: e.createdBy } }).catch(() => null);
          if (byUsername) {
            await prisma.election.update({
              where: { id: e.id },
              data: { createdById: byUsername.id }
            });
          } else {
            console.warn(`Could not map createdBy=${e.createdBy} for election ${e.id}`);
          }
        }
      }
    }

    console.log('Backfill complete.');
  } catch (err) {
    console.error('Backfill error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
