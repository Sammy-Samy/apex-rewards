"use client";

import { useState } from "react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Input } from "@/components/ui/Input";
import type { Campaign } from "@/types";

export default function CampaignsPage() {
  const { campaigns, loading, error } = useCampaigns();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Campaign["status"] | "all">("all");

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">ApexRewards Campaigns</h1>
      <p className="text-sm text-gray-500 mb-8">
        Participate in campaigns to earn APEX tokens on Stellar.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Search campaigns…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          {(["all", "active", "upcoming", "ended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? "bg-purple-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading campaigns…</p>}
      {error && <p className="text-red-500 text-sm">Failed to load campaigns: {error}</p>}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No campaigns match your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
