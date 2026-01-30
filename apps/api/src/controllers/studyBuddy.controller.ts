import { Request, Response, NextFunction } from 'express';
import studyBuddyService from '../services/studyBuddy.service';
import { sendSuccess } from '../utils/response.utils';

export class StudyBuddyController {
  async findMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { roadmapId, moduleId, limit } = req.query;
      const result = await studyBuddyService.findMatches(
        req.user!.userId,
        parseInt(roadmapId as string),
        moduleId ? parseInt(moduleId as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async sendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestedUserId, personalMessage } = req.body;
      const match = await studyBuddyService.sendRequest(req.user!.userId, requestedUserId, personalMessage);
      sendSuccess(res, { match }, 'Request sent', 201);
    } catch (error) {
      next(error);
    }
  }

  async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = parseInt(req.params.matchId);
      const { roadmapId } = req.body;
      const result = await studyBuddyService.acceptRequest(req.user!.userId, matchId, roadmapId);
      sendSuccess(res, result, 'Request accepted');
    } catch (error) {
      next(error);
    }
  }

  async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = parseInt(req.params.matchId);
      await studyBuddyService.rejectRequest(req.user!.userId, matchId);
      sendSuccess(res, null, 'Request rejected');
    } catch (error) {
      next(error);
    }
  }

  async getMyBuddies(req: Request, res: Response, next: NextFunction) {
    try {
      const buddies = await studyBuddyService.getMyBuddies(req.user!.userId);
      sendSuccess(res, { buddies });
    } catch (error) {
      next(error);
    }
  }

  async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await studyBuddyService.getPendingRequests(req.user!.userId);
      sendSuccess(res, { requests });
    } catch (error) {
      next(error);
    }
  }

  // Assignments
  async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const assignments = await studyBuddyService.getAssignments(req.user!.userId);
      sendSuccess(res, { assignments });
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const assignment = await studyBuddyService.updateAssignment(req.user!.userId, assignmentId, req.body);
      sendSuccess(res, { assignment }, 'Assignment updated');
    } catch (error) {
      next(error);
    }
  }

  async endAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      await studyBuddyService.endAssignment(req.user!.userId, assignmentId);
      sendSuccess(res, null, 'Assignment ended');
    } catch (error) {
      next(error);
    }
  }
}

export default new StudyBuddyController();
