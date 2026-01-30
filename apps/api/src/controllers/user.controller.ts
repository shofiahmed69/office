import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';

export class UserController {
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.user!.userId);
      sendSuccess(res, { user });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getUserProfile(req.user!.userId);
      sendSuccess(res, { profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, { user }, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, total } = await userService.listUsers(page, limit);
      sendPaginated(res, users, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async addTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await userService.addUserTag(req.user!.userId, req.body);
      sendSuccess(res, { tag }, 'Tag added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await userService.getUserTags(req.user!.userId);
      sendSuccess(res, { tags });
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUserTag(req.user!.userId, parseInt(req.params.tagId));
      sendSuccess(res, null, 'Tag deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
