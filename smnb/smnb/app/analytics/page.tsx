'use client';  × 'import', and 'export' cannot be used outside of module code



import React from 'react';./app/analytics/page.tsx

import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview';

import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown';Error:   × 'import', and 'export' cannot be used outside of module code

import { CostAnalysis } from '@/components/analytics/CostAnalysis';    ╭─[/Users/matthewsimon/Projects/SMNB/smnb/app/analytics/page.tsx:13:1]

import { SystemDocumentation } from '@/components/analytics/SystemDocumentation'; 10 │ 

import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics'; 11 │     </div>

import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard'; 12 │ 

import TestTokenCountingButton from '@/components/analytics/TestTokenCountingButton'; 13 │   );import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview';

    ·     ──────

export default function AnalyticsPage() { 14 │ 

  return ( 15 │ }

    <div className="min-h-screen bg-background"> 16 │ import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown';import React from 'react';

      {/* Header */}    ╰────

      <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">

        <div className="container mx-auto px-6 py-4">Caused by:

          <div className="flex items-center justify-between">    Syntax Errorexport default function AnalyticsPage() {'use client';'use client';'use client';// ANALYTICS PAGE// ANALYTICS PAGE

            <div>

              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">  return (

                📊 Analytics Dashboard

              </h1>    <div>

              <p className="text-muted-foreground mt-1">

                Comprehensive monitoring of API usage, user behavior, and platform performance      <h1>Analytics Dashboard</h1>

              </p>

            </div>      <p>User analytics coming soon...</p>import React from 'react';

            <div className="flex items-center gap-4">

              <div className="text-right">    </div>

                <div className="text-sm text-muted-foreground">System Status</div>

                <div className="flex items-center gap-2">  );import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview';

                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>

                  <span className="text-sm font-medium text-green-600">Operational</span>}

                </div>import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown';import React from 'react';

              </div>

            </div>import { CostAnalysis } from '@/components/analytics/CostAnalysis';

          </div>

        </div>import { SystemDocumentation } from '@/components/analytics/SystemDocumentation';import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview';

      </div>

import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';

      {/* Main Content - Scrollable */}

      <div className="container mx-auto px-6 py-8 space-y-12 max-h-screen overflow-y-auto">import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown';import React from 'react';// /Users/matthewsimon/Projects/SMNB/smnb/app/analytics/page.tsx// /Users/ma              <h1 className="text-3xl font-bold text-foreground">

        

        {/* Section 1: Pipeline & API Analytics */}import TestTokenCountingButton from '@/components/analytics/TestTokenCountingButton';

        <section className="space-y-8">

          <div className="flex items-center gap-3 pb-4 border-b border-border">import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { CostAnalysis } from '@/components/analytics/CostAnalysis';

            <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">

              1

            </div>

            <div>export default function AnalyticsPage() {import { SystemDocumentation } from '@/components/analytics/SystemDocumentation';import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview';

              <h2 className="text-2xl font-bold text-foreground">🔧 Pipeline & API Analytics</h2>

              <p className="text-muted-foreground text-sm">  return (

                Real-time monitoring of token usage, costs, and system performance

              </p>    <div className="min-h-screen bg-background">import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';

            </div>

          </div>      <div className="border-b border-border bg-card">



          {/* Test Token Counting System */}        <div className="container mx-auto px-6 py-8">import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown';                📊 Analytics Dashboard

          <TestTokenCountingButton />

          <div className="flex items-center justify-between">

          {/* Real-time Metrics */}

          <RealTimeMetrics />            <div>import TestTokenCountingButton from '@/components/analytics/TestTokenCountingButton';



          {/* Token Usage Overview */}              <h1 className="text-3xl font-bold text-foreground">

          <TokenUsageOverview />

                Analytics Dashboardimport { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import { CostAnalysis } from '@/components/analytics/CostAnalysis';

          {/* Endpoint Breakdown */}

          <div className="bg-card rounded-lg border border-border">              </h1>

            <div className="p-6 border-b border-border">

              <h3 className="text-xl font-semibold text-foreground">              <p className="text-muted-foreground mt-2">

                📊 Endpoint Token Breakdown

              </h3>                Comprehensive monitoring of API usage, user behavior, and platform performance

              <p className="text-muted-foreground mt-1">

                Detailed analysis of token usage across all API endpoints and agent types              </p>export default function AnalyticsPage() {import { SystemDocumentation } from '@/components/analytics/SystemDocumentation';/**              </h1>

              </p>

            </div>            </div>

            <EndpointBreakdown />

          </div>            <div className="flex items-center gap-4">  return (



          {/* Cost Analysis Grid */}              <div className="text-right">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <CostAnalysis />                <div className="text-sm text-muted-foreground">System Status</div>    <div className="min-h-screen bg-background">import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';

            <SystemDocumentation />

          </div>                <div className="flex items-center gap-2">

        </section>

                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>      <div className="border-b border-border bg-card">

        {/* Section 2: User Analytics */}

        <section className="space-y-8">                  <span className="text-sm font-medium text-green-600">Operational</span>

          <div className="flex items-center gap-3 pb-4 border-b border-border">

            <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">                </div>        <div className="container mx-auto px-6 py-8">import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard'; * Analytics Page              <p className="text-muted-foreground mt-2">

              2

            </div>              </div>

            <div>

              <h2 className="text-2xl font-bold text-foreground">👥 User Analytics & Behavior</h2>            </div>          <div className="flex items-center justify-between">

              <p className="text-muted-foreground text-sm">

                Comprehensive insights into user engagement, journeys, and platform interactions          </div>

              </p>

            </div>        </div>            <div>import TestTokenCountingButton from '@/components/analytics/TestTokenCountingButton';

          </div>

      </div>

          {/* User Analytics Dashboard */}

          <UserAnalyticsDashboard />              <h1 className="text-3xl font-bold text-foreground">

        </section>

      <div className="container mx-auto px-6 py-8">

      </div>

    </div>        <Tabs defaultValue="api" className="space-y-8">                Analytics Dashboardimport { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; *                 Comprehensive monitoring of API usage, user behavior, and platform performance • 

  );

}          <TabsList className="grid w-full grid-cols-2">

            <TabsTrigger value="api">              </h1>

              API Analytics

            </TabsTrigger>              <p className="text-muted-foreground mt-2">

            <TabsTrigger value="users">

              User Analytics                Comprehensive monitoring of API usage, user behavior, and platform performance

            </TabsTrigger>

          </TabsList>                <span className="mx-2">•</span>export default function AnalyticsPage() { * Comprehensive dashboard for monitoring Anthropic API token usage,                <a href="/stats" className="text-blue-500 hover:text-blue-600 underline">



          <TabsContent value="api" className="space-y-8">                <a href="/stats" className="text-blue-500 hover:text-blue-600 underline">

            <TestTokenCountingButton />

            <RealTimeMetrics />                  View Pipeline Stats  return (

            <TokenUsageOverview />

                            </a>

            <div className="bg-card rounded-lg border border-border">

              <div className="p-6 border-b border-border">              </p>    <div className="min-h-screen bg-background"> * costs, performance metrics, and system status across all agents.                  View Pipeline Stats →

                <h2 className="text-xl font-semibold text-foreground">

                  Endpoint Token Breakdown            </div>

                </h2>

                <p className="text-muted-foreground mt-1">            <div className="flex items-center gap-4">      {/* Header */}

                  Detailed analysis of token usage across all API endpoints and agent types

                </p>              <div className="text-right">

              </div>

              <EndpointBreakdown />                <div className="text-sm text-muted-foreground">System Status</div>      <div className="border-b border-border bg-card"> */                </a>

            </div>

                <div className="flex items-center gap-2">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <CostAnalysis />                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>        <div className="container mx-auto px-6 py-8">

              <SystemDocumentation />

            </div>                  <span className="text-sm font-medium text-green-600">Operational</span>

          </TabsContent>

                </div>          <div className="flex items-center justify-between">              </p>imon/Projects/SMNB/smnb/app/analytics/page.tsx

          <TabsContent value="users" className="space-y-8">

            <UserAnalyticsDashboard />              </div>

          </TabsContent>

        </Tabs>            </div>            <div>

      </div>

    </div>          </div>

  );

}        </div>              <h1 className="text-3xl font-bold text-foreground">'use client';

      </div>

                Analytics Dashboard

      <div className="container mx-auto px-6 py-8">

        <Tabs defaultValue="api" className="space-y-8">              </h1>/**

          <TabsList className="grid w-full grid-cols-2">

            <TabsTrigger value="api">              <p className="text-muted-foreground mt-2">

              API Analytics

            </TabsTrigger>                Comprehensive monitoring of API usage, user behavior, and platform performanceimport React from 'react'; * Analytics Page

            <TabsTrigger value="users">

              User Analytics                <span className="mx-2">•</span>

            </TabsTrigger>

          </TabsList>                <a href="/stats" className="text-blue-500 hover:text-blue-600 underline">import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview'; * 



          <TabsContent value="api" className="space-y-8">                  View Pipeline Stats

            <TestTokenCountingButton />

            <RealTimeMetrics />                </a>import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown'; * Comprehensive dashboard for monitoring Anthropic API token usage,

            <TokenUsageOverview />

                          </p>

            <div className="bg-card rounded-lg border border-border">

              <div className="p-6 border-b border-border">            </div>import { CostAnalysis } from '@/components/analytics/CostAnalysis'; * costs, performance metrics, and system status across all agents.

                <h2 className="text-xl font-semibold text-foreground">

                  Endpoint Token Breakdown            <div className="flex items-center gap-4">

                </h2>

                <p className="text-muted-foreground mt-1">              <div className="text-right">import { SystemDocumentation } from '@/components/analytics/SystemDocumentation'; */

                  Detailed analysis of token usage across all API endpoints and agent types

                </p>                <div className="text-sm text-muted-foreground">System Status</div>

              </div>

              <EndpointBreakdown />                <div className="flex items-center gap-2">import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';

            </div>

                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <CostAnalysis />                  <span className="text-sm font-medium text-green-600">Operational</span>import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';'use client';

              <SystemDocumentation />

            </div>                </div>

          </TabsContent>

              </div>import TestTokenCountingButton from '@/components/analytics/TestTokenCountingButton';

          <TabsContent value="users" className="space-y-8">

            <UserAnalyticsDashboard />            </div>

          </TabsContent>

        </Tabs>          </div>import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';import React from 'react';

      </div>

    </div>        </div>

  );

}      </div>import { TokenUsageOverview } from '@/components/analytics/TokenUsageOverview';



      {/* Main Content */}export default function AnalyticsPage() {import { EndpointBreakdown } from '@/components/analytics/EndpointBreakdown';

      <div className="container mx-auto px-6 py-8">

        <Tabs defaultValue="api" className="space-y-8">  return (import { CostAnalysis } from '@/components/analytics/CostAnalysis';

          <TabsList className="grid w-full grid-cols-2">

            <TabsTrigger value="api" className="flex items-center gap-2">    <div className="min-h-screen bg-background">import { SystemDocumentation } from '@/components/analytics/SystemDocumentation';

              API Analytics

            </TabsTrigger>      {/* Header */}import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';

            <TabsTrigger value="users" className="flex items-center gap-2">

              User Analytics      <div className="border-b border-border bg-card">import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';

            </TabsTrigger>

          </TabsList>        <div className="container mx-auto px-6 py-8">import TestTokenCountingButton from '@/components/analytics/TestTokenCountingButton';



          {/* API Analytics Tab */}          <div className="flex items-center justify-between">import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

          <TabsContent value="api" className="space-y-8">

            <TestTokenCountingButton />            <div>

            <RealTimeMetrics />

            <TokenUsageOverview />              <h1 className="text-3xl font-bold text-foreground">export default function AnalyticsPage() {

            

            <div className="bg-card rounded-lg border border-border">                📊 Analytics Dashboard  return (

              <div className="p-6 border-b border-border">

                <h2 className="text-xl font-semibold text-foreground">              </h1>    <div className="min-h-screen bg-background">

                  Endpoint Token Breakdown

                </h2>              <p className="text-muted-foreground mt-2">      {/* Header */}

                <p className="text-muted-foreground mt-1">

                  Detailed analysis of token usage across all API endpoints and agent types                Comprehensive monitoring of API usage, user behavior, and platform performance •       <div className="border-b border-border bg-card">

                </p>

              </div>                <a href="/stats" className="text-blue-500 hover:text-blue-600 underline">        <div className="container mx-auto px-6 py-8">

              <EndpointBreakdown />

            </div>                  View Pipeline Stats →          <div className="flex items-center justify-between">



            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">                </a>            <div>

              <CostAnalysis />

              <SystemDocumentation />              </p>              <h1 className="text-3xl font-bold text-foreground">

            </div>

          </TabsContent>            </div>                � Analytics Dashboard



          {/* User Analytics Tab */}            <div className="flex items-center gap-4">              </h1>

          <TabsContent value="users" className="space-y-8">

            <UserAnalyticsDashboard />              <div className="text-right">              <p className="text-muted-foreground mt-2">

          </TabsContent>

        </Tabs>                <div className="text-sm text-muted-foreground">System Status</div>                Comprehensive monitoring of API usage, user behavior, and platform performance

      </div>

    </div>                <div className="flex items-center gap-2">              </p>

  );

}                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>            </div>

                  <span className="text-sm font-medium text-green-600">Operational</span>            <div className="flex items-center gap-4">

                </div>              <div className="text-right">

              </div>                <div className="text-sm text-muted-foreground">System Status</div>

            </div>                <div className="flex items-center gap-2">

          </div>                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>

        </div>                  <span className="text-sm font-medium text-green-600">Operational</span>

      </div>                </div>

              </div>

      {/* Main Content */}            </div>

      <div className="container mx-auto px-6 py-8">          </div>

        <Tabs defaultValue="api" className="space-y-8">        </div>

          <TabsList className="grid w-full grid-cols-2">      </div>

            <TabsTrigger value="api" className="flex items-center gap-2">

              🔢 API Analytics      {/* Main Content */}

            </TabsTrigger>      <div className="container mx-auto px-6 py-8">

            <TabsTrigger value="users" className="flex items-center gap-2">        <Tabs defaultValue="api" className="space-y-8">

              👥 User Analytics          <TabsList className="grid w-full grid-cols-2">

            </TabsTrigger>            <TabsTrigger value="api" className="flex items-center gap-2">

          </TabsList>              🔢 API Analytics

            </TabsTrigger>

          {/* API Analytics Tab */}            <TabsTrigger value="users" className="flex items-center gap-2">

          <TabsContent value="api" className="space-y-8">              👥 User Analytics

            {/* Test Token Counting System */}            </TabsTrigger>

            <TestTokenCountingButton />          </TabsList>



            {/* Real-time Metrics Overview */}          {/* API Analytics Tab */}

            <RealTimeMetrics />          <TabsContent value="api" className="space-y-8">

            {/* Test Token Counting System */}

            {/* Token Usage Overview Cards */}            <TestTokenCountingButton />

            <TokenUsageOverview />

            {/* Real-time Metrics Overview */}

            {/* Endpoint Breakdown Table */}            <RealTimeMetrics />

            <div className="bg-card rounded-lg border border-border">

              <div className="p-6 border-b border-border">            {/* Token Usage Overview Cards */}

                <h2 className="text-xl font-semibold text-foreground">            <TokenUsageOverview />

                  📊 Endpoint Token Breakdown

                </h2>            {/* Endpoint Breakdown Table */}

                <p className="text-muted-foreground mt-1">            <div className="bg-card rounded-lg border border-border">

                  Detailed analysis of token usage across all API endpoints and agent types              <div className="p-6 border-b border-border">

                </p>                <h2 className="text-xl font-semibold text-foreground">

              </div>                  📊 Endpoint Token Breakdown

              <EndpointBreakdown />                </h2>

            </div>                <p className="text-muted-foreground mt-1">

                  Detailed analysis of token usage across all API endpoints and agent types

            {/* Cost Analysis */}                </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">              </div>

              <CostAnalysis />              <EndpointBreakdown />

                          </div>

              {/* System Documentation */}

              <SystemDocumentation />            {/* Cost Analysis */}

            </div>            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          </TabsContent>              <CostAnalysis />

              

          {/* User Analytics Tab */}              {/* System Documentation */}

          <TabsContent value="users" className="space-y-8">              <SystemDocumentation />

            <UserAnalyticsDashboard />            </div>

          </TabsContent>          </TabsContent>

        </Tabs>

      </div>          {/* User Analytics Tab */}

    </div>          <TabsContent value="users" className="space-y-8">

  );            <UserAnalyticsDashboard />

}          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}