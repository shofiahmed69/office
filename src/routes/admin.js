const express = require('express');
const admin = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Optional: skip auth in development for testing (set SKIP_ADMIN_AUTH=1 in .env)
function maybeRequireAdmin(req, res, next) {
  if (process.env.SKIP_ADMIN_AUTH === '1') {
    req.user = { id: 0, role: 'admin' };
    return next();
  }
  requireAuth(req, res, () => {
    requireAdmin(req, res, next);
  });
}

router.use(maybeRequireAdmin);

router.get('/users', admin.getUsers);
router.patch('/users/:id/lock', admin.lockUser);
router.get('/jobs', admin.getJobs);
router.post('/jobs/:jobId/retry', admin.retryJob);
router.get('/audit-logs', admin.getAuditLogs);
router.post('/prompts', admin.createPrompt);
router.patch('/prompts/:id/publish', admin.publishPrompt);

module.exports = router;
