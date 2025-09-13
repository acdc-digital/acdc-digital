"use client";

import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { MetricCard, CampaignCard, DeliveryStats } from "@/app/dashboard/_components/DashboardCards";
import { useCampaigns, useDeliveryStats } from "@/hooks/useEmailMarketing";
import { useDashboardStore, getViewMetrics } from "@/lib/store/dashboardStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Mail, Users, TrendingUp, AlertTriangle, RefreshCw, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="mb-4">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in required
            </h3>
            <p className="text-gray-600 mb-4">
              Please sign in to access your email marketing dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Look for the sign-in button in the top-right corner.
            </p>
          </div>
        </div>
      </Unauthenticated>
    </DashboardLayout>
  );
}

function DashboardContent() {
  const ensureUser = useMutation(api.users.ensureCurrentUser);
  const [userReady, setUserReady] = useState(false);
  
  // Zustand store state
  const { 
    currentView, 
    metrics, 
    recentActivity, 
    isLoading: storeLoading, 
    refreshDashboard
  } = useDashboardStore();

  // Ensure user exists in database when component mounts
  useEffect(() => {
    ensureUser({})
      .then(() => {
        setUserReady(true);
      })
      .catch((error) => {
        console.error("Failed to ensure user:", error);
      });
  }, [ensureUser]);

  // Only load data after user is ready
  const { campaigns, isLoading: campaignsLoading } = useCampaigns(undefined, userReady);
  const { stats, isLoading: statsLoading } = useDeliveryStats(undefined, userReady);

  // Show loading while ensuring user exists
  if (!userReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Setting up your dashboard...
          </h3>
          <p className="text-gray-600">
            Please wait while we prepare your workspace.
          </p>
        </div>
      </div>
    );
  }

  // Get view-specific metrics and content
  const viewMetrics = getViewMetrics(currentView, metrics);
  
  const getViewTitle = (view: string) => {
    switch (view) {
      case 'campaigns': return 'Campaign Management';
      case 'recipients': return 'Recipient Analytics'; 
      case 'analytics': return 'Performance Analytics';
      case 'settings': return 'Settings Overview';
      default: return 'Dashboard Overview';
    }
  };

  const getViewDescription = (view: string) => {
    switch (view) {
      case 'campaigns': return 'Manage and monitor your email campaigns';
      case 'recipients': return 'View and analyze your recipient data';
      case 'analytics': return 'Detailed performance metrics and insights';
      case 'settings': return 'Configure your email marketing preferences';
      default: return 'Your email marketing dashboard';
    }
  };

  const getStatusColor = (severity?: string) => {
    switch (severity) {
      case "error": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";  
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_sent': return Mail;
      case 'open': return TrendingUp;
      case 'click': return Activity;
      case 'bounce': return ArrowDownRight;
      case 'unsubscribe': return Users;
      default: return Activity;
    }
  };

  if (campaignsLoading || statsLoading || storeLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Loading...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="text-center text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  const recentCampaigns = campaigns
    ?.sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6) || [];

  return (
    <div className="space-y-8 min-h-[500px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getViewTitle(currentView)}</h1>
          <p className="text-gray-600 mt-1">{getViewDescription(currentView)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/campaigns/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Dynamic Metrics based on current view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {viewMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.label}
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="flex items-center text-xs text-green-600">
                <span>{metric.change} from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <Badge className={getStatusColor(activity.severity)}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* View-specific content */}
      {currentView === 'overview' && recentCampaigns.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Campaigns</h2>
            <Button variant="outline" asChild>
              <Link href="/dashboard/campaigns">View All</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCampaigns.slice(0, 3).map((campaign) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                onClick={() => {
                  window.location.href = `/dashboard/campaigns/${campaign._id}`;
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for overview */}
      {currentView === 'overview' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/dashboard/recipients">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Manage Recipients</div>
                  <div className="text-sm text-gray-500">Upload and organize your email lists</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/dashboard/analytics">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-500">Analyze campaign performance</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/dashboard/assistant">
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">AI Assistant</div>
                  <div className="text-sm text-gray-500">Get intelligent insights and help</div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* View-specific empty states for other views */}
      {currentView !== 'overview' && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {getViewTitle(currentView)} Content
            </h3>
            <p className="text-gray-500 mb-4">
              {currentView === 'campaigns' && 'Campaign management features will appear here.'}
              {currentView === 'recipients' && 'Recipient management tools will appear here.'}
              {currentView === 'analytics' && 'Detailed analytics and reports will appear here.'}
              {currentView === 'settings' && 'Account and system settings will appear here.'}
            </p>
            <Button asChild>
              <Link href={`/dashboard/${currentView}`}>
                Go to {getViewTitle(currentView)}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
