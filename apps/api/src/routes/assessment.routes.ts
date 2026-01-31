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

router.post(
  '/:id/complete-with-results',
  [
    param('id').isInt(),
    body('answers').isArray().withMessage('answers array required'),
    body('answers.*.questionId').notEmpty(),
    body('answers.*.correctAnswer').isInt({ min: 0 }),
    body('answers.*.selectedOption').isInt({ min: 0 }),
    body('answers.*.topic').optional().isString(),
    body('timeSpentSeconds').isInt({ min: 0 }),
    validateRequest,
  ],
  assessmentController.completeWithResults
);

// GET /api/assessments/history
router.get('/history', assessmentController.getHistory)

/**
 * @swagger
 * /api/assessments/ai/generate-questions:
 *   post:
 *     summary: Generate assessment questions using AI
 *     tags: [Assessments, AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Python Programming"
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 default: intermediate
 *               numQuestions:
 *                 type: integer
 *                 default: 10
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Questions generated successfully
 */
router.post(
  '/ai/generate-questions',
  [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('numQuestions').optional().isInt({ min: 1, max: 50 }),
    validateRequest,
  ],
  assessmentController.generateQuestions
)

/**
 * @swagger
 * /api/assessments/ai/evaluate:
 *   post:
 *     summary: Evaluate answer with AI feedback
 *     tags: [Assessments, AI]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/ai/evaluate',
  [
    body('questionId').notEmpty().withMessage('Question ID required'),
    body('userAnswer').notEmpty().withMessage('User answer required'),
    body('correctAnswer').notEmpty().withMessage('Correct answer required'),
    validateRequest,
  ],
  assessmentController.evaluateAnswer
)

/**
 * @swagger
 * /api/assessments/ai/personalized:
 *   post:
 *     summary: Generate personalized assessment based on user skills
 *     tags: [Assessments, AI]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/ai/personalized',
  [body('subject').notEmpty().withMessage('Subject is required'), validateRequest],
  assessmentController.generatePersonalized
)

/**
 * @swagger
 * /api/assessments/{id}/analyze:
 *   post:
 *     summary: Analyze assessment results with AI
 *     tags: [Assessments, AI]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/analyze',
  [param('id').isInt(), validateRequest],
  assessmentController.analyzeResults
)

export default router
