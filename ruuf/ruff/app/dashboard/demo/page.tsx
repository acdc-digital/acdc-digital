"use client";

import { Authenticated } from "convex/react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { MetricCard, CampaignCard } from "@/app/dashboard/_components/DashboardCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Plus, 
  Send, 
  Users, 
  TrendingUp, 
  Mail,
  Calendar,
  BarChart,
  Settings
} from "lucide-react";

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
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    scheduledAt: null,
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
    createdAt: Date.now() - 86400000, // 1 day ago
    scheduledAt: null,
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
    createdAt: Date.now() - 3600000, // 1 hour ago
    scheduledAt: Date.now() + 3600000 * 2, // 2 hours from now
  },
  {
    _id: "4",
    name: "Customer Feedback Survey",
    status: "draft" as const,
    subject: "We'd love your feedback",
    totalRecipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    bouncedCount: 0,
    openedCount: 0,
    clickedCount: 0,
    createdAt: Date.now() - 1800000, // 30 minutes ago
    scheduledAt: null,
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </DashboardLayout>
  );
}

function DashboardContent() {
  const campaigns = mockCampaigns;
  
  // Calculate metrics
  const activeCampaigns = campaigns.filter(c => c.status === "sending" || c.status === "scheduled").length;
  const completedCampaigns = campaigns.filter(c => c.status === "completed").length;
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.totalRecipients, 0);
  
  const recentCampaigns = campaigns
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your email campaigns and track their performance
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/campaigns/create">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Campaigns"
          value={activeCampaigns.toString()}
          description="+2 from last week"
          trend={{ value: 15, isPositive: true }}
          icon={<Send className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Recipients"
          value={totalRecipients.toLocaleString()}
          description="+12% from last month"
          trend={{ value: 12, isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. Open Rate"
          value="24.3%"
          description="+1.2% from last month"
          trend={{ value: 1.2, isPositive: true }}
          icon={<Mail className="h-4 w-4" />}
        />
        <MetricCard
          title="Completed Campaigns"
          value={completedCampaigns.toString()}
          description="This month"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-16" asChild>
          <Link href="/dashboard/campaigns/create">
            <div className="flex flex-col items-center space-y-1">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Create Campaign</span>
            </div>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-16" asChild>
          <Link href="/dashboard/campaigns">
            <div className="flex flex-col items-center space-y-1">
              <Mail className="h-5 w-5" />
              <span className="text-sm">View Campaigns</span>
            </div>
          </Link>
        </Button>
        
        <Button variant="outline" className="h-16" disabled>
          <div className="flex flex-col items-center space-y-1">
            <BarChart className="h-5 w-5" />
            <span className="text-sm">Analytics</span>
          </div>
        </Button>
        
        <Button variant="outline" className="h-16" disabled>
          <div className="flex flex-col items-center space-y-1">
            <Settings className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </div>
        </Button>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Campaigns</h2>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/campaigns">
              View All
            </Link>
          </Button>
        </div>
        
        {recentCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onClick={() => {
                  alert(`Demo: Would navigate to campaign ${campaign.name}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No campaigns yet</h3>
            <p className="text-gray-500 mt-2">Create your first email campaign to get started</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/campaigns/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">System Status: All systems operational</p>
              <p className="text-sm text-blue-700">Email delivery is working normally</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Calendar className="h-3 w-3 mr-1" />
            Live Demo
          </Badge>
        </div>
      </div>
    </div>
  );
}