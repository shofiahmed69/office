import { Router } from 'express';
import { body, param } from 'express-validator';
import aiAssistantController from '../controllers/aiAssistant.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/ai-assistant/ask:
 *   post:
 *     summary: Ask AI question during session
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - question
 *             properties:
 *               sessionId:
 *                 type: integer
 *               question:
 *                 type: string
 *               context:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: AI response
 */
router.post(
  '/ask',
  [
    body('sessionId').isInt().withMessage('Session ID required'),
    body('question').trim().notEmpty().withMessage('Question required'),
    validateRequest,
  ],
  aiAssistantController.ask
);

/**
 * @swagger
 * /api/ai-assistant/transcribe:
 *   post:
 *     summary: Transcribe audio chunk
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - audio
 *             properties:
 *               sessionId:
 *                 type: integer
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Transcription result
 */
router.post(
  '/transcribe',
  [body('sessionId').isInt().withMessage('Session ID required'), validateRequest],
  aiAssistantController.transcribe
);

/**
 * @swagger
 * /api/ai-assistant/sessions/{sessionId}/history:
 *   get:
 *     summary: Get AI assistance history for session
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/sessions/:sessionId/history',
  [param('sessionId').isInt(), validateRequest],
  aiAssistantController.getAssistanceHistory
);

/**
 * @swagger
 * /api/ai-assistant/rate/{assistanceId}:
 *   post:
 *     summary: Rate AI response
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/rate/:assistanceId',
  [
    param('assistanceId').isInt(),
    body('wasHelpful').isBoolean().withMessage('wasHelpful required'),
    validateRequest,
  ],
  aiAssistantController.rateResponse
);

export default router;
