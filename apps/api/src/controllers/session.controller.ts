import { Request, Response, NextFunction } from 'express';
import sessionService from '../services/session.service';
import { sendSuccess } from '../utils/response.utils';

export class SessionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sessionService.createSession(req.user!.userId, req.body);
      sendSuccess(res, result, 'Session created', 201);
    } catch (error) {
      next(error);
    }
  }

  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id);
      const result = await sessionService.joinSession(req.user!.userId, sessionId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async end(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id);
      const result = await sessionService.endSession(req.user!.userId, sessionId);
      sendSuccess(res, result, 'Session ended');
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await sessionService.getSession(req.user!.userId, sessionId);
      sendSuccess(res, { session });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const sessions = await sessionService.getUserSessions(req.user!.userId, status as string);
      sendSuccess(res, { sessions });
    } catch (error) {
      next(error);
    }
  }

  async getTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id);
      const transcript = await sessionService.getTranscript(req.user!.userId, sessionId);
      sendSuccess(res, { sessionId, transcript });
    } catch (error) {
      next(error);
    }
  }
}

export default new SessionController();
