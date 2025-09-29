'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Activity, 
  BarChart3, 
  Heart, 
  Eye, 
  Clock,
  TrendingUp,
  UserCheck,
  MessageSquare,
  BookOpen,
  Edit3,
  Target,
  Brain,
  Settings
} from 'lucide-react';

interface UserLookupState {
  userId: string;
  userData: any;
  isLoading: boolean;
}

export function UserAnalyticsDashboard() {
  const [userLookup, setUserLookup] = useState<UserLookupState>({
    userId: '',
    userData: null,
    isLoading: false
  });

  // Get dashboard stats
  const dashboardStats = useQuery(api.analytics.userAnalytics.getDashboardStats, { timeframe_days: 7 });
  // Note: engagementMetrics requires user_id, so we'll use it in user lookup instead

  // Mock data for demonstration - replace with real data when available
  const mockStats = {
    totalUsers: 1247,
    activeUsers: 342,
    totalSessions: 5680,
    avgSessionDuration: 8.5,
    totalEvents: 23580,
    conversionRate: 12.4
  };

  const mockUserTypes = [
    { type: 'Content Creators', count: 145, percentage: 35 },
    { type: 'News Readers', count: 298, percentage: 45 },
    { type: 'Casual Browsers', count: 87, percentage: 20 }
  ];

  const mockEngagement = [
    { metric: 'Story Views', value: 15420, change: '+12%' },
    { metric: 'Live Feed Interactions', value: 8935, change: '+8%' },
    { metric: 'Newsletter Opens', value: 3240, change: '+15%' },
    { metric: 'Editor Sessions', value: 1580, change: '+22%' }
  ];

  const handleUserLookup = async (userId: string) => {
    if (!userId.trim()) return;
    
    setUserLookup({ userId, userData: null, isLoading: true });
    
    // Simulate API call - replace with real lookup
    setTimeout(() => {
      const mockUserData = {
        id: userId,
        email: `user${userId}@example.com`,
        totalSessions: Math.floor(Math.random() * 50) + 1,
        totalEvents: Math.floor(Math.random() * 500) + 10,
        engagementScore: Math.floor(Math.random() * 100),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        archetype: ['Content Creator', 'News Reader', 'Casual Browser'][Math.floor(Math.random() * 3)],
        preferences: {
          categories: ['Technology', 'Politics', 'Science'],
          notification: true,
          theme: 'dark'
        }
      };
      
      setUserLookup({ userId, userData: mockUserData, isLoading: false });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">👥 User Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive user behavior tracking and insights across all platform interactions
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Activity className="w-3 h-3 mr-1" />
          Real-time Data
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Engagement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
                <Badge variant="secondary" className="mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.activeUsers}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {((mockStats.activeUsers / mockStats.totalUsers) * 100).toFixed(1)}% of total users
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.avgSessionDuration}m</div>
                <Badge variant="secondary" className="mt-2">
                  +8% increase
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalEvents.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Across all interactions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.conversionRate}%</div>
                <Badge variant="secondary" className="mt-2">
                  Newsletter signups
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalSessions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  All-time sessions
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Archetypes Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                User Archetype Distribution
              </CardTitle>
              <CardDescription>
                ML-powered user classification based on behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUserTypes.map((type) => (
                <div key={type.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{type.count} users</span>
                      <Badge variant="outline">{type.percentage}%</Badge>
                    </div>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* User Lookup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Lookup
              </CardTitle>
              <CardDescription>
                Search for specific user analytics and behavior data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter User ID or Email"
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
                  value={userLookup.userId}
                  onChange={(e) => setUserLookup(prev => ({ ...prev, userId: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserLookup(userLookup.userId)}
                />
                <button
                  onClick={() => handleUserLookup(userLookup.userId)}
                  disabled={userLookup.isLoading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {userLookup.isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {userLookup.userData && (
                <div className="p-4 border border-border rounded-md bg-muted/50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground">User Information</h4>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        <div><strong>ID:</strong> {userLookup.userData.id}</div>
                        <div><strong>Email:</strong> {userLookup.userData.email}</div>
                        <div><strong>Archetype:</strong> <Badge variant="secondary">{userLookup.userData.archetype}</Badge></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Activity Metrics</h4>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        <div><strong>Sessions:</strong> {userLookup.userData.totalSessions}</div>
                        <div><strong>Events:</strong> {userLookup.userData.totalEvents}</div>
                        <div><strong>Engagement Score:</strong> 
                          <Badge variant={userLookup.userData.engagementScore > 70 ? "default" : "secondary"} className="ml-2">
                            {userLookup.userData.engagementScore}%
                          </Badge>
                        </div>
                        <div><strong>Last Active:</strong> {new Date(userLookup.userData.lastActive).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Story Performance
                </CardTitle>
                <CardDescription>
                  Analytics for individual stories and content pieces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Stories Published</span>
                    <Badge variant="secondary">1,247</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Views per Story</span>
                    <span className="font-medium">342</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Performing Category</span>
                    <Badge>Technology</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Editor Usage
                </CardTitle>
                <CardDescription>
                  Newsletter editor interaction analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Active Editor Sessions</span>
                    <Badge variant="secondary">89</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Session Duration</span>
                    <span className="font-medium">12.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Newsletters Created</span>
                    <Badge>156</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Engagement Metrics
              </CardTitle>
              <CardDescription>
                Real-time engagement scoring across all platform interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockEngagement.map((item) => (
                  <div key={item.metric} className="p-4 border border-border rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <Badge variant="secondary">{item.change}</Badge>
                    </div>
                    <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Score Distribution</CardTitle>
              <CardDescription>
                User engagement levels across the platform (0-100 scale)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>High Engagement (80-100)</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Medium Engagement (40-79)</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Low Engagement (0-39)</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}