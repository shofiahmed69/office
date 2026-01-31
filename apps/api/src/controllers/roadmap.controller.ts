import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import roadmapService from '../services/roadmap.service';
import contentService from '../services/content.service';
import courseGeneratorService from '../services/courseGenerator.service';
import { sendSuccess } from '../utils/response.utils';
import { RoadmapModule } from '../types';

// Helper to safely enrich roadmap objects with sub-content
async function enrichRoadmapWithSubContents(roadmap: any): Promise<any> {
  if (!roadmap || typeof roadmap !== 'object') return roadmap;

  const roadmapId = Number(roadmap.id);
  if (!Number.isInteger(roadmapId)) return roadmap;

  const roadmapData = (roadmap.roadmapData ?? roadmap.roadmap_data) as { modules?: RoadmapModule[] } | undefined;
  const modules = roadmapData?.modules ?? [];
  if (modules.length === 0) return roadmap;

  const contentByModule = await contentService.getContentByRoadmap(roadmapId);
  for (const mod of modules) {
    mod.subContents = contentByModule[mod.id] ?? [];
  }
  return roadmap;
}

export class RoadmapController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await roadmapService.generateRoadmap(req.user!.userId, req.body);
      const roadmapId = roadmap.id;
      try {
        await courseGeneratorService.generateForRoadmap(req.user!.userId, roadmapId, {
          maxVideosPerModule: 4,
          preferMit: true,
        });
      } catch (genErr) {
        logger.warn('[roadmap] Course content generation failed (roadmap still created)', { error: genErr instanceof Error ? genErr.message : String(genErr) })
      }
      const enriched = await enrichRoadmapWithSubContents(roadmap);
      sendSuccess(res, { roadmap: enriched }, 'Roadmap generated', 201);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmapId = parseInt(req.params.id, 10);
      const roadmap = await roadmapService.getRoadmap(req.user!.userId, roadmapId);
      const enriched = await enrichRoadmapWithSubContents(roadmap);
      sendSuccess(res, { roadmap: enriched });
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
