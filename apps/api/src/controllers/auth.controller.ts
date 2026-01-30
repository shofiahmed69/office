import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import logger from '../config/logger';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      const user = await authService.register(username, email, password, firstName, lastName);
      
      logger.info('User registered', { userId: user.id, email });
      sendSuccess(res, { user }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const { user, tokens } = await authService.login(email, password);
      
      logger.info('User logged in', { userId: user.id, email });
      sendSuccess(res, { user, tokens }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      const tokens = await authService.refreshToken(refreshToken);
      
      sendSuccess(res, { tokens }, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement token blacklisting with Redis
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }
}
