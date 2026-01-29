const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

/**
 * Resolve current user for /api/users/me.
 * 1. If Authorization: Bearer <jwt>, decode and set req.user.id from token payload (sub or userId).
 * 2. Else if X-User-Id header (dev), use that as profile id.
 * 3. Else 401.
 */
async function getCurrentUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-user-id'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.sub ?? decoded.userId ?? decoded.id;
      if (!userId) return res.status(401).json({ success: false, error: 'Invalid token payload' });
      // Resolve profile id: if token stores profile_id use it; else look up by user_id/email
      const { rows } = await pool.query(
        'SELECT id FROM profiles WHERE id = $1 OR user_id = $2 LIMIT 1',
        [userId, String(userId)]
      );
      if (rows.length === 0) return res.status(401).json({ success: false, error: 'Profile not found' });
      req.user = { id: rows[0].id };
      return next();
    } catch (e) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  }

  if (devUserId) {
    const id = parseInt(devUserId, 10);
    if (isNaN(id)) return res.status(401).json({ success: false, error: 'X-User-Id must be numeric' });
    const { rows } = await pool.query('SELECT id FROM profiles WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    req.user = { id: rows[0].id };
    return next();
  }

  return res.status(401).json({ success: false, error: 'Authorization required (Bearer token or X-User-Id)' });
}

module.exports = { getCurrentUser };
