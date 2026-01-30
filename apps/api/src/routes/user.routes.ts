import { Router } from 'express';
import { body, param } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

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

/**
 * @swagger
 * /api/users/me/tags:
 *   post:
 *     summary: Add user skill/interest tag
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagName
 *             properties:
 *               tagName:
 *                 type: string
 *               tagValue:
 *                 type: string
 *               masterTagId:
 *                 type: number
 *               ratingScore:
 *                 type: number
 *               sourceType:
 *                 type: string
 *                 enum: [manual, ai, imported]
 *     responses:
 *       201:
 *         description: Tag added successfully
 */
router.post(
  '/me/tags',
  [
    body('tagName').trim().notEmpty().withMessage('Tag name is required'),
    body('ratingScore').optional().isInt({ min: 1, max: 10 }).withMessage('Rating must be 1-10'),
    body('sourceType').optional().isIn(['manual', 'ai', 'imported']),
    validateRequest,
  ],
  userController.addTag
);

// GET /api/users/me/tags
router.get('/me/tags', userController.getTags);

// DELETE /api/users/me/tags/:tagId
router.delete(
  '/me/tags/:tagId',
  [param('tagId').isInt().withMessage('Invalid tag ID'), validateRequest],
  userController.deleteTag
);

// GET /api/users (admin only - TODO: add admin middleware)
router.get('/', userController.listUsers);

export default router;
