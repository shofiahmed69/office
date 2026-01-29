const jwt = require('jsonwebtoken');

/**
 * Extract JWT from request:
 * - Authorization: Bearer <token>  (recommended)
 * - Authorization: <token>        (token only)
 */
function getToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

const auth = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      hint: 'Send access token in header: Authorization: Bearer <accessToken>',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token expired. Use refresh token to get a new one.' : 'Invalid or expired token.',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }
};

module.exports = auth;
