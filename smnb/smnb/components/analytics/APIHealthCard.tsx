// API HEALTH CARD COMPONENT
// /Users/matthewsimon/Projects/SMNB/smnb/components/analytics/APIHealthCard.tsx

'use client';

interface APIHealthCardProps {
  endpoint: {
    endpoint: string;
    category: 'reddit' | 'claude' | 'internal' | 'external';
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    response_time: number;
    uptime: number;
    error_rate: number;
    last_error?: string;
    consecutive_failures: number;
    description?: string;
    last_check: number;
  };
}

export function APIHealthCard({ endpoint }: APIHealthCardProps) {
  const isHealthy = endpoint.status === 'healthy';
  const isDegraded = endpoint.status === 'degraded';
  const isUnhealthy = endpoint.status === 'unhealthy';
  const isUnknown = endpoint.status === 'unknown';
  
  const getCardStyle = () => {
    if (isUnhealthy) return 'border-red-600 bg-red-900/20';
    if (isDegraded) return 'border-yellow-600 bg-yellow-900/20';
    if (isHealthy) return 'border-green-600 bg-green-900/20';
    return 'border-gray-600 bg-gray-800'; // unknown
  };
  
  const getIcon = () => {
    if (isUnhealthy) return { icon: '❌', color: 'text-red-500', title: 'Unhealthy' };
    if (isDegraded) return { icon: '⚠️', color: 'text-yellow-500', title: 'Degraded Performance' };
    if (isHealthy) return { icon: '✅', color: 'text-green-500', title: 'Healthy' };
    return { icon: '❓', color: 'text-gray-400', title: 'Status Unknown' };
  };
  
  const getCategoryIcon = (category: string) => {
    const categoryIcons = {
      reddit: '🔴',
      claude: '🧠',
      internal: '⚙️',
      external: '🌐'
    };
    return categoryIcons[category as keyof typeof categoryIcons] || '🔗';
  };
  
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  const getResponseTimeColor = (ms: number) => {
    if (ms < 500) return 'text-green-400';
    if (ms < 2000) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const iconData = getIcon();
  const timeSinceLastCheck = Date.now() - endpoint.last_check;
  const isStale = timeSinceLastCheck > 5 * 60 * 1000; // 5 minutes
  
  return (
    <div className={`p-4 rounded-lg border-2 ${getCardStyle()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(endpoint.category)}</span>
          <h3 className="font-medium text-white text-sm">
            {endpoint.endpoint}
          </h3>
        </div>
        <span className={`text-2xl ${iconData.color}`} title={iconData.title}>
          {iconData.icon}
        </span>
      </div>
      
      {/* Description */}
      {endpoint.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {endpoint.description}
        </p>
      )}
      
      {/* Metrics */}
      <div className="text-sm space-y-2">
        {/* Response Time */}
        <div className="flex justify-between">
          <span className="text-gray-400">Response:</span>
          <span className={`font-medium ${getResponseTimeColor(endpoint.response_time)}`}>
            {formatResponseTime(endpoint.response_time)}
          </span>
        </div>
        
        {/* Uptime */}
        <div className="flex justify-between">
          <span className="text-gray-400">Uptime:</span>
          <span className={`font-medium ${
            endpoint.uptime >= 99 ? 'text-green-400' : 
            endpoint.uptime >= 95 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {endpoint.uptime.toFixed(1)}%
          </span>
        </div>
        
        {/* Error Rate (only show if > 0 or if unhealthy) */}
        {(endpoint.error_rate > 0 || isUnhealthy) && (
          <div className="flex justify-between">
            <span className="text-gray-400">Errors:</span>
            <span className={`font-medium ${
              endpoint.error_rate === 0 ? 'text-green-400' :
              endpoint.error_rate < 5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {endpoint.error_rate.toFixed(1)}%
            </span>
          </div>
        )}
        
        {/* Consecutive Failures (only show if > 0) */}
        {endpoint.consecutive_failures > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Failures:</span>
            <span className="font-medium text-red-400">
              {endpoint.consecutive_failures} consecutive
            </span>
          </div>
        )}
        
        {/* Last Error (only if there is one) */}
        {endpoint.last_error && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded">
            <div className="text-xs text-red-300">
              <div className="font-medium">Last Error:</div>
              <div className="mt-1 break-words">
                {endpoint.last_error}
              </div>
            </div>
          </div>
        )}
        
        {/* Last Check Time */}
        <div className="flex justify-between pt-1 border-t border-gray-600">
          <span className="text-gray-400 text-xs">Last check:</span>
          <span className={`text-xs font-medium ${isStale ? 'text-yellow-400' : 'text-gray-300'}`}>
            {endpoint.last_check > 0 
              ? new Date(endpoint.last_check).toLocaleTimeString()
              : 'Never'
            }
          </span>
        </div>
        
        {/* Stale Warning */}
        {isStale && endpoint.last_check > 0 && (
          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-800 rounded">
            <div className="text-xs text-yellow-300">
              ⚠️ Data may be stale ({Math.floor(timeSinceLastCheck / (60 * 1000))}m ago)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}