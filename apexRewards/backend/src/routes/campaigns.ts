// ApexRewards — campaign routes
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import { campaignService } from '../services/campaignService';

export const campaignRouter = Router();

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  budgetApex: z.string().regex(/^\d+$/),
  rewardPerPoint: z.string().regex(/^\d+$/),
});

const statusSchema = z.object({
  status: z.enum(['active', 'paused', 'closed']),
});

// Public — list active campaigns
campaignRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await campaignService.listActive());
  } catch (err) {
    next(err);
  }
});

// Merchant — list own campaigns
campaignRouter.get(
  '/mine',
  authenticate,
  requireRole('merchant', 'admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await campaignService.listByMerchant(req.user!.sub));
    } catch (err) {
      next(err);
    }
  }
);

// Public — get single campaign
campaignRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await campaignService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

// Merchant — create campaign
campaignRouter.post(
  '/',
  authenticate,
  requireRole('merchant', 'admin'),
  validate(createSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.create(req.user!.sub, req.body);
      res.status(201).json(campaign);
    } catch (err) {
      next(err);
    }
  }
);

// Merchant — update campaign status
campaignRouter.patch(
  '/:id/status',
  authenticate,
  requireRole('merchant', 'admin'),
  validate(statusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await campaignService.updateStatus(
        req.params.id,
        req.user!.sub,
        req.body.status
      );
      res.json(campaign);
    } catch (err) {
      next(err);
    }
  }
);
