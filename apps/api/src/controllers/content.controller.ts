import { Request, Response, NextFunction } from 'express';
import contentService from '../services/content.service';
import { sendSuccess } from '../utils/response.utils';

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
      const progress = await contentService.getUserProgress(req.user!.userId);
      sendSuccess(res, { progress });
    } catch (error) {
      next(error);
    }
  }
}

export default new ContentController();
