import { query } from '../config/database';
import { StudySession, TranscriptChunk } from '../types';
import { AppError } from '../middleware/error.middleware';
import { randomUUID } from 'crypto';

export class SessionService {
  async createSession(userId: number, data: {
    sessionName: string;
    buddyUserId?: number;
    scheduledStartTime?: Date;
    durationMinutes?: number;
    studyTopics?: string[];
    learningGoals?: string[];
    videoCallType?: 'webrtc' | 'daily';
    isAIListeningEnabled?: boolean;
    isPublic?: boolean;
  }): Promise<{ session: StudySession; videoCallRoomId: string; videoCallUrl: string; iceServers: any[] }> {
    const roomId = randomUUID();
    const videoCallUrl = `wss://signal.scholarpass.com/${roomId}`;

    const result = await query(
      `INSERT INTO study_sessions 
       (session_name, host_user_id, study_buddy_user_id, scheduled_start_time, 
        duration_minutes, study_topics, learning_goals, video_call_type, 
        video_call_room_id, video_call_url, is_ai_listening_enabled, is_public, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled')
       RETURNING *`,
      [
        data.sessionName,
        userId,
        data.buddyUserId || null,
        data.scheduledStartTime || null,
        data.durationMinutes || 60,
        JSON.stringify(data.studyTopics || []),
        JSON.stringify(data.learningGoals || []),
        data.videoCallType || 'webrtc',
        roomId,
        videoCallUrl,
        data.isAIListeningEnabled || false,
        data.isPublic || false,
      ]
    );

    return {
      session: result.rows[0],
      videoCallRoomId: roomId,
      videoCallUrl,
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }

  async joinSession(userId: number, sessionId: number): Promise<{ session: StudySession; videoCallCredentials: any }> {
    const result = await query(
      `SELECT ss.*, 
              hu.username as host_username, hu.first_name as host_first_name,
              bu.username as buddy_username, bu.first_name as buddy_first_name
       FROM study_sessions ss
       JOIN app_users hu ON ss.host_user_id = hu.id
       LEFT JOIN app_users bu ON ss.study_buddy_user_id = bu.id
       WHERE ss.id = $1 AND (ss.host_user_id = $2 OR ss.study_buddy_user_id = $2 OR ss.is_public = true)`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found or access denied', 404);
    }

    const session = result.rows[0];

    // Update session to active if scheduled
    if (session.status === 'scheduled') {
      await query(
        `UPDATE study_sessions SET status = 'active', actual_start_time = NOW() WHERE id = $1`,
        [sessionId]
      );
      session.status = 'active';
      session.actual_start_time = new Date();
    }

    return {
      session,
      videoCallCredentials: {
        roomId: session.video_call_room_id,
        videoCallUrl: session.video_call_url,
        sessionToken: `sess_${randomUUID()}`,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    };
  }

  async endSession(userId: number, sessionId: number): Promise<{ sessionId: number; durationMinutes: number; summary: any }> {
    const session = await query(
      `SELECT * FROM study_sessions WHERE id = $1 AND host_user_id = $2`,
      [sessionId, userId]
    );

    if (session.rows.length === 0) {
      throw new AppError('Session not found or not authorized', 404);
    }

    const sessionData = session.rows[0];
    const startTime = sessionData.actual_start_time || sessionData.scheduled_start_time;
    const durationMinutes = startTime 
      ? Math.round((Date.now() - new Date(startTime).getTime()) / 60000)
      : 0;

    // Generate AI summary (simplified - in production would use actual AI)
    const summary = {
      topicsCovered: sessionData.study_topics || [],
      keyInsights: [
        'Discussed main concepts effectively',
        'Identified areas for further study',
      ],
      knowledgeGaps: [],
      actionItems: [
        'Review notes from today',
        'Practice exercises',
      ],
    };

    await query(
      `UPDATE study_sessions 
       SET status = 'completed', actual_end_time = NOW(), duration_minutes = $1,
           ai_summary = $2, ai_key_insights = $3, ai_action_items = $4
       WHERE id = $5`,
      [durationMinutes, JSON.stringify(summary), JSON.stringify(summary.keyInsights), 
       JSON.stringify(summary.actionItems), sessionId]
    );

    // Update buddy stats if applicable
    if (sessionData.study_buddy_user_id) {
      await query(
        `UPDATE study_buddies 
         SET total_sessions = total_sessions + 1, last_session_at = NOW()
         WHERE (user_id_1 = $1 AND user_id_2 = $2) OR (user_id_1 = $2 AND user_id_2 = $1)`,
        [userId, sessionData.study_buddy_user_id]
      );
    }

    return {
      sessionId,
      durationMinutes,
      summary,
    };
  }

  async getSession(userId: number, sessionId: number): Promise<StudySession> {
    const result = await query(
      `SELECT * FROM study_sessions 
       WHERE id = $1 AND (host_user_id = $2 OR study_buddy_user_id = $2 OR is_public = true)`,
      [sessionId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }
    return result.rows[0];
  }

  async getUserSessions(userId: number, status?: string): Promise<StudySession[]> {
    let queryStr = `SELECT * FROM study_sessions 
                    WHERE (host_user_id = $1 OR study_buddy_user_id = $1)`;
    const params: any[] = [userId];

    if (status) {
      queryStr += ` AND status = $2`;
      params.push(status);
    }
    queryStr += ` ORDER BY COALESCE(scheduled_start_time, created_at) DESC`;

    const result = await query(queryStr, params);
    return result.rows;
  }

  async getTranscript(userId: number, sessionId: number): Promise<TranscriptChunk[]> {
    // Verify access
    await this.getSession(userId, sessionId);

    const result = await query(
      `SELECT tc.*, u.username as speaker_name
       FROM study_session_transcription_chunks tc
       LEFT JOIN app_users u ON tc.speaker_user_id = u.id
       WHERE tc.session_id = $1
       ORDER BY tc.sequence_number ASC`,
      [sessionId]
    );
    return result.rows;
  }

  async addTranscriptChunk(sessionId: number, speakerUserId: number | null, text: string, sequenceNumber: number, confidence?: number): Promise<TranscriptChunk> {
    const result = await query(
      `INSERT INTO study_session_transcription_chunks 
       (session_id, speaker_user_id, transcript_text, sequence_number, confidence_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, speakerUserId, text, sequenceNumber, confidence || null]
    );
    return result.rows[0];
  }
}

export default new SessionService();
