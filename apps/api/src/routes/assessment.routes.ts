import { Router } from 'express';
import { body, param } from 'express-validator';
import assessmentController from '../controllers/assessment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/assessments/start:
 *   post:
 *     summary: Start a new skill assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectId
 *               - subjectName
 *             properties:
 *               subjectId:
 *                 type: integer
 *               subjectName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assessment started
 */
router.post(
  '/start',
  [
    body('subjectId').isInt().withMessage('Subject ID required'),
    body('subjectName').notEmpty().withMessage('Subject name required'),
    validateRequest,
  ],
  assessmentController.start
);

/**
 * @swagger
 * /api/assessments/{id}/answer:
 *   post:
 *     summary: Submit answer to assessment question
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/answer',
  [
    param('id').isInt(),
    body('questionId').isInt().withMessage('Question ID required'),
    body('answerId').notEmpty().withMessage('Answer ID required'),
    body('timeSpentSeconds').isInt({ min: 0 }).withMessage('Time spent required'),
    validateRequest,
  ],
  assessmentController.submitAnswer
);

/**
 * @swagger
 * /api/assessments/{id}/complete:
 *   post:
 *     summary: Complete assessment and get results
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/complete', [param('id').isInt(), validateRequest], assessmentController.complete);

// GET /api/assessments/history
router.get('/history', assessmentController.getHistory);

export default router;
