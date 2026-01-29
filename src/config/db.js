const { Sequelize } = require('sequelize');
const { db } = require('./env');
const logger = require('../utils/logger');

// Create Sequelize instance
const sequelize = new Sequelize(db.url, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000
  }
});

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('📊 Database models synchronized');
    }
    
    return sequelize;
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error);
    throw error;
  }
}

async function closeDatabase() {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database:', error);
  }
}

module.exports = {
  sequelize,
  connectDatabase,
  closeDatabase
};