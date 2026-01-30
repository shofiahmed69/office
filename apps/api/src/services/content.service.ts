import { query } from '../config/database';
import { Content, ContentProgress } from '../types';
import { AppError } from '../middleware/error.middleware';

export class ContentService {
  async searchContent(params: {
    q: string;
    difficulty?: string;
    duration?: string;
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<{ results: Content[]; pagination: { page: number; limit: number; totalResults: number; totalPages: number } }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const offset = (page - 1) * limit;

    let whereClause = "WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', $1)";
    const queryParams: any[] = [params.q];
    let paramCount = 2;

    if (params.difficulty) {
      whereClause += ` AND difficulty_level = $${paramCount}`;
      queryParams.push(params.difficulty);
      paramCount++;
    }

    if (params.duration) {
      const durationMap: Record<string, [number, number]> = {
        short: [0, 600],
        medium: [600, 1800],
        long: [1800, 999999],
      };
      const [min, max] = durationMap[params.duration] || [0, 999999];
      whereClause += ` AND duration_seconds BETWEEN $${paramCount} AND $${paramCount + 1}`;
      queryParams.push(min, max);
      paramCount += 2;
    }

    queryParams.push(limit, offset);

    const [results, countResult] = await Promise.all([
      query(
        `SELECT ec.*, cs.name as source_name, cs.type as source_type
         FROM educational_content ec
         LEFT JOIN content_sources cs ON ec.source_id = cs.id
         ${whereClause}
         ORDER BY quality_score DESC, view_count DESC
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        queryParams
      ),
      query(
        `SELECT COUNT(*) FROM educational_content ${whereClause}`,
        queryParams.slice(0, -2)
      ),
    ]);

    const totalResults = parseInt(countResult.rows[0].count);

    return {
      results: results.rows,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages: Math.ceil(totalResults / limit),
      },
    };
  }

  async getContent(contentId: number): Promise<Content> {
    const result = await query(
      `SELECT ec.*, cs.name as source_name, cs.type as source_type
       FROM educational_content ec
       LEFT JOIN content_sources cs ON ec.source_id = cs.id
       WHERE ec.id = $1`,
      [contentId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Content not found', 404);
    }
    return result.rows[0];
  }

  async updateProgress(userId: number, contentId: number, data: {
    lastPosition: number;
    watchTimeSeconds: number;
    isCompleted?: boolean;
  }): Promise<ContentProgress> {
    const result = await query(
      `INSERT INTO user_content_progress 
       (user_id, content_id, last_position, watch_time_seconds, is_completed, total_duration)
       VALUES ($1, $2, $3, $4, $5, (SELECT duration_seconds FROM educational_content WHERE id = $2))
       ON CONFLICT (user_id, content_id) 
       DO UPDATE SET 
         last_position = $3,
         watch_time_seconds = user_content_progress.watch_time_seconds + $4,
         is_completed = COALESCE($5, user_content_progress.is_completed),
         completed_at = CASE WHEN $5 = true THEN NOW() ELSE user_content_progress.completed_at END,
         updated_at = NOW()
       RETURNING *`,
      [userId, contentId, data.lastPosition, data.watchTimeSeconds, data.isCompleted || false]
    );
    return result.rows[0];
  }

  async getRecommendations(userId: number, roadmapId?: number, limit: number = 10): Promise<Content[]> {
    // Get user's skill gaps and interests for personalized recommendations
    let topics: string[] = [];
    
    if (roadmapId) {
      const roadmap = await query(
        'SELECT roadmap_data FROM user_learning_roadmaps WHERE id = $1 AND user_id = $2',
        [roadmapId, userId]
      );
      if (roadmap.rows.length > 0) {
        const currentModule = roadmap.rows[0].roadmap_data.modules.find(
          (m: any) => m.status === 'in_progress' || m.status === 'not_started'
        );
        if (currentModule) {
          topics = currentModule.topics;
        }
      }
    }

    // Get content not yet completed by user, prioritizing topics from current module
    const result = await query(
      `SELECT ec.*, cs.name as source_name
       FROM educational_content ec
       LEFT JOIN content_sources cs ON ec.source_id = cs.id
       LEFT JOIN user_content_progress ucp ON ec.id = ucp.content_id AND ucp.user_id = $1
       WHERE ucp.is_completed IS NULL OR ucp.is_completed = false
       ORDER BY quality_score DESC, view_count DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  async getUserProgress(userId: number): Promise<ContentProgress[]> {
    const result = await query(
      `SELECT ucp.*, ec.title, ec.thumbnail_url
       FROM user_content_progress ucp
       JOIN educational_content ec ON ucp.content_id = ec.id
       WHERE ucp.user_id = $1
       ORDER BY ucp.updated_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

export default new ContentService();
