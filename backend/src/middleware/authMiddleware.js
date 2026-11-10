const jwt = require('jsonwebtoken');
const { get } = require('../config/database');
const { sendError } = require('../utils/response');
const { getConfig } = require('../config/env');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = jwt.verify(token, getConfig().jwtSecret);

    // Fetch user from DB to ensure user is active and exists
    const user = await get('SELECT id, full_name, email, phone, role, profile_image, status FROM users WHERE id = ?', [decoded.id || decoded.userId]);

    if (!user) {
      return sendError(res, 'User session invalid. Account not found.', 401);
    }

    if (user.status !== 'active') {
      return sendError(res, 'Your account is deactivated. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authentication token.', 401);
  }
};

module.exports = { authenticateToken };
