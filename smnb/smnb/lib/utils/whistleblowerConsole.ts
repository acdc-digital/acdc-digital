/**
 * Browser console utilities for Whistleblower monitoring
 * 
 * Provides a convenient dashboard interface in the browser console
 * for monitoring system health and controlling backpressure.
 * 
 * Usage in console:
 *   whistleblower.status()    - View current metrics
 *   whistleblower.history()   - View health history
 *   whistleblower.check()     - Trigger health check
 *   whistleblower.reset()     - Reset metrics
 */

import { WhistleblowerAgent } from '../services/monitoring/whistleblowerAgent';

interface WhistleblowerDashboard {
  status(): void;
  history(): void;
  check(): void;
  reset(): void;
  help(): void;
}

/**
 * Initialize Whistleblower console dashboard
 */
export function initWhistleblowerConsole(agent: WhistleblowerAgent): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Store agent reference globally
  window.__whistleblower = agent;

  // Create console dashboard
  const dashboard: WhistleblowerDashboard = {
    status: () => {
      const wb = window.__whistleblower;
      if (!wb) {
        console.log('❌ Whistleblower not initialized');
        return;
      }
      
      const status = wb.getCurrentStatus();
      if (!status) {
        console.log('⚠️ No status available yet');
        return;
      }
      
      console.log('\n🚨 === WHISTLEBLOWER STATUS === 🚨\n');
      console.log(`Health: ${status.status.toUpperCase()}`);
      console.log(`Timestamp: ${new Date(status.timestamp).toLocaleString()}\n`);
      
      console.log('📊 Metrics:');
      console.table({
        'Host Queue Length': status.metrics.hostQueue.length,
        'Oldest Item Age (s)': Math.round(status.metrics.hostQueue.oldestItemAge / 1000),
        'Scheduled Posts': status.metrics.pipeline.scheduledPosts,
        'Reddit Errors': status.metrics.api.redditErrors,
        'Claude Errors': status.metrics.api.claudeErrors,
        'Rate Limit Hits': status.metrics.api.rateLimitHits,
        'Memory Usage (%)': status.metrics.memory.usagePercent.toFixed(1)
      });
      
      if (status.issues.length > 0) {
        console.log('\n⚠️ Issues:');
        status.issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
      }
      
      if (status.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        status.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
      }
      
      console.log('\n🛑 Backpressure Active:', wb.isBackpressureActive());
      console.log('\n');
    },
    
    history: () => {
      const wb = window.__whistleblower;
      const history = wb?.getHistory() || [];
      
      if (history.length === 0) {
        console.log('⚠️ No history available yet');
        return;
      }
      
      console.log('\n📜 === HEALTH HISTORY === 📜\n');
      console.table(history.slice(-20).map(h => ({
        Time: new Date(h.timestamp).toLocaleTimeString(),
        Status: h.status,
        'Queue Length': h.metrics.hostQueue.length,
        'Issues': h.issues.length,
        'Errors': h.metrics.api.redditErrors + h.metrics.api.claudeErrors
      })));
      console.log('\n');
    },
    
    check: () => {
      const wb = window.__whistleblower;
      if (!wb) {
        console.log('❌ Whistleblower not initialized');
        return;
      }
      
      console.log('🔍 Triggering health check...');
      const report = wb.checkNow();
      console.log(`\n${report.status === 'healthy' ? '✅' : '⚠️'} Status: ${report.status.toUpperCase()}`);
      
      if (report.issues.length > 0) {
        console.log('Issues found:', report.issues);
      } else {
        console.log('No issues detected');
      }
      console.log('\n');
    },
    
    reset: () => {
      const wb = window.__whistleblower;
      if (!wb) {
        console.log('❌ Whistleblower not initialized');
        return;
      }
      
      const confirmed = confirm('⚠️ Are you sure you want to reset all metrics? This will clear all history.');
      if (confirmed) {
        wb.reset();
        console.log('✅ Whistleblower metrics reset\n');
      }
    },
    
    help: () => {
      console.log(`
🚨 === WHISTLEBLOWER DASHBOARD === 🚨

Available Commands:
  whistleblower.status()    - View current health metrics
  whistleblower.history()   - View health history (last 20 checks)
  whistleblower.check()     - Trigger immediate health check
  whistleblower.reset()     - Reset all metrics (requires confirmation)
  whistleblower.help()      - Show this help message

Health Status Levels:
  ✅ HEALTHY    - All systems normal
  ⚠️ WARNING    - Minor issues detected
  🔴 CRITICAL   - Major problems, backpressure activated
  🚨 EMERGENCY  - System overload, emergency shutdown

Backpressure Mechanisms:
  • Pauses publishing when queue > 20 items
  • Stops ingestion when queue > 40 items
  • Clears stuck narrations after 60 seconds
  • Reduces API calls during high error rates

Tips:
  • Run whistleblower.status() regularly to monitor health
  • Check whistleblower.history() to see trends over time
  • System will automatically recover when metrics improve
      `);
    }
  };

  // Attach to window
  window.whistleblower = dashboard;

  // Welcome message
  console.log(`
%c🚨 WHISTLEBLOWER AGENT ACTIVE 🚨
%cSystem health monitoring enabled
Type %cwhistleblower.help()%c for available commands
  `,
    'color: #ff6b6b; font-weight: bold; font-size: 16px',
    'color: #4ecdc4; font-size: 12px',
    'color: #ffe66d; font-weight: bold; font-size: 12px',
    'color: #4ecdc4; font-size: 12px'
  );
}
