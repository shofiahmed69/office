import { Request, Response, NextFunction } from 'express'
import assessmentService from '../services/assessment.service'
import aiAssessmentService from '../services/aiAssessment.service'
import { sendSuccess } from '../utils/response.utils'

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

  /** Complete assessment with results from frontend (AI flow); saves scores, weak points, concepts */
  async completeWithResults(req: Request, res: Response, next: NextFunction) {
    try {
      const assessmentId = parseInt(req.params.id);
      const { answers, timeSpentSeconds } = req.body;
      const result = await assessmentService.completeAssessmentWithResults(
        req.user!.userId,
        assessmentId,
        { answers, timeSpentSeconds }
      );
      sendSuccess(res, result, 'Assessment results saved');
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const assessments = await assessmentService.getAssessmentHistory(req.user!.userId)
      sendSuccess(res, { assessments })
    } catch (error) {
      next(error)
    }
  }

  /** AI-powered: Generate questions using Ollama */
  async generateQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { subject, difficulty, numQuestions, topics } = req.body
      const questions = await aiAssessmentService.generateQuestions({
        subject,
        difficulty: difficulty || 'intermediate',
        numQuestions: numQuestions || 10,
        topics,
      })
      sendSuccess(res, { questions }, 'Questions generated successfully')
    } catch (error) {
      next(error)
    }
  }

  /** AI-powered: Evaluate answer with AI feedback */
  async evaluateAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId, userAnswer, correctAnswer } = req.body
      const evaluation = await aiAssessmentService.evaluateAnswer({
        questionId,
        userAnswer,
        correctAnswer,
      })
      sendSuccess(res, evaluation)
    } catch (error) {
      next(error)
    }
  }

  /** AI-powered: Generate personalized assessment based on user skills */
  async generatePersonalized(req: Request, res: Response, next: NextFunction) {
    try {
      const { subject } = req.body
      const questions = await aiAssessmentService.generatePersonalizedAssessment(
        req.user!.userId,
        subject
      )
      sendSuccess(res, { questions }, 'Personalized assessment generated')
    } catch (error) {
      next(error)
    }
  }

  /** AI-powered: Analyze assessment results and provide recommendations */
  async analyzeResults(req: Request, res: Response, next: NextFunction) {
    try {
      const assessmentId = parseInt(req.params.id)
      const analysis = await aiAssessmentService.analyzeResults(req.user!.userId, assessmentId)
      sendSuccess(res, analysis, 'Assessment analyzed successfully')
    } catch (error) {
      next(error)
    }
  }
}

export default new AssessmentController()
