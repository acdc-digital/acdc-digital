/**
 * ENGINE - Utility Functions
 * 
 * Helper functions for time window calculations, formatting, and conversions.
 */

/**
 * Round timestamp to window start
 */
export function roundToWindow(
  timestamp: number,
  window: "1m" | "5m" | "15m" | "60m"
): number {
  const windowMs = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "60m": 60 * 60 * 1000,
  };
  const ms = windowMs[window];
  return Math.floor(timestamp / ms) * ms;
}

/**
 * Get window duration in milliseconds
 */
export function getWindowMs(window: "1m" | "5m" | "15m" | "60m"): number {
  const windowMs = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "60m": 60 * 60 * 1000,
  };
  return windowMs[window];
}

/**
 * Hash dimension key for fast lookups
 */
export function hashDimension(dim_kind: string, dim_value?: string): string {
  return `${dim_kind}:${dim_value || ""}`;
}

/**
 * Format metric as percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format metric as count
 */
export function formatCount(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Get human-readable window name
 */
export function getWindowLabel(window: "1m" | "5m" | "15m" | "60m"): string {
  const labels = {
    "1m": "1 Minute",
    "5m": "5 Minutes",
    "15m": "15 Minutes",
    "60m": "1 Hour",
  };
  return labels[window];
}

/**
 * Calculate time range for N buckets
 */
export function getTimeRange(
  window: "1m" | "5m" | "15m" | "60m",
  bucketCount: number
): { start: number; end: number } {
  const now = Date.now();
  const windowMs = getWindowMs(window);
  const end = roundToWindow(now, window);
  const start = end - (bucketCount * windowMs);
  return { start, end };
}
