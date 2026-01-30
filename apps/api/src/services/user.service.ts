import { query } from '../config/database';
import { User, UserTag } from '../types';
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

  async addUserTag(userId: number, tagData: {
    tagName: string;
    tagValue?: string;
    masterTagId?: number;
    ratingScore?: number;
    sourceType?: 'manual' | 'ai' | 'imported';
  }): Promise<UserTag> {
    const result = await query(
      `INSERT INTO app_user_tags 
       (user_id, tag_name, tag_value, master_tag_id, rating_score, source_type, is_filled, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, true, $1)
       RETURNING id, user_id, tag_name, tag_value, master_tag_id, rating_score, source_type, is_filled, is_verified, created_at`,
      [userId, tagData.tagName, tagData.tagValue || null, tagData.masterTagId || null, 
       tagData.ratingScore || null, tagData.sourceType || 'manual']
    );
    return result.rows[0];
  }

  async getUserTags(userId: number): Promise<UserTag[]> {
    const result = await query(
      `SELECT id, user_id, tag_name, tag_value, master_tag_id, rating_score, 
              source_type, is_filled, is_verified, created_at
       FROM app_user_tags 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async deleteUserTag(userId: number, tagId: number): Promise<void> {
    const result = await query(
      'DELETE FROM app_user_tags WHERE id = $1 AND user_id = $2 RETURNING id',
      [tagId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Tag not found', 404);
    }
  }
}

export default new UserService();
