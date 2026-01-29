const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must be less than 128 characters',
      'any.required': 'Password is required'
    })
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Task creation
  createTask: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title must be less than 255 characters',
      'any.required': 'Task title is required'
    }),
    description: Joi.string().allow('').optional(),
    due_date: Joi.date().iso().optional().messages({
      'date.format': 'Due date must be a valid ISO date'
    })
  }),

  // Task update
  updateTask: Joi.object({
    title: Joi.string().min(1).max(255).optional().messages({
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title must be less than 255 characters'
    }),
    description: Joi.string().allow('').optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').optional().messages({
      'any.only': 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED'
    }),
    due_date: Joi.date().iso().allow(null).optional().messages({
      'date.format': 'Due date must be a valid ISO date'
    })
  }),

  // Query parameters
  taskQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED').optional(),
    search: Joi.string().max(255).optional()
  })
};

// Validation middleware factory
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      logger.error(`Validation schema '${schemaName}' not found`);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }

    // Determine what to validate based on request method and schema
    let dataToValidate;
    if (schemaName === 'taskQuery') {
      dataToValidate = req.query;
    } else {
      dataToValidate = req.body;
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      logger.warn('Validation error:', errorMessages);
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace the original data with validated data
    if (schemaName === 'taskQuery') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
}

module.exports = {
  validate,
  schemas
};