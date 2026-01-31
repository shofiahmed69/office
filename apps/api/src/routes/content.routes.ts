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
 * /api/content/topics:
 *   get:
 *     summary: Get topic suggestions for content library (from YouTube/Piped/Invidious)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: max
 *         schema:
 *           type: integer
 *           default: 24
 *     responses:
 *       200:
 *         description: List of topic strings for discover-by-topic
 */
router.get('/topics', contentController.getTopics);

/**
 * @swagger
 * /api/content/discover-by-topic:
 *   get:
 *     summary: Discover videos by topic (YouTube API, automatic)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         example: Flutter
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: List of videos for the topic
 */
router.get(
  '/discover-by-topic',
  [query('topic').notEmpty().trim().withMessage('Topic is required'), validateRequest],
  contentController.discoverByTopic
);

/**
 * @swagger
 * /api/content/course-topics:
 *   get:
 *     summary: Get course topics for the current user (from their roadmaps)
 *     description: Only these topics are allowed for video suggestions (discover-by-topic).
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of topic strings from user roadmaps
 */
router.get('/course-topics', contentController.getCourseTopics);

/**
 * @swagger
 * /api/content/generate-for-roadmap/{roadmapId}:
 *   post:
 *     summary: Generate personalized course videos for a roadmap from YouTube
 *     description: Fetches real videos (MIT OCW, Stanford, Khan, etc.) and links them to roadmap modules.
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roadmapId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxVideosPerModule
 *         schema:
 *           type: integer
 *           default: 3
 *       - in: query
 *         name: preferMit
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: preferStanford
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Videos generated and linked to roadmap modules
 */
router.post(
  '/generate-for-roadmap/:roadmapId',
  [param('roadmapId').isInt().withMessage('Valid roadmap ID required'), validateRequest],
  contentController.generateForRoadmap
);

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
