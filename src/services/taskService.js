const { Task, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class TaskService {

  async createTask(userId, taskData) {
    try {
      const task = await Task.create({
        user_id: userId,
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.due_date || null
      });

      logger.info(`Task created: ${task.id} for user: ${userId}`);
      return task;
    } catch (error) {
      logger.error('Task creation error:', error);
      throw new Error('TASK_CREATION_FAILED');
    }
  }

  async getTasks(userId, queryParams = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search
      } = queryParams;

      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause = { user_id: userId };

      // Add status filter
      if (status) {
        whereClause.status = status;
      }

      // Add search filter
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: tasks } = await Task.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        attributes: ['id', 'title', 'description', 'status', 'due_date', 'created_at', 'updated_at']
      });

      const totalPages = Math.ceil(count / limit);

      return {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Get tasks error:', error);
      throw new Error('TASKS_FETCH_FAILED');
    }
  }

  async getTaskById(userId, taskId) {
    try {
      const task = await Task.findOne({
        where: {
          id: taskId,
          user_id: userId
        }
      });

      if (!task) {
        throw new Error('TASK_NOT_FOUND');
      }

      return task;
    } catch (error) {
      logger.error('Get task by ID error:', error);
      if (error.message === 'TASK_NOT_FOUND') {
        throw error;
      }
      throw new Error('TASK_FETCH_FAILED');
    }
  }

  async updateTask(userId, taskId, updateData) {
    try {
      const task = await Task.findOne({
        where: {
          id: taskId,
          user_id: userId
        }
      });

      if (!task) {
        throw new Error('TASK_NOT_FOUND');
      }

      // Update task
      await task.update(updateData);

      logger.info(`Task updated: ${taskId} for user: ${userId}`);
      return task;
    } catch (error) {
      logger.error('Task update error:', error);
      if (error.message === 'TASK_NOT_FOUND') {
        throw error;
      }
      throw new Error('TASK_UPDATE_FAILED');
    }
  }

  async deleteTask(userId, taskId) {
    try {
      const task = await Task.findOne({
        where: {
          id: taskId,
          user_id: userId
        }
      });

      if (!task) {
        throw new Error('TASK_NOT_FOUND');
      }

      await task.destroy();

      logger.info(`Task deleted: ${taskId} for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Task deletion error:', error);
      if (error.message === 'TASK_NOT_FOUND') {
        throw error;
      }
      throw new Error('TASK_DELETION_FAILED');
    }
  }

  async getTaskStats(userId) {
    try {
      const [total, pending, inProgress, completed] = await Promise.all([
        Task.count({ where: { user_id: userId } }),
        Task.count({ where: { user_id: userId, status: 'PENDING' } }),
        Task.count({ where: { user_id: userId, status: 'IN_PROGRESS' } }),
        Task.count({ where: { user_id: userId, status: 'COMPLETED' } })
      ]);

      return {
        total,
        pending,
        inProgress,
        completed
      };
    } catch (error) {
      logger.error('Get task stats error:', error);
      throw new Error('TASK_STATS_FAILED');
    }
  }
}

module.exports = new TaskService();