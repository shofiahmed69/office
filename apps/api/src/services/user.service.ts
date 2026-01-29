import { query } from '../config/database';
import { User } from '../types';
import { AppError } from '../middleware/error.middleware';

export class UserService {
  async getUserById(userId: number): Promise<User> {
    const result = await query(
      `SELECT id, username, email, first_name, last_name, primary_role_id, 
              email_confirmed, active_or_archive, created_at, updated_at
       FROM app_users WHERE id = $1 AND active_or_archive = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  async getUserProfile(userId: number) {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.profile_picture_url, u.phone_number, u.city, u.state,
              r.name as role_name, r.description as role_description
       FROM app_users u
       LEFT JOIN app_access_master_roles r ON u.primary_role_id = r.id
       WHERE u.id = $1 AND u.active_or_archive = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0];
  }

  async updateProfile(userId: number, updates: Partial<User>) {
    const allowedFields = ['first_name', 'last_name', 'phone_number', 'city', 'state', 'profile_picture_url'];
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    values.push(userId);
    const result = await query(
      `UPDATE app_users 
       SET ${setClause.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, username, email, first_name, last_name, updated_at`,
      values
    );

    return result.rows[0];
  }

  async listUsers(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [users, count] = await Promise.all([
      query(
        `SELECT id, username, email, first_name, last_name, created_at
         FROM app_users
         WHERE active_or_archive = true
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM app_users WHERE active_or_archive = true'),
    ]);

    return {
      users: users.rows,
      total: parseInt(count.rows[0].count),
    };
  }
}

export default new UserService();
