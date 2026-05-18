"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatApex, formatDate, truncateAddress } from "@/lib/utils";
import type { UserReward } from "@/types";

export default function DashboardPage() {
  const { connected, publicKey, apexBalance, connect } = useWallet();
  const [rewards, setRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);
    api
      .getUserRewards(publicKey)
      .then(setRewards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [publicKey]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">Connect your wallet to view your dashboard.</p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }

  const claimable = rewards.filter((r) => r.status === "claimable");
  const totalEarned = rewards.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My ApexRewards Dashboard</h1>
      <p className="text-sm text-gray-500 font-mono mb-8">{truncateAddress(publicKey!, 8)}</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "APEX Balance", value: formatApex(apexBalance ?? "0") },
          { label: "Total Earned", value: formatApex(totalEarned) },
          { label: "Claimable", value: claimable.length.toString() },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl font-bold text-purple-700">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rewards list */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Reward History</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading rewards…</p>
      ) : rewards.length === 0 ? (
        <p className="text-gray-400 text-sm">No rewards yet. Join a campaign to start earning APEX.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rewards.map((r) => (
            <div
              key={`${r.campaignId}-${r.earnedAt}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{r.campaignTitle}</p>
                <p className="text-xs text-gray-400">{formatDate(r.earnedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-purple-700">{formatApex(r.amount)}</span>
                <Badge
                  variant={
                    r.status === "claimed" ? "success" : r.status === "claimable" ? "apex" : "default"
                  }
                >
                  {r.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
