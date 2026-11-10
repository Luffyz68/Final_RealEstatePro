const { sendError } = require('../utils/response');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Access forbidden. Required role: [${allowedRoles.join(', ')}]. Yours: ${req.user.role}`, 403);
    }

    next();
  };
};

module.exports = { authorizeRoles };
