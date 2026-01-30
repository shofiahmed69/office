import { Router } from 'express';
import { body, param, query } from 'express-validator';
import contentController from '../controllers/content.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/content/search:
 *   get:
 *     summary: Search educational content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *           enum: [short, medium, long]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  '/search',
  [query('q').notEmpty().withMessage('Search query required'), validateRequest],
  contentController.search
);

/**
 * @swagger
 * /api/content/recommendations:
 *   get:
 *     summary: Get personalized content recommendations
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 */
router.get('/recommendations', contentController.getRecommendations);

/**
 * @swagger
 * /api/content/progress:
 *   get:
 *     summary: Get user content progress
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 */
router.get('/progress', contentController.getUserProgress);

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content details
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', [param('id').isInt(), validateRequest], contentController.get);

/**
 * @swagger
 * /api/content/{id}/progress:
 *   post:
 *     summary: Update watch progress
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/progress',
  [
    param('id').isInt(),
    body('lastPosition').isInt({ min: 0 }).withMessage('Last position required'),
    body('watchTimeSeconds').isInt({ min: 0 }).withMessage('Watch time required'),
    validateRequest,
  ],
  contentController.updateProgress
);

export default router;
