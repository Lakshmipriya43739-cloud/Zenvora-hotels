// JWT authentication middleware for Zenvora.
//
//  requireAuth  — verifies the Bearer token and attaches req.user
//  requireAdmin — must come AFTER requireAuth; rejects non-admin callers

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

/**
 * Verifies the Authorization: Bearer <token> header.
 * On success, attaches req.user = { id, name, email, role }.
 * On failure, returns 401.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * Allows only admin users through.
 * Must be placed AFTER requireAuth in the middleware chain.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

