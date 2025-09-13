// STATS PAGE WITH CONVEX INTEGRATION
// /Users/matthewsimon/Projects/SMNB/smnb/app/stats/page.tsx

"use client";

import React, { useState } from 'react';
import { StatsProvider } from '@/components/providers/StatsProvider';
import { StatsDashboard } from '@/components/analytics/StatsDashboard';
import { UserAnalyticsDashboard } from '@/components/analytics/UserAnalyticsDashboard';

// Main Stats Page Component - Now includes both Pipeline and User Analytics
export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  return (
    <StatsProvider timeRange={timeRange}>
      <div className="min-h-screen bg-gray-900">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-6 py-4 backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                📊 Comprehensive Analytics Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Complete insights into pipeline performance, API usage, and user behavior
              </p>
            </div>
            
            <div className="flex gap-1 bg-gray-700 p-1 rounded-md">
              {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`
                    px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer
                    ${timeRange === range 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }
                  `}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable with two sections */}
        <div className="px-6 py-8 space-y-12 max-h-screen overflow-y-auto">
          
          {/* Section 1: Pipeline Analytics */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">🔧 Pipeline & Processing Analytics</h2>
                <p className="text-gray-400 text-sm">
                  Real-time monitoring of Reddit data processing, agent performance, and system metrics
                </p>
              </div>
            </div>
            
            {/* Pipeline Stats Dashboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <StatsDashboard />
            </div>
          </section>

          {/* Section 2: User Analytics */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">👥 User Analytics & Behavior</h2>
                <p className="text-gray-400 text-sm">
                  Comprehensive insights into user engagement, journeys, and platform interactions
                </p>
              </div>
            </div>
            
            {/* User Analytics Dashboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <UserAnalyticsDashboard />
            </div>
          </section>

        </div>
      </div>
    </StatsProvider>
  );
}