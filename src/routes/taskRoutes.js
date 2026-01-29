const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD routes
router.get('/', validate('taskQuery'), taskController.getTasks);
router.post('/', validate('createTask'), taskController.createTask);
router.get('/stats', taskController.getTaskStats);
router.get('/:id', taskController.getTask);
router.put('/:id', validate('updateTask'), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;