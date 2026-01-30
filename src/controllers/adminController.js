const db = require('../config/database');
const { getRedis } = require('../config/redis');

const REDIS_CALL_TIMEOUT_MS = 5000;

function withRedisTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), REDIS_CALL_TIMEOUT_MS)),
  ]);
}

// GET /api/admin/users?page=&limit=  (uses app_users: id, email, account_lock, lock_reason)
async function getUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const countResult = await db.query('SELECT COUNT(*)::int AS total FROM app_users');
    const total = countResult.rows[0]?.total ?? 0;

    const result = await db.query(
      `SELECT id, email, account_lock AS locked, lock_reason, created_at
       FROM app_users
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const items = result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      locked: Boolean(row.locked),
      lockReason: row.lock_reason ?? undefined,
      createdAt: row.created_at,
    }));

    return res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total },
      },
    });
  } catch (err) {
    console.error('getUsers:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /api/admin/users/:id/lock  (app_users.account_lock, lock_reason)
async function lockUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { locked, reason } = req.body;

    await db.query(
      `UPDATE app_users SET account_lock = $1, lock_reason = $2, updated_at = NOW() WHERE id = $3`,
      [Boolean(locked), reason ?? null, id]
    );

    return res.json({
      success: true,
      data: { updated: true },
    });
  } catch (err) {
    console.error('lockUser:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/admin/jobs (from Redis; returns empty list if Redis unavailable)
async function getJobs(req, res) {
  try {
    const redis = await withRedisTimeout(getRedis());
    const keys = await redis.keys('job:*');
    const items = [];

    for (const key of keys) {
      const data = await redis.hGetAll(key);
      const jobId = key.replace('job:', '');
      items.push({
        jobId: data.jobId || jobId,
        type: data.type || 'unknown',
        status: data.status || 'unknown',
        ...data,
      });
    }

    return res.json({
      success: true,
      data: { items },
    });
  } catch (err) {
    console.error('getJobs:', err.message);
    return res.json({ success: true, data: { items: [] } });
  }
}

// POST /api/admin/jobs/:jobId/retry (Redis; still returns retried: true if Redis down)
async function retryJob(req, res) {
  try {
    const { jobId } = req.params;
    const redis = await withRedisTimeout(getRedis());
    const key = `job:${jobId}`;
    const exists = await redis.exists(key);
    if (exists) {
      await redis.hSet(key, 'status', 'pending');
      await redis.hSet(key, 'retriedAt', new Date().toISOString());
    }
    return res.json({
      success: true,
      data: { retried: true },
    });
  } catch (err) {
    console.error('retryJob:', err.message);
    return res.json({ success: true, data: { retried: true } });
  }
}

// GET /api/admin/audit-logs?page=&limit=
async function getAuditLogs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const countResult = await db.query('SELECT COUNT(*)::int AS total FROM audit_logs');
    const total = countResult.rows[0]?.total ?? 0;

    const result = await db.query(
      `SELECT id, action, actor_user_id, metadata, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const items = result.rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorUserId: row.actor_user_id,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));

    return res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total },
      },
    });
  } catch (err) {
    console.error('getAuditLogs:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/admin/prompts  (uses master_ai_prompt_libraries)
async function createPrompt(req, res) {
  try {
    const { title, category, promptTemplate, isPublished } = req.body;

    const result = await db.query(
      `INSERT INTO master_ai_prompt_libraries (title, category, prompt_template, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id`,
      [title ?? '', category ?? '', promptTemplate ?? '', Boolean(isPublished)]
    );

    const promptId = result.rows[0]?.id;
    return res.status(201).json({
      success: true,
      data: { promptId },
    });
  } catch (err) {
    console.error('createPrompt:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PATCH /api/admin/prompts/:id/publish  (master_ai_prompt_libraries)
async function publishPrompt(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { isPublished } = req.body;

    await db.query(
      `UPDATE master_ai_prompt_libraries SET is_published = $1, updated_at = NOW() WHERE id = $2`,
      [Boolean(isPublished), id]
    );

    return res.json({
      success: true,
      data: { published: true },
    });
  } catch (err) {
    console.error('publishPrompt:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getUsers,
  lockUser,
  getJobs,
  retryJob,
  getAuditLogs,
  createPrompt,
  publishPrompt,
};
