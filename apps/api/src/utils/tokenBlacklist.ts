import redis from '../config/redis'
import logger from '../config/logger'

const PREFIX = 'token_blacklist:'
const ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 3600 // 7 days (match access token expiry)

/**
 * Add an access token to the blacklist (e.g. on logout).
 * TTL matches access token expiry so Redis keys are cleaned up.
 */
export async function addToBlacklist(token: string, ttlSeconds: number = ACCESS_TOKEN_TTL_SECONDS): Promise<void> {
  try {
    await redis.set(PREFIX + token, '1', 'EX', ttlSeconds)
  } catch (err) {
    logger.warn('Token blacklist add failed (Redis)', { error: err instanceof Error ? err.message : err })
  }
}

/**
 * Check if a token is blacklisted. Returns false on Redis errors so auth can proceed.
 */
export async function isBlacklisted(token: string): Promise<boolean> {
  try {
    const value = await redis.get(PREFIX + token)
    return value === '1'
  } catch (err) {
    logger.warn('Token blacklist check failed (Redis)', { error: err instanceof Error ? err.message : err })
    return false
  }
}
