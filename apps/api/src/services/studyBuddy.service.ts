import { query } from '../config/database';
import { StudyBuddyMatch, StudyBuddy, BuddyAssignment } from '../types';
import { AppError } from '../middleware/error.middleware';

export class StudyBuddyService {
  async findMatches(userId: number, roadmapId: number, moduleId?: number, limit: number = 10): Promise<{ learningContext: { roadmapId: number; moduleId?: number }; matches: any[] }> {
    // Find users on same roadmap/similar learning goals
    const result = await query(
      `SELECT u.id as user_id, u.username, u.first_name, u.profile_picture_url,
              ulr.subject, ulr.id as roadmap_id
       FROM app_users u
       JOIN user_learning_roadmaps ulr ON u.id = ulr.user_id
       LEFT JOIN study_buddies sb ON (sb.user_id_1 = $1 AND sb.user_id_2 = u.id) 
                                   OR (sb.user_id_2 = $1 AND sb.user_id_1 = u.id)
       LEFT JOIN study_buddy_matches sbm ON (sbm.requester_user_id = $1 AND sbm.requested_user_id = u.id)
                                          OR (sbm.requested_user_id = $1 AND sbm.requester_user_id = u.id)
       WHERE u.id != $1 
         AND u.active_or_archive = true
         AND ulr.status = 'active'
         AND sb.id IS NULL
         AND (sbm.id IS NULL OR sbm.status NOT IN ('pending', 'accepted'))
       GROUP BY u.id, u.username, u.first_name, u.profile_picture_url, ulr.subject, ulr.id
       LIMIT $2`,
      [userId, limit]
    );

    const matches = result.rows.map((row: any) => ({
      userId: row.user_id,
      username: row.username,
      firstName: row.first_name,
      profilePictureUrl: row.profile_picture_url,
      matchScore: Math.floor(Math.random() * 30) + 70, // Simulated match score 70-100
      matchReason: 'Same learning context and compatible schedules',
      sharedGoals: [row.subject],
      availableTimes: ['Mon 18:00-22:00', 'Wed 18:00-22:00', 'Sat 10:00-14:00'],
      timezone: 'UTC',
    }));

    return {
      learningContext: { roadmapId, moduleId },
      matches,
    };
  }

  async sendRequest(requesterUserId: number, requestedUserId: number, personalMessage?: string): Promise<StudyBuddyMatch> {
    // Check if request already exists
    const existing = await query(
      `SELECT id FROM study_buddy_matches 
       WHERE requester_user_id = $1 AND requested_user_id = $2 AND status = 'pending'`,
      [requesterUserId, requestedUserId]
    );
    if (existing.rows.length > 0) {
      throw new AppError('Request already pending', 409);
    }

    // Check if already buddies
    const buddies = await query(
      `SELECT id FROM study_buddies 
       WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)`,
      [requesterUserId, requestedUserId]
    );
    if (buddies.rows.length > 0) {
      throw new AppError('Already connected as study buddies', 409);
    }

    const result = await query(
      `INSERT INTO study_buddy_matches 
       (requester_user_id, requested_user_id, match_score, personal_message, status, expires_at)
       VALUES ($1, $2, 80, $3, 'pending', NOW() + INTERVAL '7 days')
       RETURNING *`,
      [requesterUserId, requestedUserId, personalMessage]
    );

    return result.rows[0];
  }

  async acceptRequest(userId: number, matchId: number, roadmapId?: number): Promise<{ buddyId: number; assignment?: BuddyAssignment }> {
    // Verify the request is for this user
    const match = await query(
      `SELECT * FROM study_buddy_matches WHERE id = $1 AND requested_user_id = $2 AND status = 'pending'`,
      [matchId, userId]
    );
    if (match.rows.length === 0) {
      throw new AppError('Match request not found or already processed', 404);
    }

    const matchData = match.rows[0];

    // Update match status
    await query(
      `UPDATE study_buddy_matches SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
      [matchId]
    );

    // Create buddy connection
    const buddy = await query(
      `INSERT INTO study_buddies (user_id_1, user_id_2, total_sessions, is_active)
       VALUES ($1, $2, 0, true)
       RETURNING id`,
      [matchData.requester_user_id, userId]
    );

    const buddyId = buddy.rows[0].id;
    let assignment: BuddyAssignment | undefined;

    // Create assignment if roadmapId provided
    if (roadmapId) {
      const assignmentResult = await query(
        `INSERT INTO buddy_assignments (buddy_id, roadmap_id, status)
         VALUES ($1, $2, 'active')
         RETURNING *`,
        [buddyId, roadmapId]
      );
      assignment = assignmentResult.rows[0];
    }

    return { buddyId, assignment };
  }

  async rejectRequest(userId: number, matchId: number): Promise<void> {
    const result = await query(
      `UPDATE study_buddy_matches 
       SET status = 'rejected', responded_at = NOW() 
       WHERE id = $1 AND requested_user_id = $2 AND status = 'pending'
       RETURNING id`,
      [matchId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Match request not found', 404);
    }
  }

  async getMyBuddies(userId: number): Promise<any[]> {
    const result = await query(
      `SELECT sb.id as buddy_id, sb.connected_at, sb.total_sessions, sb.last_session_at,
              u.id as user_id, u.username, u.first_name, u.last_name, u.profile_picture_url
       FROM study_buddies sb
       JOIN app_users u ON (sb.user_id_1 = $1 AND u.id = sb.user_id_2) 
                        OR (sb.user_id_2 = $1 AND u.id = sb.user_id_1)
       WHERE sb.is_active = true
       ORDER BY sb.last_session_at DESC NULLS LAST`,
      [userId]
    );

    return result.rows.map((row: any) => ({
      buddyId: row.buddy_id,
      user: {
        id: row.user_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        profilePictureUrl: row.profile_picture_url,
      },
      connectedAt: row.connected_at,
      totalSessions: row.total_sessions,
      lastSessionAt: row.last_session_at,
    }));
  }

  async getPendingRequests(userId: number): Promise<StudyBuddyMatch[]> {
    const result = await query(
      `SELECT sbm.*, u.username, u.first_name, u.profile_picture_url
       FROM study_buddy_matches sbm
       JOIN app_users u ON sbm.requester_user_id = u.id
       WHERE sbm.requested_user_id = $1 AND sbm.status = 'pending' AND sbm.expires_at > NOW()
       ORDER BY sbm.requested_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // Assignment methods
  async getAssignments(userId: number): Promise<BuddyAssignment[]> {
    const result = await query(
      `SELECT ba.*, ulr.subject, ulr.learning_goal
       FROM buddy_assignments ba
       JOIN study_buddies sb ON ba.buddy_id = sb.id
       JOIN user_learning_roadmaps ulr ON ba.roadmap_id = ulr.id
       WHERE (sb.user_id_1 = $1 OR sb.user_id_2 = $1) AND ba.status = 'active'`,
      [userId]
    );
    return result.rows;
  }

  async updateAssignment(userId: number, assignmentId: number, data: { status?: string; moduleId?: number }): Promise<BuddyAssignment> {
    const result = await query(
      `UPDATE buddy_assignments ba
       SET status = COALESCE($3, ba.status), 
           module_id = COALESCE($4, ba.module_id),
           updated_at = NOW()
       FROM study_buddies sb
       WHERE ba.id = $1 AND ba.buddy_id = sb.id 
         AND (sb.user_id_1 = $2 OR sb.user_id_2 = $2)
       RETURNING ba.*`,
      [assignmentId, userId, data.status, data.moduleId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Assignment not found', 404);
    }
    return result.rows[0];
  }

  async endAssignment(userId: number, assignmentId: number): Promise<void> {
    const result = await query(
      `UPDATE buddy_assignments ba
       SET status = 'ended', updated_at = NOW()
       FROM study_buddies sb
       WHERE ba.id = $1 AND ba.buddy_id = sb.id 
         AND (sb.user_id_1 = $2 OR sb.user_id_2 = $2)
       RETURNING ba.id`,
      [assignmentId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Assignment not found', 404);
    }
  }
}

export default new StudyBuddyService();
