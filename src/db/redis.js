import { createClient } from 'redis';
import { config } from '../config/index.js';

let redisClient = null;

export async function getRedis() {
  if (!config.redisUrl) return null;
  if (redisClient) return redisClient;
  try {
    redisClient = createClient({ url: config.redisUrl });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.warn('Redis not available, continuing without cache:', err.message);
    return null;
  }
}
