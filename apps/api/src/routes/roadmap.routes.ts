import { Router } from 'express';
import { body, param } from 'express-validator';
import roadmapController from '../controllers/roadmap.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/roadmaps/generate:
 *   post:
 *     summary: Generate AI-powered learning roadmap
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - learningGoal
 *               - subject
 *               - hoursPerWeek
 *             properties:
 *               assessmentId:
 *                 type: integer
 *               learningGoal:
 *                 type: string
 *               subject:
 *                 type: string
 *               hoursPerWeek:
 *                 type: integer
 *               preferredLearningStyle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Roadmap generated
 */
router.post(
  '/generate',
  [
    body('learningGoal').notEmpty().withMessage('Learning goal required'),
    body('subject').notEmpty().withMessage('Subject required'),
    body('hoursPerWeek').isInt({ min: 1, max: 40 }).withMessage('Hours per week must be 1-40'),
    validateRequest,
  ],
  roadmapController.generate
);

/**
 * @swagger
 * /api/roadmaps:
 *   get:
 *     summary: Get user roadmaps
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', roadmapController.list);

/**
 * @swagger
 * /api/roadmaps/{id}:
 *   get:
 *     summary: Get roadmap details
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', [param('id').isInt(), validateRequest], roadmapController.get);

/**
 * @swagger
 * /api/roadmaps/{id}/modules/{moduleId}:
 *   patch:
 *     summary: Update module progress
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/modules/:moduleId',
  [
    param('id').isInt(),
    param('moduleId').isInt(),
    body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Invalid status'),
    validateRequest,
  ],
  roadmapController.updateModule
);

/**
 * @swagger
 * /api/roadmaps/{id}/status:
 *   patch:
 *     summary: Update roadmap status
 *     tags: [Roadmaps]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  [
    param('id').isInt(),
    body('status').isIn(['active', 'paused', 'completed', 'archived']).withMessage('Invalid status'),
    validateRequest,
  ],
  roadmapController.updateStatus
);

export default router;
