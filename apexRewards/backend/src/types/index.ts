// ApexRewards — shared TypeScript types

export interface User {
  id: string;
  email: string;
  password_hash: string;
  stellar_public_key: string | null;
  role: 'customer' | 'merchant' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Campaign {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  contract_campaign_id: number | null; // on-chain campaign ID
  budget_apex: string;                 // stored as string to avoid JS bigint loss
  issued_apex: string;
  reward_per_point: string;
  status: 'active' | 'paused' | 'closed';
  created_at: Date;
  updated_at: Date;
}

export interface Reward {
  id: string;
  user_id: string;
  campaign_id: string;
  points: number;
  apex_amount: string;
  status: 'pending' | 'issued' | 'redeemed' | 'failed';
  tx_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  reward_id: string | null;
  type: 'mint' | 'burn' | 'transfer';
  apex_amount: string;
  stellar_tx_hash: string | null;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: Date;
}

// JWT payload
export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: User['role'];
  iat?: number;
  exp?: number;
}

// Request augmentation
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
