export NODE_ENV=development
export FORCE_SEED=true
export SYSTEM_OWNER_EMAIL=admin@example.com
export SYSTEM_OWNER_PASSWORD='StrongSeedPass!23'

export INITIAL_UNIVERSITY_NAME='e.g Kyambogo University'
export INITIAL_UNIVERSITY_COUNTRY=' e.g Uganda'
export INITIAL_UNIVERSITY_CITY=' e.g Kampala'
export INITIAL_UNIVERSITY_ADMIN_EMAIL='job@kyambyogo.ac.ug'
export INITIAL_UNIVERSITY_ADMIN_PASSWORD='UniAdminPass!123'
export INITIAL_UNIVERSITY_APPROVE=true

export INITIAL_VOTERS_COUNT=100
export INITIAL_VOTERS_APPROVE=true
export INITIAL_VOTERS_REG_PREFIX= M00
export INITIAL_VOTER_EMAIL_DOMAIN=name@example.ac.ug
export INITIAL_VOTER_PHONE_PREFIX='+256785157237'
export INITIAL_VOTER_FIRSTNAME_PREFIX='Albert'
export INITIAL_VOTER_LASTNAME_PREFIX='e.g Ocen'

# Run the seed (if using ts-node)
npx ts-node src/seed.ts --force
# or if compiled:
# node dist/src/seed.js (with FORCE_SEED=true)
