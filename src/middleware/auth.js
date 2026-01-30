const jwt = require('jsonwebtoken');

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (_) {}
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid authorization' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.role || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

module.exports = { optionalAuth, requireAuth, requireAdmin };
