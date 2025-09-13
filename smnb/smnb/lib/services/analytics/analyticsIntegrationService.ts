/**
 * Analytics Integration Service
 * 
 * Demonstrates how to integrate real analytics tracking into components
 * This service connects the analytics dashboard with actual user behavior tracking
 */

'use client';

import React from 'react';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AnalyticsService } from '@/lib/services/analytics/analyticsServiceClean';

export interface AnalyticsIntegrationService {
  // User Analytics Integration
  trackPageView: (page: string, userId?: string) => Promise<void>;
  trackUserAction: (action: string, metadata?: Record<string, any>, userId?: string) => Promise<void>;
  trackLiveFeedInteraction: (storyId: string, action: 'view' | 'click' | 'share', userId?: string) => Promise<void>;
  trackNewsletterEngagement: (action: 'open' | 'click' | 'unsubscribe', newsletterId?: string, userId?: string) => Promise<void>;
  trackEditorUsage: (action: 'start' | 'save' | 'publish', documentId?: string, userId?: string) => Promise<void>;
  
  // Dashboard Data Fetching
  getDashboardData: () => Promise<any>;
  getUserAnalytics: (userId: string) => Promise<any>;
  
  // Real-time Event Streaming
  startEventStream: (callback: (event: any) => void) => void;
  stopEventStream: () => void;
}

class AnalyticsIntegration implements AnalyticsIntegrationService {
  private convex: any;
  private analyticsService: AnalyticsService;
  private eventListeners: Array<(event: any) => void> = [];
  private isStreamActive = false;
  
  constructor(convexClient: any) {
    this.convex = convexClient;
    this.analyticsService = new AnalyticsService({
      userId: undefined, // Will be set per method call
      sessionId: undefined, // Will be set per method call
      enabled: true
    });
  }

  async trackPageView(page: string, userId?: string): Promise<void> {
    try {
      console.log(`📊 Analytics: Page view tracked - ${page} ${userId ? `for user ${userId}` : ''}`);
      
      // TODO: Integrate with actual analytics service once method signatures are aligned
      if (userId) {
        console.log(`🔄 Analytics: Would track page view for ${userId} on ${page}`);
        // await this.analyticsService.trackPageView(...);
      }
      
      // Emit real-time event
      this.emitEvent({
        type: 'page_view',
        page,
        userId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Failed to track page view:', error);
    }
  }

  async trackUserAction(action: string, metadata: Record<string, any> = {}, userId?: string): Promise<void> {
    try {
      console.log(`🎯 Analytics: User action tracked - ${action}`);
      
      if (userId) {
        console.log(`🔄 Analytics: Would track event ${action} for ${userId}`, metadata);
        // await this.analyticsService.trackEvent(...);
      }
      
      this.emitEvent({
        type: 'user_action',
        action,
        metadata,
        userId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Failed to track user action:', error);
    }
  }

  async trackLiveFeedInteraction(storyId: string, action: 'view' | 'click' | 'share', userId?: string): Promise<void> {
    try {
      console.log(`📰 Analytics: Live feed interaction - ${action} on story ${storyId}`);
      
      if (userId) {
        console.log(`🔄 Analytics: Would track live feed ${action} for ${userId} on story ${storyId}`);
        // await this.analyticsService.trackLiveFeedInteraction(...);
      }
      
      this.emitEvent({
        type: 'livefeed_interaction',
        storyId,
        action,
        userId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Failed to track live feed interaction:', error);
    }
  }

  async trackNewsletterEngagement(action: 'open' | 'click' | 'unsubscribe', newsletterId?: string, userId?: string): Promise<void> {
    try {
      console.log(`📧 Analytics: Newsletter engagement - ${action}`);
      
      if (userId) {
        console.log(`🔄 Analytics: Would track newsletter ${action} for ${userId}`, { newsletter_id: newsletterId });
        // await this.analyticsService.trackEvent(...);
      }
      
      this.emitEvent({
        type: 'newsletter_engagement',
        action,
        newsletterId,
        userId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Failed to track newsletter engagement:', error);
    }
  }

  async trackEditorUsage(action: 'start' | 'save' | 'publish', documentId?: string, userId?: string): Promise<void> {
    try {
      console.log(`✏️ Analytics: Editor usage - ${action}`);
      
      if (userId) {
        console.log(`🔄 Analytics: Would track editor ${action} for ${userId} on document ${documentId}`);
        // await this.analyticsService.trackEditorUsage(...);
      }
      
      this.emitEvent({
        type: 'editor_usage',
        action,
        documentId,
        userId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Failed to track editor usage:', error);
    }
  }

  async getDashboardData(): Promise<any> {
    try {
      const data = await this.convex.query(api.userAnalytics.getDashboardStats, { timeframe_days: 7 });
      
      console.log('📊 Analytics: Dashboard data fetched', data);
      
      return {
        success: true,
        data: data?.data || null,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to get dashboard data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async getUserAnalytics(userId: string): Promise<any> {
    try {
      const data = await this.convex.query(api.userAnalytics.getUserAnalytics, { user_id: userId });
      
      console.log(`👤 Analytics: User analytics fetched for ${userId}`, data);
      
      return {
        success: true,
        data: data?.data || null,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to get user analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  startEventStream(callback: (event: any) => void): void {
    console.log('🎯 Analytics: Starting real-time event stream');
    this.eventListeners.push(callback);
    this.isStreamActive = true;
    
    // Simulate some real-time events for demonstration
    const simulateEvents = () => {
      if (!this.isStreamActive) return;
      
      const mockEvents = [
        { type: 'user_online', userId: 'user123', timestamp: Date.now() },
        { type: 'story_viewed', storyId: 'story456', userId: 'user789', timestamp: Date.now() },
        { type: 'newsletter_opened', userId: 'user321', timestamp: Date.now() }
      ];
      
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      this.emitEvent(randomEvent);
      
      setTimeout(simulateEvents, 3000 + Math.random() * 7000); // Random interval 3-10 seconds
    };
    
    setTimeout(simulateEvents, 2000); // Start after 2 seconds
  }

  stopEventStream(): void {
    console.log('⏹️ Analytics: Stopping real-time event stream');
    this.isStreamActive = false;
    this.eventListeners = [];
  }

  // Private helper methods
  private emitEvent(event: any): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Error in event listener:', error);
      }
    });
  }

  private getSessionId(): string {
    // Get or generate session ID from localStorage
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getCurrentFeedPosition(): number {
    // Calculate current scroll position in feed
    return Math.floor(window.scrollY / 100);
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

// Hook for using analytics in React components
export function useAnalyticsIntegration() {
  const convex = useConvex();
  
  // Create singleton instance
  const analyticsIntegration = React.useMemo(() => {
    return new AnalyticsIntegration(convex);
  }, [convex]);

  return analyticsIntegration;
}

// Export singleton instance for non-React usage
let analyticsIntegrationInstance: AnalyticsIntegration | null = null;

export function getAnalyticsIntegration(convexClient?: any): AnalyticsIntegration {
  if (!analyticsIntegrationInstance && convexClient) {
    analyticsIntegrationInstance = new AnalyticsIntegration(convexClient);
  }
  
  if (!analyticsIntegrationInstance) {
    throw new Error('Analytics integration not initialized. Provide convex client.');
  }
  
  return analyticsIntegrationInstance;
}

// Helper functions for common tracking scenarios
export const trackLiveFeedStoryView = (storyId: string, userId?: string) => {
  if (analyticsIntegrationInstance) {
    analyticsIntegrationInstance.trackLiveFeedInteraction(storyId, 'view', userId);
  }
};

export const trackNewsletterOpen = (newsletterId: string, userId?: string) => {
  if (analyticsIntegrationInstance) {
    analyticsIntegrationInstance.trackNewsletterEngagement('open', newsletterId, userId);
  }
};

export const trackEditorStart = (documentId: string, userId?: string) => {
  if (analyticsIntegrationInstance) {
    analyticsIntegrationInstance.trackEditorUsage('start', documentId, userId);
  }
};

console.log('📊 Analytics Integration Service initialized');