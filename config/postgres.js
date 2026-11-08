const db = require('../config/postgres');
const redis = require('../config/redis');

async function getUser(id) {
  const cached = await redis.get(`user:${id}`);

  if (cached) {
    return JSON.parse(cached);
  }

  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  const user = result.rows[0];

  await redis.setEx(
    `user:${id}`,
    3600,
    JSON.stringify(user)
  );

  return user;
}

module.exports = { getUser };
