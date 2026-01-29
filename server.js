const app = require('./src/app');
const { connectDatabase } = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();