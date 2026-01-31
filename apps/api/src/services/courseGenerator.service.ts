/**
 * Generates personalized course videos for a learning roadmap by fetching
 * real videos from YouTube (MIT OCW, Stanford, Harvard, Khan, CrashCourse, etc.)
 * and linking them to roadmap modules.
 */

import { query } from '../config/database'
import logger from '../config/logger'
import roadmapService from './roadmap.service'
import youtubeService, { TRUSTED_CHANNEL_IDS } from './youtube.service'
import { AppError } from '../middleware/error.middleware'

export interface GenerateForRoadmapResult {
  roadmapId: number
  modulesProcessed: number
  videosAdded: number
  videosByModule: { moduleId: number; moduleName: string; contentIds: number[] }[]
}

export interface GenerateForRoadmapOptions {
  /** Max videos to fetch per module (default 3) */
  maxVideosPerModule?: number
  /** Prefer MIT OpenCourseWare when available */
  preferMit?: boolean
  /** Prefer Stanford when available */
  preferStanford?: boolean
}

export class CourseGeneratorService {
  private async getYouTubeSourceId(): Promise<number> {
    const result = await query(
      "SELECT id FROM content_sources WHERE type = 'youtube' AND is_active = true LIMIT 1",
      []
    )
    if (result.rows.length === 0) {
      throw new AppError(
        'YouTube content source not found. Run migrations to ensure content_sources has YouTube.',
        503
      )
    }
    return result.rows[0].id
  }

  /**
   * Upsert a single video into educational_content and return content id.
   */
  private async upsertEducationalContent(
    sourceId: number,
    video: {
      externalId: string
      title: string
      description: string
      contentUrl: string
      thumbnailUrl: string
      durationSeconds: number
      channelTitle: string
    },
    topics: string[],
    difficulty: string
  ): Promise<number> {
    const result = await query(
      `INSERT INTO educational_content (
        source_id, external_id, title, description, content_url, thumbnail_url,
        duration_seconds, difficulty_level, topics, quality_score, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0.80, NOW())
      ON CONFLICT (source_id, external_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        thumbnail_url = EXCLUDED.thumbnail_url,
        duration_seconds = EXCLUDED.duration_seconds,
        topics = EXCLUDED.topics,
        updated_at = NOW()
      RETURNING id`,
      [
        sourceId,
        video.externalId,
        video.title.slice(0, 500),
        (video.description || '').slice(0, 5000),
        video.contentUrl,
        video.thumbnailUrl || null,
        video.durationSeconds || 0,
        difficulty || 'intermediate',
        JSON.stringify(topics),
      ]
    )
    return result.rows[0].id
  }

  /**
   * Link content to a roadmap module (idempotent).
   */
  private async linkContentToModule(
    roadmapId: number,
    contentId: number,
    moduleId: number,
    sequenceOrder: number
  ): Promise<void> {
    await query(
      `INSERT INTO roadmap_content (roadmap_id, content_id, module_id, sequence_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (roadmap_id, content_id, module_id) DO NOTHING`,
      [roadmapId, contentId, moduleId, sequenceOrder]
    )
  }

  /**
   * Generate personalized course videos for a roadmap from YouTube and link to modules.
   */
  async generateForRoadmap(
    userId: number,
    roadmapId: number,
    options: GenerateForRoadmapOptions = {}
  ): Promise<GenerateForRoadmapResult> {
    const { maxVideosPerModule = 3, preferMit = true, preferStanford = false } = options

    const roadmap = await roadmapService.getRoadmap(userId, roadmapId)
    const roadmapData = roadmap.roadmapData ?? (roadmap as unknown as { roadmap_data?: typeof roadmap.roadmapData }).roadmap_data
    const modules = roadmapData?.modules || []
    if (modules.length === 0) {
      throw new AppError('Roadmap has no modules', 400)
    }

    const sourceId = await this.getYouTubeSourceId()
    const channelId = preferMit
      ? TRUSTED_CHANNEL_IDS.MIT_OCW
      : preferStanford
        ? TRUSTED_CHANNEL_IDS.STANFORD
        : undefined

    const subject = roadmap.subject || 'Programming'
    const videosByModule: GenerateForRoadmapResult['videosByModule'] = []
    let videosAdded = 0

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i]
      const moduleId = mod.id ?? i + 1
      const moduleName = mod.name || `Module ${moduleId}`
      const topics: string[] = Array.isArray(mod.topics) ? mod.topics : []
      const difficulty = mod.difficulty || 'intermediate'

      const searchQuery =
        topics.length > 0
          ? youtubeService.buildSearchQuery(subject, moduleName, topics[0], preferMit ? 'MIT' : preferStanford ? 'Stanford' : undefined)
          : youtubeService.buildSearchQuery(subject, moduleName, moduleName, preferMit ? 'MIT' : preferStanford ? 'Stanford' : undefined)

      let videos: Awaited<ReturnType<typeof youtubeService.searchVideos>> = []
      try {
        videos = await youtubeService.searchVideos({
          q: searchQuery,
          maxResults: maxVideosPerModule,
          channelId,
          order: 'relevance',
          videoDuration: 'medium',
        })
      } catch (err) {
        logger.warn('[courseGenerator] YouTube search failed for module', { moduleId, error: err instanceof Error ? err.message : String(err) })
      }

      const contentIds: number[] = []
      const topicList = topics.length > 0 ? topics : [moduleName]

      for (let s = 0; s < videos.length; s++) {
        try {
          const contentId = await this.upsertEducationalContent(
            sourceId,
            videos[s],
            topicList,
            difficulty
          )
          contentIds.push(contentId)
          await this.linkContentToModule(roadmapId, contentId, moduleId, s + 1)
          videosAdded += 1
        } catch (e) {
          logger.warn('[courseGenerator] Failed to upsert/link video', { error: e instanceof Error ? e.message : String(e) })
        }
      }

      videosByModule.push({ moduleId, moduleName, contentIds })
    }

    return {
      roadmapId,
      modulesProcessed: modules.length,
      videosAdded,
      videosByModule,
    }
  }
}

export default new CourseGeneratorService()
