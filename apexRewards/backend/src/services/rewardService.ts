// ApexRewards — reward service
import { rewardRepository } from '../repositories/rewardRepository';
import { campaignRepository } from '../repositories/campaignRepository';
import { userRepository } from '../repositories/userRepository';
import { stellarService } from './stellarService';
import { AppError } from '../middleware/errorHandler';
import { Reward } from '../types';
import { logger } from '../config/logger';

export const rewardService = {
  /** Issue APEX to a user for completing a campaign action */
  async issueReward(
    userId: string,
    campaignId: string,
    points: number
  ): Promise<Reward> {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) throw new AppError(404, 'Campaign not found');
    if (campaign.status !== 'active') throw new AppError(400, 'Campaign is not active');

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');

    const apexAmount = (BigInt(points) * BigInt(campaign.reward_per_point)).toString();

    // Check budget
    const remaining = BigInt(campaign.budget_apex) - BigInt(campaign.issued_apex);
    if (BigInt(apexAmount) > remaining) throw new AppError(400, 'Campaign budget exhausted');

    // Create pending reward record
    const reward = await rewardRepository.create({
      user_id: userId,
      campaign_id: campaignId,
      points,
      apex_amount: apexAmount,
    });

    // Issue on-chain if user has a Stellar key
    if (user.stellar_public_key && campaign.contract_campaign_id !== null) {
      try {
        const txHash = await stellarService.issueRewardOnChain(
          campaign.contract_campaign_id,
          user.stellar_public_key,
          BigInt(points)
        );
        await rewardRepository.updateStatus(reward.id, 'issued', txHash);
        await campaignRepository.incrementIssued(campaignId, apexAmount);
        return (await rewardRepository.findById(reward.id))!;
      } catch (err) {
        logger.error('ApexRewards on-chain reward issuance failed', { err, rewardId: reward.id });
        await rewardRepository.updateStatus(reward.id, 'failed');
        throw new AppError(502, 'On-chain reward issuance failed');
      }
    }

    // Off-chain only (no Stellar key yet) — mark as issued without tx
    await rewardRepository.updateStatus(reward.id, 'issued');
    await campaignRepository.incrementIssued(campaignId, apexAmount);
    return (await rewardRepository.findById(reward.id))!;
  },

  async getUserRewards(userId: string): Promise<Reward[]> {
    return rewardRepository.findByUser(userId);
  },

  async getUserApexBalance(userId: string): Promise<{ offChain: string; onChain: string }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');

    const offChain = await rewardRepository.totalApexByUser(userId);
    let onChain = '0';
    if (user.stellar_public_key) {
      const bal = await stellarService.getBalance(user.stellar_public_key);
      onChain = bal.toString();
    }
    return { offChain, onChain };
  },

  /** Redeem (burn) APEX tokens on-chain */
  async redeemApex(userId: string, amount: string): Promise<string> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    if (!user.stellar_public_key) throw new AppError(400, 'No Stellar key linked to account');

    const txHash = await stellarService.burnApex(user.stellar_public_key, BigInt(amount));
    logger.info('ApexRewards APEX redeemed', { userId, amount, txHash });
    return txHash;
  },
};
