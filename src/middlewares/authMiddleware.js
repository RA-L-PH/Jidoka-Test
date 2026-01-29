const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const { User } = require('../models');
const logger = require('../utils/logger');

async function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format. Use "Bearer <token>"'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. User not found.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Token expired.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

module.exports = authMiddleware;