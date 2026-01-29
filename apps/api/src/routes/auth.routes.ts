import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    validateRequest,
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validateRequest,
  ],
  authController.login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token required'), validateRequest],
  authController.refreshToken
);

// POST /api/auth/logout
router.post('/logout', authController.logout);

export default router;
