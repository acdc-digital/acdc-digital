"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  BookOpen, 
  Bot,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { createAnalyticsService, defaultAnalyticsConfig } from "@/lib/services/analytics/analyticsServiceClean";

interface DashboardStats {
  overview: {
    total_users: number;
    active_users_last_7_days: number;
    total_events_last_7_days: number;
    avg_engagement_score: number;
  };
  user_distribution: {
    by_archetype: Record<string, number>;
    by_account_type: Record<string, number>;
  };
  engagement_trends: {
    high_engagement_users: number;
    at_risk_users: number;
    new_users_this_period: number;
  };
  content_stats: {
    total_posts_viewed: number;
    total_ai_requests: number;
    total_stories_read: number;
  };
}

interface EngagementMetrics {
  success: boolean;
  message: string;
  data?: {
    user_profile: {
      overall_engagement_score: number;
      user_archetype: string;
      engagement_trend: string;
      churn_risk_score: number;
    };
    activity_summary: {
      total_sessions: number;
      total_events: number;
      posts_viewed: number;
      posts_clicked: number;
      ai_requests_made: number;
    };
    time_metrics: {
      avg_session_duration: number;
      last_active: number;
      login_streak: number;
    };
    content_engagement: {
      stories_opened: number;
      stories_completed: number;
      completion_rate: number;
      newsletter_subscribed: boolean;
    };
  };
}

export default function AnalyticsDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userMetrics, setUserMetrics] = useState<EngagementMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const analyticsService = createAnalyticsService({
    ...defaultAnalyticsConfig,
    enabled: true
  });

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log("📊 Loading dashboard analytics data...");
      
      const stats = await analyticsService.getDashboardStats(timeframe);
      if (stats) {
        setDashboardStats(stats);
        console.log("✅ Dashboard stats loaded:", stats);
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserMetrics = async (userId: string) => {
    if (!userId) return;
    
    try {
      console.log(`👤 Loading user metrics for: ${userId}`);
      
      const metrics = await analyticsService.getEngagementMetrics(userId, 30);
      if (metrics) {
        setUserMetrics(metrics);
        console.log("✅ User metrics loaded:", metrics);
      }
    } catch (error) {
      console.error("❌ Error loading user metrics:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (selectedUser) {
      await loadUserMetrics(selectedUser);
    }
    setRefreshing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getArchetypeColor = (archetype: string): string => {
    const colors: Record<string, string> = {
      lurker: "bg-gray-500",
      engager: "bg-blue-500",
      creator: "bg-green-500",
      curator: "bg-purple-500",
      influencer: "bg-orange-500"
    };
    return colors[archetype] || "bg-gray-400";
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive user behavior and engagement insights
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {dashboardStats && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardStats.overview.total_users)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered platform users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardStats.overview.active_users_last_7_days)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last {timeframe} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardStats.overview.total_events_last_7_days)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    User interactions tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.overview.avg_engagement_score.toFixed(1)}%
                  </div>
                  <Progress 
                    value={dashboardStats.overview.avg_engagement_score} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Engagement Trends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔥 High Engagement</CardTitle>
                  <CardDescription>Users with 70+ engagement score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardStats.engagement_trends.high_engagement_users}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {((dashboardStats.engagement_trends.high_engagement_users / dashboardStats.overview.total_users) * 100).toFixed(1)}% of total users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚠️ At Risk</CardTitle>
                  <CardDescription>Users with high churn probability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {dashboardStats.engagement_trends.at_risk_users}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Require retention intervention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🆕 New Users</CardTitle>
                  <CardDescription>Recently registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardStats.engagement_trends.new_users_this_period}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last {timeframe} days
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {/* User Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>👥 User Archetypes</CardTitle>
                  <CardDescription>Distribution by behavior patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.user_distribution.by_archetype).map(([archetype, count]) => (
                      <div key={archetype} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getArchetypeColor(archetype)}`}></div>
                          <span className="capitalize">{archetype}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏆 Account Types</CardTitle>
                  <CardDescription>Distribution by subscription level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.user_distribution.by_account_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={(count / dashboardStats.overview.total_users) * 100} 
                            className="w-20 h-2"
                          />
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Individual User Lookup */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 User Analytics Lookup</CardTitle>
                <CardDescription>View detailed metrics for specific users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter user ID..."
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <Button onClick={() => loadUserMetrics(selectedUser)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Metrics
                  </Button>
                </div>

                {userMetrics?.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Engagement Score</div>
                        <div className={`text-2xl font-bold ${getEngagementColor(userMetrics.data.user_profile.overall_engagement_score)}`}>
                          {userMetrics.data.user_profile.overall_engagement_score.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Archetype</div>
                        <Badge className={`${getArchetypeColor(userMetrics.data.user_profile.user_archetype)} text-white`}>
                          {userMetrics.data.user_profile.user_archetype}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Sessions</div>
                        <div className="text-2xl font-bold">
                          {userMetrics.data.activity_summary.total_sessions}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">AI Requests</div>
                        <div className="text-2xl font-bold">
                          {userMetrics.data.activity_summary.ai_requests_made}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            {/* Content Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Posts Viewed</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardStats.content_stats.total_posts_viewed)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time live feed views
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stories Read</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardStats.content_stats.total_stories_read)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed story views
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(dashboardStats.content_stats.total_ai_requests)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI assistance usage
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📈 Engagement Analytics</CardTitle>
                <CardDescription>
                  Detailed engagement patterns and behavioral insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced engagement visualizations coming soon...</p>
                  <p className="text-sm mt-2">
                    This will include time-series charts, cohort analysis, and funnel metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Analytics powered by SMNB comprehensive tracking system
      </div>
    </div>
  );
}