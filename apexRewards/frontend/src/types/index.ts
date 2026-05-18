export interface Campaign {
  id: string;
  title: string;
  description: string;
  rewardAmount: number; // APEX tokens
  totalBudget: number;
  remainingBudget: number;
  startDate: string;
  endDate: string;
  status: "active" | "ended" | "upcoming";
  sponsor: string;
  category: string;
  participantCount: number;
}

export interface UserReward {
  campaignId: string;
  campaignTitle: string;
  amount: number;
  earnedAt: string;
  status: "pending" | "claimable" | "claimed";
  txHash?: string;
}

export interface WalletState {
  publicKey: string | null;
  connected: boolean;
  balance: string | null;
  apexBalance: string | null;
}

export interface RedeemOption {
  id: string;
  title: string;
  description: string;
  cost: number; // APEX tokens
  category: "gift_card" | "crypto" | "merchandise" | "discount";
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
