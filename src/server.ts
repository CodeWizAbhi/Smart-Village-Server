import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';
import { logger } from './utils/logger';

// Connect to database
connectDB();

const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});

process.on('unhandledRejection', (err: any) => {
  logger.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
