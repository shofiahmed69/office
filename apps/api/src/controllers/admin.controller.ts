import { Request, Response, NextFunction } from 'express';
import adminService from '../services/admin.service';
import { sendSuccess, sendPaginated } from '../utils/response.utils';

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status, search, page, limit } = req.query;
      const result = await adminService.listUsers(
        { role: role ? parseInt(role as string) : undefined, status: status as any, search: search as string },
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20
      );
      sendPaginated(res, result.users, parseInt(page as string) || 1, parseInt(limit as string) || 20, result.total);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = parseInt(req.params.id);
      const user = await adminService.updateUser(req.user!.userId, targetUserId, req.body);
      sendSuccess(res, { user }, 'User updated');
    } catch (error) {
      next(error);
    }
  }

  async getAnalyticsOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await adminService.getAnalyticsOverview();
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  async sendNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.sendNotification(req.user!.userId, req.body);
      sendSuccess(res, result, 'Notification sent', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAuditLog(
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 50
      );
      sendPaginated(res, result.logs, parseInt(page as string) || 1, parseInt(limit as string) || 50, result.total);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
