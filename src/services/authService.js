const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwt: jwtConfig } = require('../config/env');
const logger = require('../utils/logger');

class AuthService {
  
  async register(email, password) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      // Hash password
      const password_hash = await User.hashPassword(password);

      // Create user
      const user = await User.create({
        email,
        password_hash
      });

      logger.info(`New user registered: ${email}`);
      
      return {
        user,
        token: this.generateToken(user.id)
      };
    } catch (error) {
      logger.error('Registration error:', error);
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        throw error;
      }
      throw new Error('REGISTRATION_FAILED');
    }
  }

  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ 
        where: { email },
        attributes: ['id', 'email', 'password_hash', 'created_at', 'updated_at']
      });

      if (!user) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('INVALID_CREDENTIALS');
      }

      logger.info(`User logged in: ${email}`);

      // Return user without password_hash and token
      const userResponse = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      return {
        user: userResponse,
        token: this.generateToken(user.id)
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error.message === 'INVALID_CREDENTIALS') {
        throw error;
      }
      throw new Error('LOGIN_FAILED');
    }
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw new Error('INVALID_TOKEN');
    }
  }
}

module.exports = new AuthService();