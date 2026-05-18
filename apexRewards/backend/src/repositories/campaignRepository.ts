// ApexRewards — campaign repository
import { db } from '../config/database';
import { Campaign } from '../types';

export const campaignRepository = {
  async findById(id: string): Promise<Campaign | null> {
    const { rows } = await db.query<Campaign>('SELECT * FROM campaigns WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async findByMerchant(merchantId: string): Promise<Campaign[]> {
    const { rows } = await db.query<Campaign>(
      'SELECT * FROM campaigns WHERE merchant_id = $1 ORDER BY created_at DESC',
      [merchantId]
    );
    return rows;
  },

  async findActive(): Promise<Campaign[]> {
    const { rows } = await db.query<Campaign>(
      "SELECT * FROM campaigns WHERE status = 'active' ORDER BY created_at DESC"
    );
    return rows;
  },

  async create(
    data: Pick<Campaign, 'merchant_id' | 'name' | 'description' | 'budget_apex' | 'reward_per_point'>
  ): Promise<Campaign> {
    const { rows } = await db.query<Campaign>(
      `INSERT INTO campaigns (merchant_id, name, description, budget_apex, reward_per_point)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.merchant_id, data.name, data.description, data.budget_apex, data.reward_per_point]
    );
    return rows[0];
  },

  async updateContractId(id: string, contractCampaignId: number): Promise<void> {
    await db.query(
      'UPDATE campaigns SET contract_campaign_id = $1, updated_at = NOW() WHERE id = $2',
      [contractCampaignId, id]
    );
  },

  async updateStatus(id: string, status: Campaign['status']): Promise<Campaign | null> {
    const { rows } = await db.query<Campaign>(
      'UPDATE campaigns SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0] ?? null;
  },

  async incrementIssued(id: string, amount: string): Promise<void> {
    await db.query(
      'UPDATE campaigns SET issued_apex = issued_apex + $1, updated_at = NOW() WHERE id = $2',
      [amount, id]
    );
  },
};
