import { Router } from 'express';
import { body, param } from 'express-validator';
import sessionController from '../controllers/session.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/sessions/create:
 *   post:
 *     summary: Create new study session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionName
 *             properties:
 *               sessionName:
 *                 type: string
 *               buddyUserId:
 *                 type: integer
 *               scheduledStartTime:
 *                 type: string
 *                 format: date-time
 *               durationMinutes:
 *                 type: integer
 *               studyTopics:
 *                 type: array
 *                 items:
 *                   type: string
 *               learningGoals:
 *                 type: array
 *                 items:
 *                   type: string
 *               videoCallType:
 *                 type: string
 *                 enum: [webrtc, daily]
 *               isAIListeningEnabled:
 *                 type: boolean
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Session created
 */
router.post(
  '/create',
  [body('sessionName').trim().notEmpty().withMessage('Session name required'), validateRequest],
  sessionController.create
);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get user sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, active, completed, cancelled]
 */
router.get('/', sessionController.list);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', [param('id').isInt(), validateRequest], sessionController.get);

/**
 * @swagger
 * /api/sessions/{id}/join:
 *   post:
 *     summary: Join existing session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/join', [param('id').isInt(), validateRequest], sessionController.join);

/**
 * @swagger
 * /api/sessions/{id}/end:
 *   post:
 *     summary: End study session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/end', [param('id').isInt(), validateRequest], sessionController.end);

/**
 * @swagger
 * /api/sessions/{id}/transcript:
 *   get:
 *     summary: Get session transcript
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/transcript', [param('id').isInt(), validateRequest], sessionController.getTranscript);

export default router;
