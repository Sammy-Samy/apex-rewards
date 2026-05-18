// ApexRewards — reward repository
import { db } from '../config/database';
import { Reward } from '../types';

export const rewardRepository = {
  async findById(id: string): Promise<Reward | null> {
    const { rows } = await db.query<Reward>('SELECT * FROM rewards WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async findByUser(userId: string): Promise<Reward[]> {
    const { rows } = await db.query<Reward>(
      'SELECT * FROM rewards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async create(
    data: Pick<Reward, 'user_id' | 'campaign_id' | 'points' | 'apex_amount'>
  ): Promise<Reward> {
    const { rows } = await db.query<Reward>(
      `INSERT INTO rewards (user_id, campaign_id, points, apex_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.campaign_id, data.points, data.apex_amount]
    );
    return rows[0];
  },

  async updateStatus(
    id: string,
    status: Reward['status'],
    txHash?: string
  ): Promise<Reward | null> {
    const { rows } = await db.query<Reward>(
      `UPDATE rewards SET status = $1, tx_hash = COALESCE($2, tx_hash), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, txHash ?? null, id]
    );
    return rows[0] ?? null;
  },

  async totalApexByUser(userId: string): Promise<string> {
    const { rows } = await db.query<{ total: string }>(
      "SELECT COALESCE(SUM(apex_amount::numeric), 0)::text AS total FROM rewards WHERE user_id = $1 AND status = 'issued'",
      [userId]
    );
    return rows[0]?.total ?? '0';
  },
};
