const { sequelize } = require('./db');
const logger = require('../utils/logger');

// Import models to ensure they are registered
require('../models');

async function runMigration() {
  try {
    logger.info('🔄 Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    logger.info('✅ Database models synchronized');
    
    logger.info('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };