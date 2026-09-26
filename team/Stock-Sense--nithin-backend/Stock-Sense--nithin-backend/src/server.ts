import app from './app';
import { redis } from './shared/redis';
import { logger } from './shared/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);

const startServer = async () => {
  try {
    // Connect to Redis
    await redis.connect().catch((err) => {
      logger.warn('⚠️ Redis not reachable right now, continuing without cache:', err.message);
    });

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 WMS API Data Layer running on port ${PORT}`);
      logger.info(`📡 Health Check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
