import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { createClient } from 'redis';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check (liveness probe)
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check (checks dependencies)
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: ok
 *                     redis:
 *                       type: string
 *                       example: ok
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
  };
  
  let isReady = true;

  // Check database connection
  try {
    await query('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    isReady = false;
  }

  // Check Redis connection
  try {
    if (process.env.REDIS_URL) {
      const redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      await redisClient.ping();
      await redisClient.quit();
      checks.redis = 'ok';
    } else {
      checks.redis = 'not_configured';
    }
  } catch (error) {
    checks.redis = 'error';
    isReady = false;
  }

  const statusCode = isReady ? 200 : 503;
  const status = isReady ? 'ready' : 'not_ready';

  res.status(statusCode).json({
    status,
    checks,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Application metrics
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: number
 *                     heapTotal:
 *                       type: number
 *                     heapUsed:
 *                       type: number
 *                     external:
 *                       type: number
 *                 cpu:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: number
 *                     system:
 *                       type: number
 *                 process:
 *                   type: object
 *                   properties:
 *                     pid:
 *                       type: number
 *                     version:
 *                       type: string
 *                     nodeVersion:
 *                       type: string
 */
router.get('/metrics', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.status(200).json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    cpu: {
      user: cpuUsage.user / 1000000, // seconds
      system: cpuUsage.system / 1000000, // seconds
    },
    process: {
      pid: process.pid,
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

export default router;
