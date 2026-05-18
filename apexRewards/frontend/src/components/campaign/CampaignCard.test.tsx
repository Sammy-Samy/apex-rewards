import { render, screen } from "@testing-library/react";
import { CampaignCard } from "./CampaignCard";
import type { Campaign } from "@/types";

const mockCampaign: Campaign = {
  id: "1",
  title: "ApexRewards Launch Campaign",
  description: "Earn APEX tokens for early participation in the ApexRewards platform.",
  rewardAmount: 100,
  totalBudget: 10000,
  remainingBudget: 7500,
  startDate: "2026-05-01",
  endDate: "2026-06-01",
  status: "active",
  sponsor: "ApexRewards",
  category: "onboarding",
  participantCount: 42,
};

describe("CampaignCard", () => {
  it("renders campaign title", () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText("ApexRewards Launch Campaign")).toBeInTheDocument();
  });

  it("renders reward amount with APEX suffix", () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText(/100.*APEX/i)).toBeInTheDocument();
  });

  it("renders active status badge", () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders participant count", () => {
    render(<CampaignCard campaign={mockCampaign} />);
    expect(screen.getByText(/42 participants/i)).toBeInTheDocument();
  });

  it("renders view link pointing to campaign id", () => {
    render(<CampaignCard campaign={mockCampaign} />);
    const link = screen.getByRole("link", { name: /view/i });
    expect(link).toHaveAttribute("href", "/campaigns/1");
  });
});
