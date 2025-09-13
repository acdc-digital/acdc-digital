"use client";

import { Authenticated } from "convex/react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { CampaignCard } from "@/app/dashboard/_components/DashboardCards";
// import { useCampaigns } from "@/hooks/useEmailMarketing"; // Demo mode
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";

type CampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed" | undefined;

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <Authenticated>
        <CampaignsContent />
      </Authenticated>
    </DashboardLayout>
  );
}

// Mock data for demonstration
const mockCampaigns = [
  {
    _id: "1",
    name: "Welcome Series",
    status: "completed" as const,
    subject: "Welcome to our community!",
    totalRecipients: 1250,
    sentCount: 1250,
    deliveredCount: 1198,
    bouncedCount: 52,
    openedCount: 487,
    clickedCount: 142,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    _id: "2", 
    name: "Product Launch",
    status: "sending" as const,
    subject: "Introducing our latest feature",
    totalRecipients: 3500,
    sentCount: 2100,
    deliveredCount: 2040,
    bouncedCount: 60,
    openedCount: 612,
    clickedCount: 89,
    createdAt: Date.now() - 86400000,
  },
  {
    _id: "3",
    name: "Weekly Newsletter #47",
    status: "scheduled" as const,
    subject: "This week in tech news",
    totalRecipients: 5200,
    sentCount: 0,
    deliveredCount: 0,
    bouncedCount: 0,
    openedCount: 0,
    clickedCount: 0,
    createdAt: Date.now() - 3600000,
  },
];

function CampaignsContent() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>(undefined);
  const isLoading = false; // Demo mode
  const allCampaigns = mockCampaigns;
  const campaigns = statusFilter ? allCampaigns.filter(c => c.status === statusFilter) : allCampaigns;

  const statusOptions: { value: CampaignStatus; label: string; count?: number }[] = [
    { value: undefined, label: "All" },
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "sending", label: "Sending" },
    { value: "completed", label: "Completed" },
    { value: "paused", label: "Paused" },
    { value: "failed", label: "Failed" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Create, manage, and monitor your email campaigns</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/create">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 flex-wrap">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">Filter by status:</span>
        {statusOptions.map((option) => (
          <Badge
            key={option.value || "all"}
            variant={statusFilter === option.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
            {option.count !== undefined && ` (${option.count})`}
          </Badge>
        ))}
      </div>

      {/* Campaign Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onClick={() => {
                window.location.href = `/dashboard/campaigns/${campaign._id}`;
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📧</div>
          <h3 className="text-lg font-semibold text-gray-900">
            {statusFilter ? `No ${statusFilter} campaigns` : "No campaigns yet"}
          </h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {statusFilter
              ? `You don't have any campaigns with status "${statusFilter}".`
              : "Get started by creating your first email campaign to reach your audience."}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/dashboard/campaigns/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}