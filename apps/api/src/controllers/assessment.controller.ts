import { Request, Response, NextFunction } from 'express';
import assessmentService from '../services/assessment.service';
import { sendSuccess } from '../utils/response.utils';

export class AssessmentController {
  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const { subjectId, subjectName } = req.body;
      const result = await assessmentService.startAssessment(req.user!.userId, subjectId, subjectName);
      sendSuccess(res, result, 'Assessment started', 201);
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const assessmentId = parseInt(req.params.id);
      const { questionId, answerId, timeSpentSeconds } = req.body;
      const result = await assessmentService.submitAnswer(
        req.user!.userId,
        assessmentId,
        questionId,
        answerId,
        timeSpentSeconds
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const assessmentId = parseInt(req.params.id);
      const result = await assessmentService.completeAssessment(req.user!.userId, assessmentId);
      sendSuccess(res, result, 'Assessment completed');
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const assessments = await assessmentService.getAssessmentHistory(req.user!.userId);
      sendSuccess(res, { assessments });
    } catch (error) {
      next(error);
    }
  }
}

export default new AssessmentController();
