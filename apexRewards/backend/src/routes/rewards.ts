// ApexRewards — reward routes
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import { rewardService } from '../services/rewardService';

export const rewardRouter = Router();

const issueSchema = z.object({
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  points: z.number().int().positive(),
});

const redeemSchema = z.object({
  amount: z.string().regex(/^\d+$/),
});

// Merchant/admin — issue reward to a user
rewardRouter.post(
  '/issue',
  authenticate,
  requireRole('merchant', 'admin'),
  validate(issueSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reward = await rewardService.issueReward(
        req.body.userId,
        req.body.campaignId,
        req.body.points
      );
      res.status(201).json(reward);
    } catch (err) {
      next(err);
    }
  }
);

// Customer — list own rewards
rewardRouter.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await rewardService.getUserRewards(req.user!.sub));
    } catch (err) {
      next(err);
    }
  }
);

// Customer — get APEX balance (off-chain + on-chain)
rewardRouter.get(
  '/balance',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await rewardService.getUserApexBalance(req.user!.sub));
    } catch (err) {
      next(err);
    }
  }
);

// Customer — redeem (burn) APEX
rewardRouter.post(
  '/redeem',
  authenticate,
  validate(redeemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const txHash = await rewardService.redeemApex(req.user!.sub, req.body.amount);
      res.json({ txHash });
    } catch (err) {
      next(err);
    }
  }
);
