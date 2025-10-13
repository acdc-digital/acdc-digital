/**
 * Whistleblower Agent - System Health Monitor & Backpressure Controller
 * 
 * Monitors system health and automatically triggers backpressure mechanisms
 * when thresholds are exceeded. Acts as the "canary in the coal mine" for
 * system overload conditions.
 * 
 * @module WhistleblowerAgent
 */

import { EventEmitter } from 'events';

export interface SystemMetrics {
  hostQueue: {
    length: number;
    oldestItemAge: number;
    processingRate: number; // items/minute
    stuckNarrationId?: string;
  };
  pipeline: {
    scheduledPosts: number;
    publishRate: number; // posts/minute
    lastIngestionTime: number;
  };
  api: {
    redditErrors: number;
    claudeErrors: number;
    rateLimitHits: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    usagePercent: number;
  };
}

export interface HealthThresholds {
  hostQueueMax: number;
  hostQueueStuckTimeout: number;
  publishRateMax: number;
  errorRateMax: number;
  memoryMax: number;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export interface HealthReport {
  status: HealthStatus;
  issues: string[];
  recommendations: string[];
  metrics: SystemMetrics;
  timestamp: number;
}

export interface BackpressureRestrictions {
  pauseIngestion: boolean;
  pausePublishing: boolean;
  reduceApiCalls: boolean;
  clearNonEssentialCaches: boolean;
}

/**
 * Whistleblower Agent - System Health Monitor & Backpressure Controller
 * 
 * Monitors system health and automatically triggers backpressure mechanisms
 * when thresholds are exceeded. Acts as the "canary in the coal mine" for
 * system overload conditions.
 */
export class WhistleblowerAgent extends EventEmitter {
  private static instance: WhistleblowerAgent | null = null;
  
  private metrics: SystemMetrics = {
    hostQueue: {
      length: 0,
      oldestItemAge: 0,
      processingRate: 0
    },
    pipeline: {
      scheduledPosts: 0,
      publishRate: 0,
      lastIngestionTime: Date.now()
    },
    api: {
      redditErrors: 0,
      claudeErrors: 0,
      rateLimitHits: 0
    },
    memory: {
      heapUsed: 0,
      heapTotal: 0,
      usagePercent: 0
    }
  };

  private thresholds: HealthThresholds = {
    hostQueueMax: 20,           // Max items in queue
    hostQueueStuckTimeout: 60000, // 1 minute
    publishRateMax: 10,          // Max posts/minute
    errorRateMax: 5,             // Max errors/minute
    memoryMax: 85                // Max memory usage %
  };

  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsHistory: HealthReport[] = [];
  private backpressureActive = false;
  private emergencyShutdownActive = false;

  private constructor() {
    super();
    console.log('🚨 Whistleblower Agent initialized - monitoring system health');
  }

  static getInstance(): WhistleblowerAgent {
    if (!WhistleblowerAgent.instance) {
      WhistleblowerAgent.instance = new WhistleblowerAgent();
    }
    return WhistleblowerAgent.instance;
  }

  /**
   * Start monitoring system health
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.monitoringInterval) {
      console.log('⚠️ Monitoring already active');
      return;
    }

    console.log(`🚨 Starting health monitoring (interval: ${intervalMs}ms)`);
    
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    // Perform initial check
    this.performHealthCheck();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🚨 Health monitoring stopped');
    }
  }

  /**
   * Update metrics from various system components
   */
  updateMetrics(updates: Partial<SystemMetrics>): void {
    // Deep merge the updates
    if (updates.hostQueue) {
      this.metrics.hostQueue = { ...this.metrics.hostQueue, ...updates.hostQueue };
    }
    if (updates.pipeline) {
      this.metrics.pipeline = { ...this.metrics.pipeline, ...updates.pipeline };
    }
    if (updates.api) {
      this.metrics.api = { ...this.metrics.api, ...updates.api };
    }
    if (updates.memory) {
      this.metrics.memory = { ...this.metrics.memory, ...updates.memory };
    }
  }

  /**
   * Report a specific metric (convenience method)
   */
  reportMetric(category: 'hostQueue' | 'pipeline' | 'api', metric: string, value: number): void {
    if (category === 'hostQueue') {
      if (metric === 'length') this.metrics.hostQueue.length = value;
      else if (metric === 'currentNarrationAge') this.metrics.hostQueue.oldestItemAge = value;
    } else if (category === 'pipeline') {
      if (metric === 'scheduledPosts') this.metrics.pipeline.scheduledPosts = value;
      else if (metric === 'publishRate') this.metrics.pipeline.publishRate = value;
    } else if (category === 'api') {
      if (metric === 'redditErrors') this.metrics.api.redditErrors += value;
      else if (metric === 'claudeErrors') this.metrics.api.claudeErrors += value;
    }
  }

  /**
   * Report an error from a component
   */
  reportError(component: 'reddit' | 'claude' | 'general', error: Error): void {
    if (component === 'reddit') {
      this.metrics.api.redditErrors++;
    } else if (component === 'claude') {
      this.metrics.api.claudeErrors++;
    }
    
    // Check if rate limit error
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      this.metrics.api.rateLimitHits++;
    }

    // Immediate check after error
    this.performHealthCheck();
  }

  /**
   * Perform comprehensive health check
   */
  private performHealthCheck(): void {
    // Memory (browser-only)
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      const used = memory.usedJSHeapSize;
      const limit = memory.jsHeapSizeLimit;
      this.metrics.memory.usagePercent = (used / limit) * 100;
    }

    const report = this.generateHealthReport();
    this.metricsHistory.push(report);
    
    // Keep only last 100 reports
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }

    // Log status
    const emoji = this.getStatusEmoji(report.status);
    console.log(`${emoji} System Health: ${report.status.toUpperCase()}`);
    
    if (report.issues.length > 0) {
      console.log('📋 Issues detected:', report.issues);
      console.log('💡 Recommendations:', report.recommendations);
    }

    // Emit events based on status
    this.handleHealthStatus(report);
  }

  /**
   * Generate health report based on current metrics
   */
  private generateHealthReport(): HealthReport {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status = HealthStatus.HEALTHY;

    // Check host queue health
    if (this.metrics.hostQueue.length > this.thresholds.hostQueueMax * 2) {
      status = HealthStatus.EMERGENCY;
      issues.push(`Host queue critically backed up: ${this.metrics.hostQueue.length} items`);
      recommendations.push('Emergency: Stop all ingestion immediately');
    } else if (this.metrics.hostQueue.length > this.thresholds.hostQueueMax) {
      status = HealthStatus.CRITICAL;
      issues.push(`Host queue overloaded: ${this.metrics.hostQueue.length} items`);
      recommendations.push('Pause publishing until queue drains');
    }

    // Check for stuck narration
    if (this.metrics.hostQueue.oldestItemAge > this.thresholds.hostQueueStuckTimeout) {
      status = HealthStatus.CRITICAL;
      issues.push(`Narration stuck for ${Math.round(this.metrics.hostQueue.oldestItemAge / 1000)}s`);
      recommendations.push('Clear stuck narration and restart queue processing');
    }

    // Check error rates
    const totalErrors = this.metrics.api.redditErrors + this.metrics.api.claudeErrors;
    if (totalErrors > this.thresholds.errorRateMax) {
      if (status === HealthStatus.HEALTHY) {
        status = HealthStatus.WARNING;
      }
      issues.push(`High error rate: ${totalErrors} errors`);
      recommendations.push('Reduce API call frequency');
    }

    // Check rate limiting
    if (this.metrics.api.rateLimitHits > 0) {
      if (status === HealthStatus.HEALTHY) {
        status = HealthStatus.WARNING;
      }
      issues.push(`Rate limiting detected: ${this.metrics.api.rateLimitHits} hits`);
      recommendations.push('Implement exponential backoff');
    }

    // Check memory usage
    if (this.metrics.memory.usagePercent > this.thresholds.memoryMax) {
      status = HealthStatus.CRITICAL;
      issues.push(`Memory usage critical: ${this.metrics.memory.usagePercent.toFixed(1)}%`);
      recommendations.push('Clear caches and restart if necessary');
    }

    return {
      status,
      issues,
      recommendations,
      metrics: { ...this.metrics },
      timestamp: Date.now()
    };
  }

  /**
   * Handle health status changes and trigger backpressure
   */
  private handleHealthStatus(report: HealthReport): void {
    switch (report.status) {
      case HealthStatus.HEALTHY:
        if (this.backpressureActive) {
          this.deactivateBackpressure();
        }
        break;
        
      case HealthStatus.WARNING:
        this.emit('warning', report);
        break;
        
      case HealthStatus.CRITICAL:
        if (!this.backpressureActive) {
          this.activateBackpressure('critical');
        }
        this.emit('critical', report);
        break;
        
      case HealthStatus.EMERGENCY:
        if (!this.emergencyShutdownActive) {
          this.activateEmergencyShutdown();
        }
        this.emit('emergency', report);
        break;
    }
  }

  /**
   * Activate backpressure mechanisms
   */
  private activateBackpressure(level: 'warning' | 'critical'): void {
    this.backpressureActive = true;
    console.log(`🛑 BACKPRESSURE ACTIVATED (${level})`);
    
    const restrictions: BackpressureRestrictions = {
      pauseIngestion: level === 'critical',
      pausePublishing: true,
      reduceApiCalls: true,
      clearNonEssentialCaches: level === 'critical'
    };
    
    this.emit('backpressure:activate', {
      level,
      restrictions
    });
  }

  /**
   * Deactivate backpressure
   */
  private deactivateBackpressure(): void {
    this.backpressureActive = false;
    console.log('✅ BACKPRESSURE DEACTIVATED - System recovered');
    
    this.emit('backpressure:deactivate', {
      resumeOperations: {
        ingestion: true,
        publishing: true,
        normalApiRate: true
      }
    });
  }

  /**
   * Emergency shutdown - stop everything
   */
  private activateEmergencyShutdown(): void {
    this.emergencyShutdownActive = true;
    console.log('🚨🚨🚨 EMERGENCY SHUTDOWN ACTIVATED 🚨🚨🚨');
    
    this.emit('emergency:shutdown', {
      reason: 'System overload',
      actions: [
        'Stop all API calls',
        'Clear all queues',
        'Restart services',
        'Check logs for root cause'
      ]
    });
  }

  /**
   * Get emoji for status
   */
  private getStatusEmoji(status: HealthStatus): string {
    switch (status) {
      case HealthStatus.HEALTHY: return '✅';
      case HealthStatus.WARNING: return '⚠️';
      case HealthStatus.CRITICAL: return '🔴';
      case HealthStatus.EMERGENCY: return '🚨';
    }
  }

  /**
   * Get current health status
   */
  getCurrentStatus(): HealthReport | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  /**
   * Get metrics history
   */
  getHistory(): HealthReport[] {
    return [...this.metricsHistory];
  }

  /**
   * Check if backpressure is active
   */
  isBackpressureActive(): boolean {
    return this.backpressureActive;
  }

  /**
   * Manually trigger health check
   */
  checkNow(): HealthReport {
    this.performHealthCheck();
    return this.getCurrentStatus()!;
  }

  /**
   * Reset all metrics (use with caution)
   */
  reset(): void {
    console.log('🔄 Resetting Whistleblower metrics');
    this.metrics = {
      hostQueue: { length: 0, oldestItemAge: 0, processingRate: 0 },
      pipeline: { scheduledPosts: 0, publishRate: 0, lastIngestionTime: Date.now() },
      api: { redditErrors: 0, claudeErrors: 0, rateLimitHits: 0 },
      memory: { heapUsed: 0, heapTotal: 0, usagePercent: 0 }
    };
    this.metricsHistory = [];
    this.backpressureActive = false;
    this.emergencyShutdownActive = false;
  }

  /**
   * Update thresholds dynamically
   */
  updateThresholds(newThresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('🔧 Whistleblower thresholds updated:', this.thresholds);
  }
}

// Export singleton instance
export const whistleblower = WhistleblowerAgent.getInstance();
