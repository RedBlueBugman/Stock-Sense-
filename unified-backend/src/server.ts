import app from './app';
import { logger } from './shared/logger';
import { query } from './shared/db';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function start() {
  try {
    // Test DB connection
    const res = await query('SELECT 1 AS ok');
    logger.info(`Database connected: ${res.rows[0].ok === 1 ? 'OK' : 'FAIL'}`);

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`StockSense Unified API running on http://localhost:${PORT}`);
      logger.info(`Health: http://localhost:${PORT}/health`);
    });
  } catch (err: any) {
    logger.error(`Startup failed: ${err.message}`);
    logger.warn('Make sure Docker DB is running: cd unified-backend && docker compose up -d');
    process.exit(1);
  }
}

start();
