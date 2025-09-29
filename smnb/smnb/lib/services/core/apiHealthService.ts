// API HEALTH SERVICE
// /Users/matthewsimon/Projects/SMNB/smnb/lib/services/apiHealthService.ts

import { ConvexReactClient } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface APIEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  category: 'reddit' | 'claude' | 'internal' | 'external';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  expectedStatus?: number[];
}

export interface APIHealthStatus {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastError?: string;
  consecutiveFailures: number;
  totalChecks: number;
  successfulChecks: number;
}

export interface APIHealthMetrics {
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  lastUpdated: number;
}

export class APIHealthService {
  private endpoints: APIEndpoint[] = [];
  private healthStatus: Map<string, APIHealthStatus> = new Map();
  private checkInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private convexClient?: ConvexReactClient;

  constructor(convexClient?: ConvexReactClient) {
    this.convexClient = convexClient;
    this.initializeEndpoints();
  }
  
  setConvexClient(client: ConvexReactClient) {
    this.convexClient = client;
  }

  // Initialize health check records for all endpoints
  async initializeHealthRecords(): Promise<void> {
    if (!this.convexClient) {
      console.warn('⚠️ Convex client not available for health record initialization');
      return;
    }

    try {
      for (const endpoint of this.endpoints) {
        await this.convexClient.mutation(api.system.apiHealth.initializeAPIEndpoint, {
          endpoint: endpoint.name,
          category: endpoint.category,
          url: endpoint.url,
          method: endpoint.method,
          description: endpoint.description
        });
      }
      console.log('✅ API health records initialized');
    } catch (error) {
      console.error('❌ Failed to initialize health records:', error);
    }
  }

  private initializeEndpoints(): void {
    // Get base URL for API calls
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    this.endpoints = [
      // Reddit API Endpoints
      {
        name: 'Reddit Posts API',
        url: `${baseUrl}/api/reddit?subreddit=test&limit=1`,
        method: 'GET',
        description: 'Fetch Reddit posts from subreddits',
        category: 'reddit',
        timeout: 5000,
        expectedStatus: [200, 403] // 403 might happen due to rate limits, still "working"
      },
      {
        name: 'Reddit Duplicates API',
        url: `${baseUrl}/api/reddit/duplicates?url=https://example.com`,
        method: 'GET',
        description: 'Check for duplicate Reddit submissions',
        category: 'reddit',
        timeout: 5000,
        expectedStatus: [200]
      },
      
      // Claude AI Endpoints
      {
        name: 'Claude AI API',
        url: `${baseUrl}/api/claude`,
        method: 'POST',
        description: 'Claude AI text generation and analysis',
        category: 'claude',
        timeout: 10000,
        expectedStatus: [200],
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          action: 'test',
          prompt: 'Health check test'
        }
      },
      {
        name: 'Claude Debug API',
        url: `${baseUrl}/api/claude/debug`,
        method: 'GET',
        description: 'Claude API configuration status',
        category: 'claude',
        timeout: 3000,
        expectedStatus: [200]
      },

      // Internal Health Endpoints
      {
        name: 'Database Health',
        url: `${baseUrl}/api/health/database`,
        method: 'GET',
        description: 'Convex database connectivity',
        category: 'internal',
        timeout: 2000,
        expectedStatus: [200]
      },
      {
        name: 'System Health',
        url: `${baseUrl}/api/health/system`,
        method: 'GET',
        description: 'Overall system health check',
        category: 'internal',
        timeout: 2000,
        expectedStatus: [200]
      }
    ];

    // Initialize health status for each endpoint
    this.endpoints.forEach(endpoint => {
      this.healthStatus.set(endpoint.name, {
        endpoint: endpoint.name,
        status: 'unknown',
        lastCheck: 0,
        responseTime: 0,
        errorRate: 0,
        uptime: 0,
        consecutiveFailures: 0,
        totalChecks: 0,
        successfulChecks: 0
      });
    });
  }

  async checkEndpointHealth(endpoint: APIEndpoint): Promise<APIHealthStatus> {
    const startTime = Date.now();
    const currentStatus = this.healthStatus.get(endpoint.name)!;
    
    try {
      console.log(`🔍 Checking ${endpoint.name}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout || 5000);

      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: endpoint.headers || {},
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const isExpectedStatus = endpoint.expectedStatus?.includes(response.status) ?? response.ok;
      const isHealthy = isExpectedStatus && responseTime < (endpoint.timeout || 5000);
      
      // Update status
      const newStatus: APIHealthStatus = {
        ...currentStatus,
        status: isHealthy ? 'healthy' : (responseTime > (endpoint.timeout || 5000) ? 'degraded' : 'unhealthy'),
        lastCheck: Date.now(),
        responseTime,
        consecutiveFailures: isHealthy ? 0 : currentStatus.consecutiveFailures + 1,
        totalChecks: currentStatus.totalChecks + 1,
        successfulChecks: currentStatus.successfulChecks + (isHealthy ? 1 : 0),
        lastError: isHealthy ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
      
      // Calculate error rate and uptime
      newStatus.errorRate = newStatus.totalChecks > 0 
        ? ((newStatus.totalChecks - newStatus.successfulChecks) / newStatus.totalChecks) * 100
        : 0;
      newStatus.uptime = newStatus.totalChecks > 0 
        ? (newStatus.successfulChecks / newStatus.totalChecks) * 100 
        : 0;
      
      this.healthStatus.set(endpoint.name, newStatus);
      
      // Persist to Convex if client is available
      if (this.convexClient) {
        try {
          await this.convexClient.mutation(api.system.apiHealth.recordAPIHealth, {
            endpoint: endpoint.name,
            category: endpoint.category,
            status: newStatus.status,
            response_time: responseTime,
            consecutive_failures: newStatus.consecutiveFailures,
            total_checks: newStatus.totalChecks,
            successful_checks: newStatus.successfulChecks,
            last_error: newStatus.lastError || undefined,
            url: endpoint.url,
            method: endpoint.method,
            description: endpoint.description
          });
        } catch (convexError) {
          console.warn(`⚠️ Failed to persist health data for ${endpoint.name}:`, convexError);
        }
      }
      
      if (isHealthy) {
        console.log(`✅ ${endpoint.name}: ${responseTime}ms`);
      } else {
        console.log(`❌ ${endpoint.name}: ${newStatus.lastError} (${responseTime}ms)`);
      }
      
      return newStatus;
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      const newStatus: APIHealthStatus = {
        ...currentStatus,
        status: 'unhealthy',
        lastCheck: Date.now(),
        responseTime,
        consecutiveFailures: currentStatus.consecutiveFailures + 1,
        totalChecks: currentStatus.totalChecks + 1,
        successfulChecks: currentStatus.successfulChecks,
        lastError: error.name === 'AbortError' ? 'Request timeout' : error.message
      };
      
      // Calculate error rate and uptime
      newStatus.errorRate = newStatus.totalChecks > 0 
        ? ((newStatus.totalChecks - newStatus.successfulChecks) / newStatus.totalChecks) * 100
        : 0;
      newStatus.uptime = newStatus.totalChecks > 0 
        ? (newStatus.successfulChecks / newStatus.totalChecks) * 100 
        : 0;
      
      this.healthStatus.set(endpoint.name, newStatus);
      
      console.log(`💥 ${endpoint.name}: ${newStatus.lastError} (${responseTime}ms)`);
      
      return newStatus;
    }
  }

  async checkAllEndpoints(): Promise<APIHealthStatus[]> {
    console.log(`🔍 API Health Check: Checking ${this.endpoints.length} endpoints...`);
    
    const results = await Promise.allSettled(
      this.endpoints.map(endpoint => this.checkEndpointHealth(endpoint))
    );
    
    const healthStatuses = results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean) as APIHealthStatus[];
    
    console.log(`📊 API Health Summary: ${healthStatuses.filter(h => h.status === 'healthy').length}/${healthStatuses.length} healthy`);
    
    return healthStatuses;
  }

  startMonitoring(intervalMinutes: number = 2): void {
    if (this.isMonitoring) {
      console.log('⚠️ API health monitoring already running');
      return;
    }

    console.log(`🚀 Starting API health monitoring (every ${intervalMinutes} minutes)`);
    this.isMonitoring = true;
    
    // Initial check
    this.checkAllEndpoints();
    
    // Set up interval
    this.checkInterval = setInterval(() => {
      this.checkAllEndpoints();
    }, intervalMinutes * 60 * 1000);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('⏹️ API health monitoring stopped');
  }

  getHealthStatus(): APIHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  getHealthSummary(): APIHealthMetrics {
    const statuses = this.getHealthStatus();
    
    if (statuses.length === 0) {
      return {
        averageResponseTime: 0,
        errorRate: 0,
        uptime: 0,
        lastUpdated: Date.now()
      };
    }

    const totalResponseTime = statuses.reduce((sum, status) => sum + status.responseTime, 0);
    const totalErrorRate = statuses.reduce((sum, status) => sum + status.errorRate, 0);
    const totalUptime = statuses.reduce((sum, status) => sum + status.uptime, 0);
    
    return {
      averageResponseTime: totalResponseTime / statuses.length,
      errorRate: totalErrorRate / statuses.length,
      uptime: totalUptime / statuses.length,
      lastUpdated: Math.max(...statuses.map(s => s.lastCheck))
    };
  }

  getEndpointsByCategory(): Record<string, APIHealthStatus[]> {
    const statuses = this.getHealthStatus();
    const categories: Record<string, APIHealthStatus[]> = {};
    
    this.endpoints.forEach(endpoint => {
      const status = statuses.find(s => s.endpoint === endpoint.name);
      if (status) {
        if (!categories[endpoint.category]) {
          categories[endpoint.category] = [];
        }
        categories[endpoint.category].push(status);
      }
    });
    
    return categories;
  }

  // Manual health check trigger
  async runHealthCheck(): Promise<APIHealthStatus[]> {
    return await this.checkAllEndpoints();
  }

  // Get health status for a specific endpoint
  getEndpointStatus(endpointName: string): APIHealthStatus | undefined {
    return this.healthStatus.get(endpointName);
  }

  // Reset health statistics
  resetStats(): void {
    this.endpoints.forEach(endpoint => {
      this.healthStatus.set(endpoint.name, {
        endpoint: endpoint.name,
        status: 'unknown',
        lastCheck: 0,
        responseTime: 0,
        errorRate: 0,
        uptime: 0,
        consecutiveFailures: 0,
        totalChecks: 0,
        successfulChecks: 0
      });
    });
    console.log('📊 API health statistics reset');
  }
}

// Singleton instance
export const apiHealthService = new APIHealthService();

// Auto-start monitoring in development/production
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    apiHealthService.startMonitoring(2); // Check every 2 minutes
  }, 5000); // Start after 5 seconds to let app initialize
}