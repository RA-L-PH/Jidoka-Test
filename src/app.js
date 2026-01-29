const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import configuration
const { cors: corsConfig } = require('./config/env');
const logger = require('./utils/logger');

// Import models to establish associations
require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Import middlewares
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

// Trust proxy for accurate client IP addresses
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: corsConfig.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('common'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Task Manager API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      tasks: {
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        stats: 'GET /api/tasks/stats'
      }
    }
  });
});

// Handle undefined routes
app.use('*', notFoundMiddleware);

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;