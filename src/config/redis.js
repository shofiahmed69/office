const { createClient } = require('redis');

let redisClient = null;

const REDIS_TIMEOUT_MS = 3000;

async function getRedis() {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = createClient({ url, socket: { connectTimeout: REDIS_TIMEOUT_MS } });
  client.on('error', (err) => console.error('Redis error:', err.message));
  const connectPromise = client.connect();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Redis connection timeout')), REDIS_TIMEOUT_MS + 500)
  );
  try {
    await Promise.race([connectPromise, timeoutPromise]);
    redisClient = client;
    return redisClient;
  } catch (err) {
    try { await client.quit(); } catch (_) {}
    throw err;
  }
}

module.exports = { getRedis };
