import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/me
router.get('/me', userController.getCurrentUser);

// GET /api/users/profile
router.get('/profile', userController.getProfile);

// PATCH /api/users/profile
router.patch('/profile', userController.updateProfile);

// GET /api/users (admin only - TODO: add admin middleware)
router.get('/', userController.listUsers);

export default router;
