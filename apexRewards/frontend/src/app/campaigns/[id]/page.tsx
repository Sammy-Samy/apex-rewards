"use client";

import { use } from "react";
import { useCampaign } from "@/hooks/useCampaigns";
import { useWallet } from "@/hooks/useWallet";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatApex, formatDate } from "@/lib/utils";
import { useState } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CampaignDetailPage({ params }: Props) {
  const { id } = use(params);
  const { campaign, loading, error } = useCampaign(id);
  const { connected, publicKey, connect } = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  async function handleClaim() {
    if (!publicKey) return;
    setClaiming(true);
    setClaimError(null);
    try {
      await api.claimReward(id, publicKey);
      setClaimed(true);
    } catch (e) {
      setClaimError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  if (loading) return <div className="p-10 text-gray-400">Loading campaign…</div>;
  if (error || !campaign) return <div className="p-10 text-red-500">Campaign not found.</div>;

  const progress = Math.round(
    ((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget) * 100
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
        <Badge variant={campaign.status === "active" ? "success" : campaign.status === "upcoming" ? "warning" : "danger"}>
          {campaign.status}
        </Badge>
      </div>
      <p className="text-sm text-gray-500 mb-6">{campaign.description}</p>

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-400 text-xs mb-1">Reward per participant</p>
            <p className="font-bold text-purple-700 text-lg">{formatApex(campaign.rewardAmount)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Participants</p>
            <p className="font-semibold text-gray-900">{campaign.participantCount}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Start</p>
            <p className="font-medium text-gray-700">{formatDate(campaign.startDate)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">End</p>
            <p className="font-medium text-gray-700">{formatDate(campaign.endDate)}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Budget used</span>
            <span>{formatApex(campaign.totalBudget - campaign.remainingBudget)} / {formatApex(campaign.totalBudget)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {claimed ? (
          <p className="text-green-600 font-medium text-sm">✓ Reward claimed! APEX tokens will arrive shortly.</p>
        ) : connected ? (
          <>
            <Button onClick={handleClaim} disabled={claiming || campaign.status !== "active"} className="w-full">
              {claiming ? "Claiming…" : "Claim APEX Reward"}
            </Button>
            {claimError && <p className="text-red-500 text-xs mt-2">{claimError}</p>}
          </>
        ) : (
          <Button onClick={connect} className="w-full">Connect Wallet to Claim</Button>
        )}
      </div>

      <p className="text-xs text-gray-400">Sponsored by <span className="font-medium">{campaign.sponsor}</span> · Category: {campaign.category}</p>
    </div>
  );
}
