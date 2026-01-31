import { Request, Response, NextFunction } from 'express'
import contentService from '../services/content.service'
import courseGeneratorService from '../services/courseGenerator.service'
import youtubeService from '../services/youtube.service'
import videoSuggestionService from '../services/videoSuggestion.service'
import { AppError } from '../middleware/error.middleware'
import { sendSuccess } from '../utils/response.utils'

function formatVideoDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export class ContentController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, difficulty, duration, source, page, limit } = req.query;
      const result = await contentService.searchContent({
        q: q as string,
        difficulty: difficulty as string,
        duration: duration as string,
        source: source as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const contentId = parseInt(req.params.id);
      const content = await contentService.getContent(contentId);
      sendSuccess(res, { content });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const contentId = parseInt(req.params.id);
      const progress = await contentService.updateProgress(req.user!.userId, contentId, req.body);
      sendSuccess(res, { progress }, 'Progress updated');
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const { roadmapId, limit } = req.query;
      const recommendations = await contentService.getRecommendations(
        req.user!.userId,
        roadmapId ? parseInt(roadmapId as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      sendSuccess(res, { recommendations });
    } catch (error) {
      next(error);
    }
  }

  async getUserProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await contentService.getUserProgress(req.user!.userId)
      sendSuccess(res, { progress })
    } catch (error) {
      next(error)
    }
  }

  /** Get topic suggestions for content library (from YouTube/Piped/Invidious, same source as videos). */
  async getTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const maxTopics = Math.min(parseInt((req.query.max as string) || '24', 10) || 24, 48)
      const topics = await youtubeService.getTopicSuggestions(maxTopics)
      sendSuccess(res, { topics }, 'Topics loaded')
    } catch (error) {
      next(error)
    }
  }

  /** Get course topics for the current user (from their roadmaps). Used to restrict video suggestions. */
  async getCourseTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const topics = await videoSuggestionService.getCourseTopicsForUser(req.user!.userId)
      sendSuccess(res, { topics }, 'Course topics loaded')
    } catch (error) {
      next(error)
    }
  }

  /**
   * Discover videos by topic. Topic must be one of the user's course topics (from roadmaps).
   * Uses backend cache and relevance filtering so only topic-related videos are returned.
   */
  async discoverByTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const topic = (req.query.topic as string)?.trim()
      const maxResults = Math.min(parseInt((req.query.maxResults as string) || '12', 10) || 12, 25)
      if (!topic) {
        return next(new AppError('Topic is required', 400))
      }
      try {
        const result = await videoSuggestionService.getSuggestionsForTopic(req.user!.userId, topic, maxResults)
        sendSuccess(
          res,
          { topic: result.topic, videos: result.videos, fromCache: result.fromCache },
          'Videos found'
        )
      } catch (err) {
        if (err instanceof AppError && err.statusCode === 400) {
          return next(err)
        }
        const message = err instanceof Error ? err.message : 'Video search is temporarily unavailable.'
        return sendSuccess(res, { topic, videos: [], error: message }, 'No videos found')
      }
    } catch (error) {
      next(error)
    }
  }

  /** Generate personalized course videos for a roadmap from YouTube (MIT, Stanford, etc.) */
  async generateForRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmapId = parseInt(req.params.roadmapId)
      const { maxVideosPerModule, preferMit, preferStanford } = req.query
      const result = await courseGeneratorService.generateForRoadmap(
        req.user!.userId,
        roadmapId,
        {
          maxVideosPerModule: maxVideosPerModule ? parseInt(maxVideosPerModule as string) : undefined,
          preferMit: preferMit !== 'false',
          preferStanford: preferStanford === 'true',
        }
      )
      sendSuccess(res, result, 'Videos generated for roadmap')
    } catch (error) {
      next(error)
    }
  }
}

export default new ContentController()
