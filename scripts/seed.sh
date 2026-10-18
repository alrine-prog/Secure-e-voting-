export NODE_ENV=development
export FORCE_SEED=true
export SYSTEM_OWNER_EMAIL=admin@example.com
export SYSTEM_OWNER_PASSWORD='StrongSeedPass!23'

export INITIAL_UNIVERSITY_NAME='Example University'
export INITIAL_UNIVERSITY_COUNTRY='Uganda'
export INITIAL_UNIVERSITY_CITY='Lira'
export INITIAL_UNIVERSITY_ADMIN_EMAIL='uniadmin@example.edu'
export INITIAL_UNIVERSITY_ADMIN_PASSWORD='UniAdminPass!123'
export INITIAL_UNIVERSITY_APPROVE=true

export INITIAL_VOTERS_COUNT=50
export INITIAL_VOTERS_APPROVE=true
export INITIAL_VOTERS_REG_PREFIX=STU
export INITIAL_VOTER_EMAIL_DOMAIN=example.edu
export INITIAL_VOTER_PHONE_PREFIX='+2567851572'
export INITIAL_VOTER_FIRSTNAME_PREFIX='Student'

# Run the seed (if using ts-node)
npx ts-node src/seed.ts --force
# or if compiled:
# node dist/src/seed.js (with FORCE_SEED=true)
