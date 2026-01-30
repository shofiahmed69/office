import { Request, Response, NextFunction } from 'express';
import aiAssistantService from '../services/aiAssistant.service';
import { sendSuccess } from '../utils/response.utils';

export class AIAssistantController {
  async ask(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, question, context } = req.body;
      const result = await aiAssistantService.askQuestion(req.user!.userId, sessionId, question, context);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async transcribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;
      // In production, audio would come from req.file (multipart upload)
      const audioData = Buffer.from('simulated-audio');
      const result = await aiAssistantService.transcribeAudio(sessionId, req.user!.userId, audioData);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAssistanceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const history = await aiAssistantService.getSessionAssistanceHistory(sessionId);
      sendSuccess(res, { history });
    } catch (error) {
      next(error);
    }
  }

  async rateResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const assistanceId = parseInt(req.params.assistanceId);
      const { wasHelpful } = req.body;
      await aiAssistantService.rateResponse(assistanceId, wasHelpful);
      sendSuccess(res, null, 'Rating recorded');
    } catch (error) {
      next(error);
    }
  }
}

export default new AIAssistantController();
