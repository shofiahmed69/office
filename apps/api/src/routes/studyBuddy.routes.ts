import { Router } from 'express';
import { body, param, query } from 'express-validator';
import studyBuddyController from '../controllers/studyBuddy.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * /api/study-buddies/find-match:
 *   get:
 *     summary: Find compatible study buddies
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roadmapId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of potential matches
 */
router.get(
  '/find-match',
  [query('roadmapId').isInt().withMessage('Roadmap ID required'), validateRequest],
  studyBuddyController.findMatch
);

/**
 * @swagger
 * /api/study-buddies/request:
 *   post:
 *     summary: Send study buddy request
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/request',
  [body('requestedUserId').isInt().withMessage('Requested user ID required'), validateRequest],
  studyBuddyController.sendRequest
);

/**
 * @swagger
 * /api/study-buddies/my-buddies:
 *   get:
 *     summary: Get list of connected study buddies
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-buddies', studyBuddyController.getMyBuddies);

/**
 * @swagger
 * /api/study-buddies/pending:
 *   get:
 *     summary: Get pending buddy requests
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pending', studyBuddyController.getPendingRequests);

/**
 * @swagger
 * /api/study-buddies/{matchId}/accept:
 *   post:
 *     summary: Accept buddy request
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:matchId/accept',
  [param('matchId').isInt(), validateRequest],
  studyBuddyController.acceptRequest
);

/**
 * @swagger
 * /api/study-buddies/{matchId}/reject:
 *   post:
 *     summary: Reject buddy request
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:matchId/reject',
  [param('matchId').isInt(), validateRequest],
  studyBuddyController.rejectRequest
);

// Assignment routes
/**
 * @swagger
 * /api/study-buddies/assignments:
 *   get:
 *     summary: List active buddy-course assignments
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.get('/assignments', studyBuddyController.getAssignments);

/**
 * @swagger
 * /api/study-buddies/assignments/{assignmentId}:
 *   patch:
 *     summary: Update assignment
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/assignments/:assignmentId',
  [param('assignmentId').isInt(), validateRequest],
  studyBuddyController.updateAssignment
);

/**
 * @swagger
 * /api/study-buddies/assignments/{assignmentId}:
 *   delete:
 *     summary: End an assignment
 *     tags: [Study Buddies]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/assignments/:assignmentId',
  [param('assignmentId').isInt(), validateRequest],
  studyBuddyController.endAssignment
);

export default router;
