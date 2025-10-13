# Whistleblower Agent - System Health Monitor

## Overview

The **Whistleblower Agent** is a comprehensive system health monitoring and backpressure control service designed to prevent system overload and ensure smooth operation of the SMNB pipeline.

### Problem Statement

Before the Whistleblower, the system experienced:
- **Queue Backups**: 143+ items stuck in host queue
- **Stuck Narrations**: Single narration processing for 30+ minutes
- **API Rate Limiting**: Reddit circuit breaker constantly triggered (503 errors)
- **Duplicate Processing**: Same content analyzed multiple times
- **No Backpressure**: Pipeline continuously ingested despite backlog

### Solution

The Whistleblower Agent provides:
- **Real-time Monitoring**: Tracks queue depth, narration age, API errors, memory usage
- **Automatic Backpressure**: Pauses ingestion/publishing when thresholds exceeded
- **Health Reporting**: 4-level alert system (HEALTHY → WARNING → CRITICAL → EMERGENCY)
- **Auto-Recovery**: System resumes when metrics improve
- **Browser Console Dashboard**: Debug utilities for live monitoring

---

## Architecture

### Core Components

1. **WhistleblowerAgent** (`lib/services/monitoring/whistleblowerAgent.ts`)
   - EventEmitter-based singleton
   - 5-second health check interval
   - Tracks metrics from host queue, pipeline, API, and memory
   
2. **Console Dashboard** (`lib/utils/whistleblowerConsole.ts`)
   - Browser console interface: `whistleblower.status()`, `.history()`, `.check()`, `.reset()`
   - Provides real-time visibility into system health

3. **Integration Points**
   - **Host Agent Service**: Queue monitoring, stuck narration detection, backpressure enforcement
   - **Enhanced Processing Pipeline**: Ingestion pausing, publishing pausing, error reporting
   - **Root Layout**: Automatic initialization on app load

---

## Health Status Levels

### 1. HEALTHY ✅
- All metrics within normal ranges
- No action required
- System operates at full capacity

### 2. WARNING ⚠️
- Queue length > 20 items → **Pause publishing**
- Narration stuck for > 60 seconds → **Clear stuck item**
- Backpressure activates automatically

### 3. CRITICAL 🔴
- Queue length > 40 items → **Stop ingestion**
- High error rate (5+ errors/min)
- Memory usage > 85%
- Full backpressure activated

### 4. EMERGENCY 🚨
- Severe system overload
- Emergency shutdown triggered
- Requires manual intervention

---

## Thresholds & Backpressure

### Queue Management
```typescript
{
  length: 0,           // Current queue size
  oldestItemAge: 0     // Age of oldest item in ms
}

Thresholds:
- 20 items: Pause publishing (WARNING)
- 40 items: Stop ingestion (CRITICAL)
- 60s stuck: Clear narration
```

### API Error Handling
```typescript
{
  redditErrors: 0,     // Reddit API failures
  claudeErrors: 0,     // Claude API failures
  rateLimitHits: 0     // Rate limit errors
}

Thresholds:
- 5 errors/min: Activate backpressure
- 10 errors/min: Stop ingestion
```

### Memory Monitoring
```typescript
{
  usagePercent: 0      // Heap usage percentage
}

Thresholds:
- 85%: WARNING
- 95%: CRITICAL
```

---

## Integration Examples

### Host Agent Service

```typescript
import { whistleblower } from '../monitoring/whistleblowerAgent';

// Report queue metrics
whistleblower.reportMetric('hostQueue', 'length', queue.length);

// Check backpressure before processing
if (whistleblower.isBackpressureActive()) {
  console.log('⏸️ Backpressure active, rejecting new item');
  return;
}

// Detect stuck narrations
const narrationAge = Date.now() - narration.timestamp.getTime();
whistleblower.reportMetric('hostQueue', 'currentNarrationAge', narrationAge);

// Auto-clear if stuck > 2 minutes
if (narrationAge > 120000) {
  console.log('🚨 Clearing stuck narration');
  currentNarration = null;
}
```

### Enhanced Processing Pipeline

```typescript
import { whistleblower } from '../monitoring/whistleblowerAgent';

// Listen for backpressure events in constructor
whistleblower.on('backpressure:activated', (level) => {
  if (level === 'WARNING') this.pausePublishing = true;
  if (level === 'CRITICAL') this.pauseIngestion = true;
});

whistleblower.on('backpressure:deactivated', () => {
  this.pauseIngestion = false;
  this.pausePublishing = false;
});

// Check before ingesting
if (this.pauseIngestion) {
  console.log('⏸️ Skipping ingestion due to backpressure');
  return;
}

// Report errors
catch (error) {
  whistleblower.reportError('reddit', error);
}
```

---

## Browser Console Usage

### Available Commands

```javascript
// View current system health
whistleblower.status()
// Output:
// 🚨 === WHISTLEBLOWER STATUS === 🚨
// Health: HEALTHY
// Metrics:
//   Host Queue Length: 3
//   Oldest Item Age: 12s
//   Scheduled Posts: 8
//   Reddit Errors: 0
//   Claude Errors: 0

// View health history (last 20 checks)
whistleblower.history()
// Output: Table with time, status, queue length, issues, errors

// Trigger immediate health check
whistleblower.check()
// Output: ✅ Status: HEALTHY / No issues detected

// Reset all metrics (requires confirmation)
whistleblower.reset()
// Output: ⚠️ Confirmation dialog → ✅ Metrics reset

// Show help
whistleblower.help()
// Output: Full command reference and tips
```

### Example Output

```
🚨 === WHISTLEBLOWER STATUS === 🚨
Health: WARNING
Timestamp: 1/15/2025, 10:23:45 AM

📊 Metrics:
┌───────────────────────────┬────────┐
│ Host Queue Length         │ 25     │
│ Oldest Item Age (s)       │ 45     │
│ Scheduled Posts           │ 12     │
│ Reddit Errors             │ 2      │
│ Claude Errors             │ 0      │
│ Rate Limit Hits           │ 1      │
│ Memory Usage (%)          │ 62.3   │
└───────────────────────────┴────────┘

⚠️ Issues:
  1. Host queue length (25) exceeds warning threshold (20)
  2. API errors detected (2 in last minute)

💡 Recommendations:
  1. Publishing has been paused to allow queue to drain
  2. Monitoring API error rate - may slow ingestion if continues

🛑 Backpressure Active: true
```

---

## Event API

### Emitted Events

```typescript
// Backpressure activated
whistleblower.on('backpressure:activated', (level: HealthStatus) => {
  console.log(`Backpressure at ${level} level`);
});

// Backpressure deactivated
whistleblower.on('backpressure:deactivated', () => {
  console.log('System recovered, resuming normal operation');
});

// Emergency shutdown
whistleblower.on('emergency:shutdown', () => {
  console.error('EMERGENCY SHUTDOWN TRIGGERED');
  // Stop all processing
});

// Health check completed
whistleblower.on('health:check', (report: HealthReport) => {
  console.log('Health check:', report.status);
});
```

---

## Metrics API

### Update Metrics

```typescript
// Full metrics update
whistleblower.updateMetrics({
  hostQueue: { length: 15, oldestItemAge: 30000 },
  pipeline: { scheduledPosts: 8, publishRate: 2, lastIngestionTime: Date.now() },
  api: { redditErrors: 1, claudeErrors: 0, rateLimitHits: 0 },
  memory: { usagePercent: 65.2 }
});

// Single metric update (convenience method)
whistleblower.reportMetric('hostQueue', 'length', 15);
whistleblower.reportMetric('pipeline', 'scheduledPosts', 8);
whistleblower.reportMetric('api', 'redditErrors', 1);
```

### Report Errors

```typescript
// Report API error (auto-increments error count)
whistleblower.reportError('reddit', new Error('503 Service Unavailable'));
whistleblower.reportError('claude', new Error('429 Rate Limit'));

// Triggers immediate health check
```

---

## Monitoring & Control

### Start/Stop Monitoring

```typescript
// Start with 5-second check interval
whistleblower.startMonitoring(5000);

// Stop monitoring
whistleblower.stopMonitoring();

// Check current status
const status = whistleblower.getCurrentStatus();
console.log('Current health:', status.status);
console.log('Issues:', status.issues);
console.log('Recommendations:', status.recommendations);
```

### Manual Health Check

```typescript
// Trigger immediate check (outside regular interval)
const report = whistleblower.checkNow();

if (report.status === 'critical') {
  console.log('System in critical state:', report.issues);
}
```

### Query Status

```typescript
// Check if backpressure is active
if (whistleblower.isBackpressureActive()) {
  console.log('Backpressure active, slowing operations');
}

// Get history
const history = whistleblower.getHistory();
console.log('Last 10 checks:', history.slice(-10));

// Reset all metrics
whistleblower.reset();
```

---

## Best Practices

### 1. Regular Metrics Reporting
- Report queue metrics on every process cycle
- Report API errors immediately when they occur
- Update pipeline metrics before publishing

### 2. Respect Backpressure
- Always check `isBackpressureActive()` before heavy operations
- Listen for `backpressure:activated` events
- Stop ingestion when `CRITICAL` level reached

### 3. Monitor Console Dashboard
- Run `whistleblower.status()` when debugging issues
- Use `whistleblower.history()` to identify trends
- Check `whistleblower.help()` for command reference

### 4. Threshold Tuning
- Adjust thresholds in `whistleblowerAgent.ts` based on system capacity
- Current settings: 20/40 queue size, 60s stuck timeout, 5 errors/min

### 5. Testing
- Use `whistleblower.check()` to trigger immediate health checks
- Simulate load to verify backpressure mechanisms
- Monitor recovery after backpressure deactivates

---

## Troubleshooting

### Queue Not Draining
```bash
# Check current status
whistleblower.status()

# Look for:
# - Host Queue Length > 20: Publishing paused
# - Oldest Item Age > 60s: Stuck narration being cleared
# - Backpressure Active: true

# Wait for auto-recovery or manually reset
whistleblower.reset()
```

### High Error Rate
```bash
# Check error counts
whistleblower.status()

# Look for:
# - Reddit Errors: API failures
# - Rate Limit Hits: 429 responses
# - Backpressure Active: Slowing ingestion

# System will auto-recover when error rate decreases
```

### Memory Issues
```bash
# Check memory usage
whistleblower.status()

# If Memory Usage > 85%:
# - Backpressure activated
# - Consider reducing max queue size
# - Check for memory leaks
```

---

## Configuration

### Thresholds (in `whistleblowerAgent.ts`)

```typescript
private thresholds: HealthThresholds = {
  hostQueue: {
    maxLength: 20,           // WARNING: pause publishing
    criticalLength: 40,      // CRITICAL: stop ingestion
    stuckTimeout: 60000      // 60s: clear stuck narration
  },
  api: {
    maxErrorsPerMinute: 5,   // WARNING: activate backpressure
    criticalErrors: 10       // CRITICAL: full stop
  },
  memory: {
    warningPercent: 85,      // WARNING: monitor closely
    criticalPercent: 95      // CRITICAL: emergency measures
  }
};
```

### Check Interval

```typescript
// Default: 5 seconds
whistleblower.startMonitoring(5000);

// More aggressive: 2 seconds
whistleblower.startMonitoring(2000);

// Less frequent: 10 seconds
whistleblower.startMonitoring(10000);
```

---

## Future Enhancements

### Planned Features
- [ ] Persistent metrics storage (time-series database)
- [ ] Grafana/Datadog integration
- [ ] Email/Slack alerts for CRITICAL/EMERGENCY states
- [ ] Advanced anomaly detection (ML-based)
- [ ] Auto-scaling recommendations
- [ ] Historical trend analysis
- [ ] Performance profiling integration

### Optimization Opportunities
- [ ] Adaptive threshold tuning based on system load
- [ ] Predictive backpressure (anticipate overload)
- [ ] Multi-level backpressure (gradual slowdown)
- [ ] Component-specific health scores
- [ ] Recovery time optimization

---

## License

Part of the SMNB project. See main project LICENSE file.

---

## Support

For issues or questions:
1. Check `whistleblower.help()` in browser console
2. Review logs for health check reports
3. Inspect `whistleblower.history()` for trends
4. Open GitHub issue with status output

---

**Last Updated:** January 15, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
