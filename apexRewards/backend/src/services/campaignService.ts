// ApexRewards — campaign service
import { campaignRepository } from '../repositories/campaignRepository';
import { AppError } from '../middleware/errorHandler';
import { Campaign } from '../types';

export const campaignService = {
  async create(
    merchantId: string,
    data: { name: string; description?: string; budgetApex: string; rewardPerPoint: string }
  ): Promise<Campaign> {
    if (BigInt(data.budgetApex) <= 0n) throw new AppError(400, 'Budget must be positive');
    if (BigInt(data.rewardPerPoint) <= 0n) throw new AppError(400, 'Reward per point must be positive');

    return campaignRepository.create({
      merchant_id: merchantId,
      name: data.name,
      description: data.description ?? null,
      budget_apex: data.budgetApex,
      reward_per_point: data.rewardPerPoint,
    });
  },

  async getById(id: string): Promise<Campaign> {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) throw new AppError(404, 'Campaign not found');
    return campaign;
  },

  async listActive(): Promise<Campaign[]> {
    return campaignRepository.findActive();
  },

  async listByMerchant(merchantId: string): Promise<Campaign[]> {
    return campaignRepository.findByMerchant(merchantId);
  },

  async updateStatus(
    id: string,
    merchantId: string,
    status: Campaign['status']
  ): Promise<Campaign> {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) throw new AppError(404, 'Campaign not found');
    if (campaign.merchant_id !== merchantId) throw new AppError(403, 'Forbidden');
    if (campaign.status === 'closed') throw new AppError(400, 'Campaign is permanently closed');

    const updated = await campaignRepository.updateStatus(id, status);
    if (!updated) throw new AppError(404, 'Campaign not found');
    return updated;
  },
};
