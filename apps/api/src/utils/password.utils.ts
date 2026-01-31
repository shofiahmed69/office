import bcrypt from 'bcrypt';

const SALT_ROUNDS = 8; // Balanced security/performance (8 rounds ~100ms, 10 rounds ~300ms)

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
