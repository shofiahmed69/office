import { query } from '../config/database';
import { User, AdminUserFilters, PlatformAnalytics } from '../types';
import { AppError } from '../middleware/error.middleware';

export class AdminService {
  async listUsers(filters: AdminUserFilters, page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.role) {
      whereClause += ` AND u.primary_role_id = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.status) {
      if (filters.status === 'active') {
        whereClause += ` AND u.active_or_archive = true AND u.account_lock = false`;
      } else if (filters.status === 'archived') {
        whereClause += ` AND u.active_or_archive = false`;
      } else if (filters.status === 'locked') {
        whereClause += ` AND u.account_lock = true`;
      }
    }

    if (filters.search) {
      whereClause += ` AND (u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    params.push(limit, offset);

    const [users, count] = await Promise.all([
      query(
        `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.active_or_archive,
                u.account_lock, u.email_confirmed, u.created_at, r.name as role_name
         FROM app_users u
         LEFT JOIN app_access_master_roles r ON u.primary_role_id = r.id
         ${whereClause}
         ORDER BY u.created_at DESC
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        params
      ),
      query(
        `SELECT COUNT(*) FROM app_users u ${whereClause}`,
        params.slice(0, -2)
      ),
    ]);

    return {
      users: users.rows,
      total: parseInt(count.rows[0].count),
    };
  }

  async updateUser(adminUserId: number, targetUserId: number, updates: {
    activeOrArchive?: boolean;
    accountLock?: boolean;
    primaryRoleId?: number;
  }): Promise<User> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.activeOrArchive !== undefined) {
      setClauses.push(`active_or_archive = $${paramCount}`);
      values.push(updates.activeOrArchive);
      paramCount++;
    }

    if (updates.accountLock !== undefined) {
      setClauses.push(`account_lock = $${paramCount}`);
      values.push(updates.accountLock);
      paramCount++;
    }

    if (updates.primaryRoleId !== undefined) {
      setClauses.push(`primary_role_id = $${paramCount}`);
      values.push(updates.primaryRoleId);
      paramCount++;
    }

    if (setClauses.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    values.push(targetUserId);

    const result = await query(
      `UPDATE app_users 
       SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, username, email, first_name, last_name, active_or_archive, account_lock, primary_role_id`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Log admin action
    await this.logAdminAction(adminUserId, 'UPDATE_USER', { targetUserId, updates });

    return result.rows[0];
  }

  async sendNotification(adminUserId: number, data: {
    targetUserIds?: number[];
    isGlobal?: boolean;
    title: string;
    message: string;
    notificationType: string;
  }): Promise<{ sent: number }> {
    let targetUsers: number[] = data.targetUserIds || [];

    if (data.isGlobal) {
      const allUsers = await query('SELECT id FROM app_users WHERE active_or_archive = true');
      targetUsers = allUsers.rows.map((r: any) => r.id);
    }

    // Insert notifications
    for (const userId of targetUsers) {
      await query(
        `INSERT INTO app_notifications 
         (user_id, title, message, notification_type, is_read, created_by_user_id)
         VALUES ($1, $2, $3, $4, false, $5)`,
        [userId, data.title, data.message, data.notificationType, adminUserId]
      );
    }

    await this.logAdminAction(adminUserId, 'SEND_NOTIFICATION', { 
      targetCount: targetUsers.length, 
      isGlobal: data.isGlobal,
      title: data.title 
    });

    return { sent: targetUsers.length };
  }

  async getAnalyticsOverview(): Promise<PlatformAnalytics & { recentActivity: any[] }> {
    const [userStats, sessionStats, roadmapStats, recentUsers] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_today,
          COUNT(*) FILTER (WHERE active_or_archive = true) as active_users
        FROM app_users
      `),
      query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as sessions_today,
          COALESCE(AVG(duration_minutes), 0) as avg_duration
        FROM study_sessions WHERE status = 'completed'
      `),
      query(`
        SELECT 
          COUNT(*) as total_roadmaps,
          COUNT(*) FILTER (WHERE status = 'active') as active_roadmaps,
          COALESCE(AVG(progress_percentage), 0) as avg_progress
        FROM user_learning_roadmaps
      `),
      query(`
        SELECT id, username, email, created_at 
        FROM app_users 
        ORDER BY created_at DESC 
        LIMIT 10
      `),
    ]);

    const user = userStats.rows[0];
    const session = sessionStats.rows[0];
    const roadmap = roadmapStats.rows[0];

    return {
      dailyActiveUsers: parseInt(user.new_users_today) || 0,
      totalSignups: parseInt(user.total_users),
      activeSubscriptions: parseInt(roadmap.active_roadmaps),
      studySessionsToday: parseInt(session.sessions_today),
      avgSessionDuration: Math.round(parseFloat(session.avg_duration)),
      recentActivity: recentUsers.rows,
    };
  }

  async getAuditLog(page: number = 1, limit: number = 50): Promise<{ logs: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const [logs, count] = await Promise.all([
      query(
        `SELECT al.*, u.username as admin_username
         FROM admin_audit_log al
         JOIN app_users u ON al.admin_user_id = u.id
         ORDER BY al.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM admin_audit_log'),
    ]);

    return {
      logs: logs.rows,
      total: parseInt(count.rows[0].count),
    };
  }

  private async logAdminAction(adminUserId: number, action: string, details: any): Promise<void> {
    try {
      await query(
        `INSERT INTO admin_audit_log (admin_user_id, action, details)
         VALUES ($1, $2, $3)`,
        [adminUserId, action, JSON.stringify(details)]
      );
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to log admin action:', error);
    }
  }
}

export default new AdminService();
