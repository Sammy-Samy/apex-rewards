// ApexRewards — PostgreSQL pool
import { Pool } from 'pg';
import { logger } from './logger';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

db.on('error', (err) => logger.error('ApexRewards DB pool error', { err }));

export async function checkDbConnection(): Promise<void> {
  const client = await db.connect();
  client.release();
}
