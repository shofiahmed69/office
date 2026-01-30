import { Router } from 'express';
import { body, param } from 'express-validator';
import analyticsController from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/analytics/attention-tracking/{sessionId}:
 *   get:
 *     summary: Get attention tracking data for session
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Attention tracking data
 */
router.get(
  '/attention-tracking/:sessionId',
  [param('sessionId').isInt(), validateRequest],
  analyticsController.getAttentionTracking
);

/**
 * @swagger
 * /api/analytics/progress:
 *   get:
 *     summary: Get user learning progress
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learning progress data
 */
router.get('/progress', analyticsController.getLearningProgress);

/**
 * @swagger
 * /api/analytics/attention-tracking/{sessionId}:
 *   post:
 *     summary: Record attention tracking data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - focusPercentage
 *               - totalSamples
 *               - focusedSamples
 *             properties:
 *               focusPercentage:
 *                 type: number
 *               totalSamples:
 *                 type: integer
 *               focusedSamples:
 *                 type: integer
 *               distractionEvents:
 *                 type: integer
 */
router.post(
  '/attention-tracking/:sessionId',
  [
    param('sessionId').isInt(),
    body('focusPercentage').isFloat({ min: 0, max: 100 }),
    body('totalSamples').isInt({ min: 0 }),
    body('focusedSamples').isInt({ min: 0 }),
    validateRequest,
  ],
  analyticsController.recordAttention
);

export default router;
