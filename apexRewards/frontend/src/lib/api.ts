import type { Campaign, UserReward, RedeemOption, ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const api = {
  getCampaigns: () => apiFetch<Campaign[]>("/api/campaigns"),
  getCampaign: (id: string) => apiFetch<Campaign>(`/api/campaigns/${id}`),
  getUserRewards: (publicKey: string) =>
    apiFetch<UserReward[]>(`/api/rewards?wallet=${publicKey}`),
  claimReward: (campaignId: string, publicKey: string) =>
    apiFetch<{ txHash: string }>("/api/rewards/claim", {
      method: "POST",
      body: JSON.stringify({ campaignId, publicKey }),
    }),
  getRedeemOptions: () => apiFetch<RedeemOption[]>("/api/redeem"),
  redeem: (optionId: string, publicKey: string) =>
    apiFetch<{ success: boolean }>("/api/redeem", {
      method: "POST",
      body: JSON.stringify({ optionId, publicKey }),
    }),
};
