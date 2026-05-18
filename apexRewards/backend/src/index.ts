import 'dotenv/config';
import app from './app';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.listen(PORT, () => {
  logger.info(`ApexRewards API running on port ${PORT}`);
});
