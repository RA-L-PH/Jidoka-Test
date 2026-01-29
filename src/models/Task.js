const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tasks',
  timestamps: false,
  hooks: {
    beforeUpdate: (task) => {
      task.updated_at = new Date();
    }
  },
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'status']
    },
    {
      fields: ['user_id', 'created_at']
    }
  ]
});

module.exports = Task;