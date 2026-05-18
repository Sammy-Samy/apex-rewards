// ApexRewards — health check route
import { Router } from 'express';
import { checkDbConnection } from '../config/database';
import { redis } from '../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await checkDbConnection();
    await redis.ping();
    res.json({ status: 'ok', service: 'ApexRewards API' });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'ApexRewards API', detail: String(err) });
  }
});
