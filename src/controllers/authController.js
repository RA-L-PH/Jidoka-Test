const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {

  async register(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.register(email, password);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          error: 'Email address is already registered'
        });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token
        },
        message: 'Login successful'
      });
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();