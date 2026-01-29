const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  logger.error('Error caught by error middleware:', err);

  // Default error response
  let error = {
    success: false,
    error: 'Internal server error'
  };

  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    error.error = 'Validation error';
    error.details = err.errors.map(e => e.message);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    error.error = 'Resource already exists';
    if (err.fields && err.fields.email) {
      error.details = ['Email address is already registered'];
    }
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    error.error = 'Invalid reference to related resource';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 400;
    error.error = 'Database operation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    error.error = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    error.error = 'Token expired';
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(statusCode).json(error);
}

// 404 handler
function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
}

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};