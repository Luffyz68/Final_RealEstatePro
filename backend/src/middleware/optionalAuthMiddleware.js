const jwt = require('jsonwebtoken');
const { get } = require('../config/database');
const { getConfig } = require('../config/env');
const { sendError } = require('../utils/response');

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  if (!header.startsWith('Bearer ')) return sendError(res, 'Invalid authorization header.', 401);
  try {
    const decoded = jwt.verify(header.slice(7), getConfig().jwtSecret);
    const user = await get('SELECT id, full_name, email, phone, role, profile_image, status FROM users WHERE id = ?', [decoded.id]);
    if (!user || user.status !== 'active') return sendError(res, 'User session is no longer valid.', 401);
    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired authentication token.', 401);
  }
};

module.exports = { optionalAuth };
