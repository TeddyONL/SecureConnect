import './lib/env';
import { app, httpServer } from './lib/server';
import logger from './lib/logger';
import { prisma } from './config/database';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connection established');

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
