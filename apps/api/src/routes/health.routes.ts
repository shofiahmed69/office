import { Router, Request, Response } from 'express';
import pool from '../config/database';
import redisClient from '../config/redis';

const router = Router();

// GET /health - Liveness probe
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /ready - Readiness probe
router.get('/ready', async (req: Request, res: Response) => {
  const checks: any = {
    database: 'checking',
    redis: 'checking',
  };

  try {
    // Check database
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'failed';
  }

  try {
    // Check Redis
    await redisClient.ping();
    checks.redis = 'ok';
  } catch (error) {
    checks.redis = 'failed';
  }

  const allHealthy = Object.values(checks).every((status) => status === 'ok');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
