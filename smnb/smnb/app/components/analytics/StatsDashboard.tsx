// STATS DASHBOARD COMPONENT  
// /Users/matthewsimon/Projects/SMNB/smnb/components/analytics/StatsDashboard.tsx

'use client';

import { useStats } from '../providers/StatsProvider';
import { APIHealthCard } from './APIHealthCard';

export function StatsDashboard() {
  const {
    dashboardStats,
    isDashboardStatsLoading,
    postProcessingStats,
    isPostStatsLoading,
    pipelineHealth,
    isPipelineHealthLoading,
    apiHealthStatus,
    isAPIHealthLoading,
    apiHealthSummary,
    isAPIHealthSummaryLoading,
    systemEvents,
    isSystemEventsLoading,
    rateLimits,
    isRateLimitsLoading,
    createTestData,
    validateSystem,
    cleanupTestData,
    runAPIHealthCheck
  } = useStats();

  if (isDashboardStatsLoading || isPostStatsLoading || isPipelineHealthLoading || isAPIHealthLoading) {
    return (
      <div className="bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">📊 Live Analytics</h1>
            <p className="text-gray-400 mt-1 text-sm">SMNB processing pipeline metrics</p>
          </div>
          
          {/* Test Controls */}
          <div className="flex gap-2">
            <button
              onClick={runAPIHealthCheck}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              🔍 Check APIs
            </button>
            <button
              onClick={createTestData}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              🧪 Create Test Data
            </button>
            <button
              onClick={validateSystem}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              🔍 Validate System
            </button>
            <button
              onClick={cleanupTestData}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              🧹 Cleanup Test Data
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Posts Today"
            value={dashboardStats?.overview?.totalPosts || 0}
            change={0}
            icon="📝"
          />
          <MetricCard
            title="Processing Rate"
            value={`${dashboardStats?.overview?.avgProcessingTime || 0}ms`}
            change={0}
            icon="⚡"
          />
          <MetricCard
            title="Success Rate"
            value={`${dashboardStats?.overview?.processingEfficiency || 0}%`}
            change={0}
            icon="✅"
          />
          <MetricCard
            title="Publish Rate"
            value={`${dashboardStats?.overview?.publishRate || 0}/hr`}
            change={0}
            icon="📦"
          />
        </div>

        {/* Pipeline Health Status */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white mb-3">🚀 Pipeline Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pipelineHealth?.map((stage: any, index: number) => (
              <PipelineStageCard key={index} stage={stage} />
            ))}
          </div>
        </div>

        {/* API Health Status */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">🌐 API Health</h2>
            {!isAPIHealthSummaryLoading && apiHealthSummary && (
              <div className="text-sm text-gray-400">
                {apiHealthSummary.healthyEndpoints}/{apiHealthSummary.totalEndpoints} healthy • 
                Avg: {apiHealthSummary.averageResponseTime?.toFixed(0)}ms • 
                Uptime: {apiHealthSummary.averageUptime?.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isAPIHealthLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="animate-pulse text-gray-400">Loading API health status...</div>
              </div>
            ) : apiHealthStatus && apiHealthStatus.length > 0 ? (
              apiHealthStatus.map((endpoint: any, index: number) => (
                <APIHealthCard key={endpoint.endpoint || index} endpoint={endpoint} />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">🔍 No API health data available</div>
                  <button
                    onClick={runAPIHealthCheck}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                  >
                    Run Health Check
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* System Events */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-3">📋 Recent Events</h2>
            <div className="space-y-3">
              {isSystemEventsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : systemEvents?.length > 0 ? (
                systemEvents.slice(0, 10).map((event: any, index: number) => (
                  <EventItem key={index} event={event} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recent events</p>
              )}
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-3">🚦 Rate Limits</h2>
            <div className="space-y-3">
              {isRateLimitsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : rateLimits?.length > 0 ? (
                rateLimits.map((limit: any, index: number) => (
                  <RateLimitItem key={index} limit={limit} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No rate limit data</p>
              )}
            </div>
          </div>
        </div>

        {/* Processing Stats Table */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white mb-3">📈 Recent Post Processing</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Post ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Processing Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quality Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {postProcessingStats?.length > 0 ? (
                  postProcessingStats.slice(0, 20).map((stat: any, index: number) => (
                    <PostStatsRow key={index} stat={stat} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">No processing stats available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, change, icon }: { title: string; value: string | number; change: number; icon: string }) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {change !== 0 && (
        <div className="mt-2 flex items-center">
          <span className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
          }`}>
            {isPositive ? '↗️' : isNegative ? '↘️' : '➡️'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-400 ml-2">vs 24h ago</span>
        </div>
      )}
    </div>
  );
}

function PipelineStageCard({ stage }: { stage: any }) {
  const isHealthy = stage.status === 'healthy';
  const isUnhealthy = stage.status === 'unhealthy';
  const isInactive = stage.status === 'inactive';
  
  const getCardStyle = () => {
    if (isUnhealthy) return 'border-red-600 bg-red-900/20';
    if (isHealthy && stage.hasActivity) return 'border-green-600 bg-green-900/20';
    if (isHealthy && !stage.hasActivity) return 'border-blue-600 bg-blue-900/20';
    return 'border-gray-600 bg-gray-800'; // inactive
  };
  
  const getIcon = () => {
    if (isUnhealthy) return { icon: '❌', color: 'text-red-500', title: 'Unhealthy' };
    if (isHealthy && stage.hasActivity) return { icon: '✅', color: 'text-green-500', title: 'Active & Healthy' };
    if (isHealthy && !stage.hasActivity) return { icon: '💤', color: 'text-blue-500', title: 'Ready (Idle)' };
    return { icon: '⚪', color: 'text-gray-400', title: 'No recent data' };
  };
  
  const iconData = getIcon();
  
  return (
    <div className={`p-4 rounded-lg border-2 ${getCardStyle()}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-white capitalize">{stage.stage}</h3>
        <span className={`text-2xl ${iconData.color}`} title={iconData.title}>
          {iconData.icon}
        </span>
      </div>
      <div className="text-sm space-y-1">
        {/* Only show queue if it has items */}
        {stage.queue_depth > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Queue:</span>
            <span className="font-medium text-white">{stage.queue_depth}</span>
          </div>
        )}
        
        {/* Only show processing rate if active */}
        {stage.processing_rate > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Rate:</span>
            <span className="font-medium text-white">{stage.processing_rate.toFixed(1)}/s</span>
          </div>
        )}
        
        {/* Always show errors if > 0, or show "No errors" if healthy and active */}
        {stage.error_rate > 0 ? (
          <div className="flex justify-between">
            <span className="text-gray-600">Errors:</span>
            <span className="font-medium text-red-600">
              {(stage.error_rate * 100).toFixed(1)}%
            </span>
          </div>
        ) : isHealthy && (stage.processing_rate > 0 || stage.queue_depth > 0) ? (
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="font-medium text-green-400">Active</span>
          </div>
        ) : null}
        
        {/* Show last activity time if no current activity */}
        {stage.processing_rate === 0 && stage.queue_depth === 0 && stage.last_update > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Last seen:</span>
            <span className="font-medium text-gray-400 text-xs">
              {new Date(stage.last_update).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EventItem({ event }: { event: any }) {
  const severityColors = {
    critical: 'bg-red-900/20 text-red-300 border-red-800',
    error: 'bg-red-900/20 text-red-300 border-red-800',
    warning: 'bg-yellow-900/20 text-yellow-300 border-yellow-800',
    info: 'bg-blue-900/20 text-blue-300 border-blue-800'
  };
  
  const severityIcons = {
    critical: '🚨',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700">
      <span className="text-lg">{severityIcons[event.severity as keyof typeof severityIcons]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
            severityColors[event.severity as keyof typeof severityColors]
          }`}>
            {event.severity}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-gray-200 mt-1">{event.message}</p>
        {event.component && (
          <p className="text-xs text-gray-400 mt-1">Component: {event.component}</p>
        )}
      </div>
    </div>
  );
}

function RateLimitItem({ limit }: { limit: any }) {
  const usagePercent = ((limit.calls_made / (limit.calls_made + limit.calls_remaining)) * 100) || 0;
  const isHighUsage = usagePercent > 80;
  
  return (
    <div className="p-4 rounded-lg bg-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white capitalize">{limit.service}</span>
        <span className={`text-sm font-medium ${
          isHighUsage ? 'text-red-400' : 'text-green-400'
        }`}>
          {usagePercent.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isHighUsage ? 'bg-red-500' : 'bg-green-500'
          } ${usagePercent >= 100 ? 'w-full' : 
              usagePercent >= 75 ? 'w-3/4' : 
              usagePercent >= 50 ? 'w-1/2' : 
              usagePercent >= 25 ? 'w-1/4' : 'w-1/12'}`}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-300">
        <span>{limit.calls_made} used</span>
        <span>{limit.calls_remaining} remaining</span>
      </div>
      {limit.reset_at && (
        <p className="text-xs text-gray-400 mt-1">
          Resets: {new Date(limit.reset_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function PostStatsRow({ stat }: { stat: any }) {
  const sentimentColors = {
    positive: 'text-green-300 bg-green-900/20 border-green-800',
    neutral: 'text-gray-300 bg-gray-700/50 border-gray-600',
    negative: 'text-red-300 bg-red-900/20 border-red-800'
  };
  
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
        {stat.post_id.substring(0, 8)}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-300 border border-blue-800">
          {stat.processing_stage}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
        {stat.total_processing_time ? `${stat.total_processing_time}ms` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
        {stat.quality_score ? (stat.quality_score * 100).toFixed(0) + '%' : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {stat.sentiment && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
            sentimentColors[stat.sentiment as keyof typeof sentimentColors]
          }`}>
            {stat.sentiment}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
        {new Date(stat.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
}