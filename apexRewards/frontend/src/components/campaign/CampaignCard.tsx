import Link from "next/link";
import type { Campaign } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatApex, formatDate } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Campaign;
}

const statusVariant: Record<Campaign["status"], "success" | "danger" | "warning"> = {
  active: "success",
  ended: "danger",
  upcoming: "warning",
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = Math.round(
    ((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget) * 100
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{campaign.title}</h3>
        <Badge variant={statusVariant[campaign.status]}>{campaign.status}</Badge>
      </div>

      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{campaign.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Reward: <span className="font-semibold text-purple-700">{formatApex(campaign.rewardAmount)}</span></span>
        <span>{campaign.participantCount} participants</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Budget used</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Ends {formatDate(campaign.endDate)}</span>
        <Link href={`/campaigns/${campaign.id}`}>
          <Button size="sm" variant="outline">View</Button>
        </Link>
      </div>
    </div>
  );
}
