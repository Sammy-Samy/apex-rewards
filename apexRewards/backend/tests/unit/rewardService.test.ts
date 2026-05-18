// ApexRewards — rewardService unit tests
import { rewardService } from '../../src/services/rewardService';
import { rewardRepository } from '../../src/repositories/rewardRepository';
import { campaignRepository } from '../../src/repositories/campaignRepository';
import { userRepository } from '../../src/repositories/userRepository';
import { stellarService } from '../../src/services/stellarService';
import { AppError } from '../../src/middleware/errorHandler';

jest.mock('../../src/repositories/rewardRepository');
jest.mock('../../src/repositories/campaignRepository');
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/services/stellarService');

const mockCampaign = {
  id: 'camp-1',
  merchant_id: 'merch-1',
  name: 'Test Campaign',
  description: null,
  contract_campaign_id: null,
  budget_apex: '1000000',
  issued_apex: '0',
  reward_per_point: '100',
  status: 'active' as const,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockUser = {
  id: 'user-1',
  email: 'user@apexrewards.test',
  password_hash: 'hash',
  stellar_public_key: null,
  role: 'customer' as const,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReward = {
  id: 'reward-1',
  user_id: 'user-1',
  campaign_id: 'camp-1',
  points: 10,
  apex_amount: '1000',
  status: 'issued' as const,
  tx_hash: null,
  created_at: new Date(),
  updated_at: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('ApexRewards rewardService.issueReward', () => {
  it('issues reward off-chain when user has no Stellar key', async () => {
    (campaignRepository.findById as jest.Mock).mockResolvedValue(mockCampaign);
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (rewardRepository.create as jest.Mock).mockResolvedValue({ ...mockReward, status: 'pending' });
    (rewardRepository.updateStatus as jest.Mock).mockResolvedValue(mockReward);
    (rewardRepository.findById as jest.Mock).mockResolvedValue(mockReward);
    (campaignRepository.incrementIssued as jest.Mock).mockResolvedValue(undefined);

    const result = await rewardService.issueReward('user-1', 'camp-1', 10);

    expect(result.apex_amount).toBe('1000');
    expect(stellarService.issueRewardOnChain).not.toHaveBeenCalled();
    expect(rewardRepository.updateStatus).toHaveBeenCalledWith('reward-1', 'issued');
  });

  it('throws 404 when campaign not found', async () => {
    (campaignRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(rewardService.issueReward('user-1', 'bad-id', 10)).rejects.toThrow(AppError);
  });

  it('throws 400 when campaign is paused', async () => {
    (campaignRepository.findById as jest.Mock).mockResolvedValue({ ...mockCampaign, status: 'paused' });
    await expect(rewardService.issueReward('user-1', 'camp-1', 10)).rejects.toThrow(AppError);
  });

  it('throws 400 when budget is exhausted', async () => {
    (campaignRepository.findById as jest.Mock).mockResolvedValue({
      ...mockCampaign,
      budget_apex: '500',
      issued_apex: '400',
      reward_per_point: '100',
    });
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    // 10 points * 100 = 1000 > remaining 100
    await expect(rewardService.issueReward('user-1', 'camp-1', 10)).rejects.toThrow(AppError);
  });
});

describe('ApexRewards rewardService.getUserApexBalance', () => {
  it('returns off-chain balance when no Stellar key', async () => {
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
    (rewardRepository.totalApexByUser as jest.Mock).mockResolvedValue('5000');

    const bal = await rewardService.getUserApexBalance('user-1');
    expect(bal.offChain).toBe('5000');
    expect(bal.onChain).toBe('0');
    expect(stellarService.getBalance).not.toHaveBeenCalled();
  });
});
