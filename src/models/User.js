const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
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
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeUpdate: (user) => {
      user.updated_at = new Date();
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Class methods
User.hashPassword = async function(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Don't include password_hash in JSON responses
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;