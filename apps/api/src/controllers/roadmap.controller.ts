import { Request, Response, NextFunction } from 'express';
import roadmapService from '../services/roadmap.service';
import { sendSuccess } from '../utils/response.utils';

export class RoadmapController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await roadmapService.generateRoadmap(req.user!.userId, req.body);
      sendSuccess(res, { roadmap }, 'Roadmap generated', 201);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmapId = parseInt(req.params.id);
      const roadmap = await roadmapService.getRoadmap(req.user!.userId, roadmapId);
      sendSuccess(res, { roadmap });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmaps = await roadmapService.getUserRoadmaps(req.user!.userId);
      sendSuccess(res, { roadmaps });
    } catch (error) {
      next(error);
    }
  }

  async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmapId = parseInt(req.params.id);
      const moduleId = parseInt(req.params.moduleId);
      const { status } = req.body;
      const roadmap = await roadmapService.updateModuleProgress(req.user!.userId, roadmapId, moduleId, status);
      sendSuccess(res, { roadmap }, 'Module progress updated');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmapId = parseInt(req.params.id);
      const { status } = req.body;
      const roadmap = await roadmapService.updateRoadmapStatus(req.user!.userId, roadmapId, status);
      sendSuccess(res, { roadmap }, 'Roadmap status updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new RoadmapController();
