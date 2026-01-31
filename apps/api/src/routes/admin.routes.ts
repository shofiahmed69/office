import { Router } from 'express'
import { body, param } from 'express-validator'
import adminController from '../controllers/admin.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/requireAdmin.middleware'
import { validateRequest } from '../middleware/validation.middleware'

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticateToken)
router.use(requireAdmin)

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List users with filters (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived, locked]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: Paginated user list
 */
router.get('/users', adminController.listUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activeOrArchive:
 *                 type: boolean
 *               accountLock:
 *                 type: boolean
 *               primaryRoleId:
 *                 type: integer
 */
router.patch('/users/:id', [param('id').isInt(), validateRequest], adminController.updateUser);

/**
 * @swagger
 * /api/admin/analytics/overview:
 *   get:
 *     summary: Platform-wide metrics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform analytics
 */
router.get('/analytics/overview', adminController.getAnalyticsOverview);

/**
 * @swagger
 * /api/admin/notifications:
 *   post:
 *     summary: Send system notification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - notificationType
 *             properties:
 *               targetUserIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               isGlobal:
 *                 type: boolean
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               notificationType:
 *                 type: string
 */
router.post(
  '/notifications',
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('message').trim().notEmpty().withMessage('Message required'),
    body('notificationType').trim().notEmpty().withMessage('Notification type required'),
    validateRequest,
  ],
  adminController.sendNotification
);

/**
 * @swagger
 * /api/admin/audit:
 *   get:
 *     summary: Audit log of admin actions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/audit', adminController.getAuditLog);

export default router;
