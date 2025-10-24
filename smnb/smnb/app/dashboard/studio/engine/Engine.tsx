// ENGINE DASHBOARD
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/app/dashboard/studio/engine/Engine.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DatabaseZap, Activity, TrendingUp, Zap, Clock, Play } from "lucide-react";

interface EngineProps {
  isActive?: boolean;
}

export default function Engine({ isActive = true }: EngineProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<string | null>(null);
  
  // Only run queries when this panel is active to avoid TooManyConcurrentRequests
  const health = useQuery(api.engine.queries.getEngineHealth, isActive ? {} : "skip");
  const globalMetrics = useQuery(api.engine.queries.getMetrics, isActive ? {
    dim_kind: "global",
    window: "15m",
    bucket_count: 4, // Last hour of 15m buckets
  } : "skip");
  
  const setupEngine = useAction(api.engine.setup.setupEngine);
  
  const handleInitialize = async () => {
    setIsInitializing(true);
    setInitResult(null);
    try {
      const result = await setupEngine({});
      setInitResult(`✅ ${result.message}`);
    } catch (error) {
      setInitResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-6 border-b border-[#2d2d2d] bg-[#181818]">
        <div className="flex items-center gap-3">
          <DatabaseZap className="w-5 h-5 text-[#007acc]" />
          <h1 className="text-lg font-semibold text-[#cccccc]">Engine Metrics</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#858585]">
          <Activity className="w-3 h-3" />
          <span>Real-time Computation Engine</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Health Status Card */}
        <div className={`
          p-6 rounded-lg border mb-6
          ${health?.status === 'healthy' 
            ? 'bg-green-950/20 border-green-700/50' 
            : health?.status === 'degraded'
            ? 'bg-yellow-950/20 border-yellow-700/50'
            : 'bg-red-950/20 border-red-700/50'
          }
        `}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#cccccc] flex items-center gap-2">
              <Zap className="w-5 h-5" />
              System Health
            </h2>
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium uppercase
              ${health?.status === 'healthy' 
                ? 'bg-green-700 text-green-100' 
                : health?.status === 'degraded'
                ? 'bg-yellow-700 text-yellow-100'
                : 'bg-red-700 text-red-100'
              }
            `}>
              {health?.status || 'Unknown'}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[#858585] mb-1">Processing Lag</div>
              <div className="text-[#cccccc] font-semibold">
                {health?.lag_ms !== undefined ? `${health.lag_ms}ms` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[#858585] mb-1">Events Pending</div>
              <div className="text-[#cccccc] font-semibold">
                {health?.events_pending !== undefined ? health.events_pending : '—'}
              </div>
            </div>
            <div>
              <div className="text-[#858585] mb-1">Last Run</div>
              <div className="text-[#cccccc] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {health?.last_run_at 
                  ? new Date(health.last_run_at).toLocaleTimeString()
                  : '—'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* RC - Relevance Consistency */}
          <MetricCard
            title="RC"
            subtitle="Relevance Consistency"
            value={globalMetrics?.metrics.rc_percent !== undefined 
              ? `${globalMetrics.metrics.rc_percent.toFixed(1)}%`
              : '—'
            }
            description="Theme alignment percentage"
            color="blue"
            icon={<TrendingUp className="w-4 h-4" />}
          />

          {/* NI - Novelty Index */}
          <MetricCard
            title="NI"
            subtitle="Novelty Index"
            value={globalMetrics?.metrics.ni_count !== undefined 
              ? globalMetrics.metrics.ni_count.toString()
              : '—'
            }
            description="Unique concepts discovered"
            color="purple"
            icon={<Zap className="w-4 h-4" />}
          />

          {/* TP - Trend Propagation */}
          <MetricCard
            title="TP"
            subtitle="Trend Propagation"
            value={globalMetrics?.metrics.tp_percent !== undefined 
              ? `${globalMetrics.metrics.tp_percent.toFixed(1)}%`
              : '—'
            }
            description="Cross-post story rate"
            color="green"
            icon={<Activity className="w-4 h-4" />}
          />

          {/* CM - Conversion Momentum */}
          <MetricCard
            title="CM"
            subtitle="Conversion Momentum"
            value={globalMetrics?.metrics.cm_percent !== undefined 
              ? `${globalMetrics.metrics.cm_percent > 0 ? '+' : ''}${globalMetrics.metrics.cm_percent.toFixed(1)}%`
              : '—'
            }
            description="Story yield change rate"
            color={globalMetrics?.metrics.cm_percent !== undefined && globalMetrics.metrics.cm_percent > 0 ? 'green' : 'red'}
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>

        {/* Timeseries Data */}
        {globalMetrics?.timeseries && globalMetrics.timeseries.length > 0 && (
          <div className="p-6 rounded-lg border border-[#2d2d2d] bg-[#252525]">
            <h2 className="text-lg font-semibold text-[#cccccc] mb-4">Timeline</h2>
            <div className="space-y-2">
              {globalMetrics.timeseries.map((bucket, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded bg-[#1e1e1e] border border-[#2d2d2d]"
                >
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#858585] font-mono">
                      {new Date(bucket.t).toLocaleTimeString()}
                    </span>
                    <span className="text-[#cccccc]">
                      RC: {bucket.rc_percent.toFixed(1)}%
                    </span>
                    <span className="text-[#cccccc]">
                      NI: {bucket.ni_count}
                    </span>
                    <span className="text-[#cccccc]">
                      TP: {bucket.tp_percent.toFixed(1)}%
                    </span>
                    <span className="text-[#cccccc]">
                      CM: {bucket.cm_percent > 0 ? '+' : ''}{bucket.cm_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-[#858585]">
                    Yield: {bucket.story_yield.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!globalMetrics && !health && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <DatabaseZap className="w-12 h-12 text-[#858585] mx-auto mb-4" />
              <p className="text-[#858585] text-sm">Loading Engine metrics...</p>
            </div>
          </div>
        )}

        {/* Initialization Required State */}
        {health?.status === 'error' && health?.error_message === 'Event applier not initialized' && (
          <div className="mt-6 p-6 rounded-lg border border-yellow-700/50 bg-yellow-950/20">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Engine Not Initialized
            </h3>
            <p className="text-[#cccccc] text-sm mb-4">
              The Engine processing loop needs to be started. Click the button below to initialize:
            </p>
            <button
              onClick={handleInitialize}
              disabled={isInitializing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded-md flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              {isInitializing ? 'Initializing...' : 'Initialize Engine'}
            </button>
            {initResult && (
              <div className={`mt-4 p-3 rounded text-sm ${
                initResult.startsWith('✅') 
                  ? 'bg-green-950/30 text-green-400 border border-green-700/50' 
                  : 'bg-red-950/30 text-red-400 border border-red-700/50'
              }`}>
                {initResult}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'red';
  icon: React.ReactNode;
}

function MetricCard({ title, subtitle, value, description, color, icon }: MetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-700/50 bg-blue-950/20',
    purple: 'border-purple-700/50 bg-purple-950/20',
    green: 'border-green-700/50 bg-green-950/20',
    red: 'border-red-700/50 bg-red-950/20',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    red: 'text-red-400',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-[#cccccc] mb-1">{title}</div>
          <div className="text-xs text-[#858585] uppercase tracking-wide">{subtitle}</div>
        </div>
        <div className={iconColorClasses[color]}>
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold text-[#cccccc] mb-2">{value}</div>
      <div className="text-xs text-[#858585]">{description}</div>
    </div>
  );
}
