/**
 * Standardized API Response Helper Functions
 */

const sendSuccess = (res, message = 'Operation successful', data = null, statusCode = 200, extra = {}) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...extra
  };
  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
