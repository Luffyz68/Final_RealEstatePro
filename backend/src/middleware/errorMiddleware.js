const { sendError } = require('../utils/response');

// 404 Route Not Found Handler
const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route Not Found - ${req.originalUrl}`, 404);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') console.error('API Error:', err);
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = /UNIQUE/i.test(err.message) ? 409 : 400;
    message = /UNIQUE/i.test(err.message) ? 'A record with these details already exists.' : 'The submitted data violates a database constraint.';
  }
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller.' : err.message;
  }
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') message = 'Internal Server Error';
  const errors = err.errors || null;
  return sendError(res, message, statusCode, errors);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
