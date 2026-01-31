import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { User, AuthTokens } from '../types';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(username: string, email: string, password: string, firstName: string, lastName: string) {
    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM app_users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO app_users 
       (username, email, password_hash, first_name, last_name, primary_role_id, email_confirmed, active_or_archive)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, username, email, first_name, last_name, primary_role_id, created_at`,
      [username, email, passwordHash, firstName, lastName, 3, false, true] // 3 = Student role
    );

    return result.rows[0];
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Get user
    const result = await query(
      `SELECT u.*, r.name as role_name 
       FROM app_users u
       LEFT JOIN app_access_master_roles r ON u.primary_role_id = r.id
       WHERE u.email = $1 AND u.active_or_archive = true`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRow = result.rows[0] as any;

    // Check if account is locked
    if (userRow.account_lock) {
      throw new AppError('Account is locked', 403);
    }

    // Verify password
    const isValid = await comparePassword(password, userRow.password_hash);
    if (!isValid) {
      const MAX_ATTEMPTS = 5;
      const currentFailedCount = (Number(userRow.access_failed_count) || 0) + 1;

      let updateQuery = 'UPDATE app_users SET access_failed_count = access_failed_count + 1';

      if (currentFailedCount >= MAX_ATTEMPTS) {
        updateQuery += ', account_lock = true';
      }

      updateQuery += ' WHERE id = $1';

      // Increment failed attempts and potentially lock account
      await query(updateQuery, [userRow.id]);

      if (currentFailedCount >= MAX_ATTEMPTS) {
         throw new AppError('Account is locked', 403);
      }

      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens immediately
    const payload = {
      userId: userRow.id,
      email: userRow.email,
      role: userRow.role_name,
    };

    const tokens = {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };

    // Reset failed attempts and unlock account
    await query(
      'UPDATE app_users SET access_failed_count = 0, account_lock = false WHERE id = $1',
      [userRow.id]
    );

    // Return user without password_hash using destructuring
    const { password_hash: _password, ...user } = userRow;

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Extract only the necessary payload fields (exclude iat, exp, etc.)
    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    // Generate new tokens
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export default new AuthService();

