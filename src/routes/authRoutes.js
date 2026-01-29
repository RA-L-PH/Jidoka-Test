const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;