const taskService = require('../services/taskService');
const logger = require('../utils/logger');

class TaskController {

  async createTask(req, res, next) {
    try {
      const userId = req.user.id;
      const task = await taskService.createTask(userId, req.body);

      res.status(201).json({
        success: true,
        data: { task },
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await taskService.getTasks(userId, req.query);

      res.json({
        success: true,
        data: {
          tasks: result.tasks,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTask(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const task = await taskService.getTaskById(userId, id);

      res.json({
        success: true,
        data: { task }
      });
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const task = await taskService.updateTask(userId, id, req.body);

      res.json({
        success: true,
        data: { task },
        message: 'Task updated successfully'
      });
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await taskService.deleteTask(userId, id);

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      next(error);
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await taskService.getTaskStats(userId);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();