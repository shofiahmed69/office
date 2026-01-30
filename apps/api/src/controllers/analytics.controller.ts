import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';
import { sendSuccess } from '../utils/response.utils';

export class AnalyticsController {
  async getAttentionTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const result = await analyticsService.getAttentionTracking(req.user!.userId, sessionId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLearningProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await analyticsService.getLearningProgress(req.user!.userId);
      sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  }

  async recordAttention(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const data = await analyticsService.recordAttention(sessionId, req.user!.userId, req.body);
      sendSuccess(res, { data }, 'Attention data recorded');
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
