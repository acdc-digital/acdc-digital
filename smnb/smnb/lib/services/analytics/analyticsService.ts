import { api } from "../../../convex/_generated/api";
import convex from "@/lib/convex/convex";
import { Id } from "../../../convex/_generated/dataModel";

// Simple interface for analytics configuration
interface SimpleAnalyticsConfig {
  userId?: string;
  enabled: boolean;
  sessionId?: string;
}

export class AnalyticsService {
  private userId?: string;
  private sessionId?: string;
  private enabled: boolean;

  constructor(config: SimpleAnalyticsConfig) {
    this.userId = config.userId;
    this.sessionId = config.sessionId;
    this.enabled = config.enabled;
  }

  // 📊 USER ANALYTICS - Working with existing schema
  async createOrUpdateUserAnalytics(userId: string, updates: {
    account_type?: "free" | "premium" | "editor" | "admin";
    posts_viewed?: number;
    posts_clicked?: number;
    ai_requests_made?: number;
  }): Promise<Id<"user_analytics"> | null> {
    if (!this.enabled) return null;
    
    console.log(`👤 Creating/updating user analytics for ${userId}`);
    
    try {
      // Check if user analytics already exists
      const existing = await convex.query(api.userAnalytics.getUserAnalytics, { user_id: userId });
      
      if (existing) {
        // Update existing analytics
        const updateData = {
          last_active: Date.now(),
          posts_viewed: updates.posts_viewed,
          posts_clicked: updates.posts_clicked,
          ai_requests_made: updates.ai_requests_made,
          updated_at: Date.now()
        };
        
        await convex.mutation(api.userAnalytics.updateUserAnalytics, {
          user_id: userId,
          updates: updateData
        });
        
        console.log(`✅ Updated analytics for user: ${userId}`);
        return existing._id;
      } else {
        // Create new analytics record
        const analyticsData = {
          user_id: userId,
          account_type: updates.account_type || "free" as const,
          registration_date: Date.now(),
          last_active: Date.now(),
          total_sessions: 1,
          verification_status: false,
          api_usage_this_month: 0,
          overall_engagement_score: 0,
          content_quality_rating: 0,
          influence_score: 0,
          posts_viewed: updates.posts_viewed || 0,
          posts_clicked: updates.posts_clicked || 0,
          ai_requests_made: updates.ai_requests_made || 0,
          user_archetype: "lurker" as const,
          engagement_trend: "stable" as const,
          churn_risk_score: 0,
          created_at: Date.now(),
          updated_at: Date.now()
        };
        
        const analyticsId = await convex.mutation(api.userAnalytics.createUserAnalytics, analyticsData);
        console.log(`✅ Created analytics for user: ${userId}`);
        return analyticsId;
      }
    } catch (error) {
      console.error(`❌ Error managing user analytics:`, error);
      return null;
    }
  }

  // 📊 SESSION MANAGEMENT
  async startSession(userId: string, sessionData?: {
    device_type?: "desktop" | "mobile" | "tablet";
    browser?: string;
    os?: string;
  }): Promise<string | null> {
    if (!this.enabled) return null;
    
    console.log(`🚀 Starting session for user ${userId}`);
    
    try {
      const sessionId = this.generateSessionId();
      const deviceInfo = this.getDeviceInfo();
      
      await convex.mutation(api.userAnalytics.createUserSession, {
        session_id: sessionId,
        user_id: userId,
        session_start: Date.now(),
        device_type: sessionData?.device_type || this.detectDeviceType(),
        browser: sessionData?.browser || deviceInfo.browser,
        os: sessionData?.os || deviceInfo.os,
        language: navigator.language,
        entry_point: window.location.pathname,
        referrer_source: document.referrer || undefined,
        page_views: 1
      });
      
      this.sessionId = sessionId;
      console.log(`✅ Session started: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error(`❌ Error starting session:`, error);
      return null;
    }
  }

  async endSession(sessionId?: string): Promise<void> {
    const activeSessionId = sessionId || this.sessionId;
    if (!activeSessionId || !this.enabled) return;

    console.log(`🏁 Ending session ${activeSessionId}`);
    
    try {
      await convex.mutation(api.userAnalytics.updateUserSession, {
        session_id: activeSessionId,
        updates: {
          session_end: Date.now(),
          session_duration: Date.now() - (Date.now() - 300000), // Approximate
          exit_point: window.location.pathname
        }
      });

      this.sessionId = undefined;
      console.log(`✅ Session ended: ${activeSessionId}`);
    } catch (error) {
      console.error(`❌ Error ending session:`, error);
    }
  }

  // 🎯 EVENT TRACKING
  async trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<void> {
    if (!this.enabled || !this.userId) return;

    try {
      const eventId = this.generateEventId();
      
      await convex.mutation(api.userAnalytics.createUserEvent, {
        event_id: eventId,
        user_id: this.userId,
        session_id: this.sessionId || "",
        event_type: eventType as any, // Cast to match expected union types
        event_category: this.categorizeEvent(eventType),
        event_action: eventType,
        event_label: eventData.label,
        event_value: eventData.value,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer || undefined,
        properties: JSON.stringify(eventData),
        timestamp: Date.now()
      });

      console.log(`📊 Event tracked: ${eventType}`, eventData);
    } catch (error) {
      console.error(`❌ Error tracking event:`, error);
    }
  }

  async trackPageView(url?: string): Promise<void> {
    const pageUrl = url || window.location.href;
    console.log(`👁️ Tracking page view: ${pageUrl}`);
    
    await this.trackEvent("page_view", {
      url: pageUrl,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }

  // 📈 CONTENT INTERACTIONS
  async trackContentInteraction(contentId: string, interactionType: string, contentType: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.enabled || !this.userId) return;

    try {
      const interactionId = this.generateInteractionId();
      
      await convex.mutation(api.userAnalytics.createContentInteraction, {
        interaction_id: interactionId,
        user_id: this.userId,
        content_id: contentId,
        content_type: contentType as any,
        interaction_type: interactionType as any,
        view_duration: metadata?.duration,
        scroll_depth: metadata?.scrollDepth,
        interaction_value: metadata?.value,
        page_url: window.location.href,
        session_id: this.sessionId || "",
        device_type: this.detectDeviceType(),
        timestamp: Date.now()
      });

      console.log(`💫 Content interaction: ${interactionType} on ${contentType} ${contentId}`);
    } catch (error) {
      console.error(`❌ Error tracking content interaction:`, error);
    }
  }

  // 📊 ANALYTICS QUERIES
  async getUserAnalytics(userId?: string): Promise<any> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) return null;

    try {
      return await convex.query(api.userAnalytics.getUserAnalytics, {
        user_id: targetUserId
      });
    } catch (error) {
      console.error(`❌ Error fetching user analytics:`, error);
      return null;
    }
  }

  async getEngagementMetrics(userId?: string, timeframeDays: number = 30): Promise<any> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) return null;

    try {
      return await convex.query(api.userAnalytics.getEngagementMetrics, {
        user_id: targetUserId,
        timeframe_days: timeframeDays
      });
    } catch (error) {
      console.error(`❌ Error fetching engagement metrics:`, error);
      return null;
    }
  }

  async getDashboardStats(timeframeDays: number = 7): Promise<any> {
    try {
      return await convex.query(api.userAnalytics.getDashboardStats, {
        timeframe_days: timeframeDays
      });
    } catch (error) {
      console.error(`❌ Error fetching dashboard stats:`, error);
      return null;
    }
  }

  // 🛠️ Helper Methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInteractionId(): string {
    return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDeviceType(): "desktop" | "mobile" | "tablet" {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return "mobile";
    }
    return "desktop";
  }

  private getDeviceInfo() {
    return {
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      browser: this.detectBrowser(),
      os: this.detectOS()
    };
  }

  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private categorizeEvent(eventType: string): "navigation" | "content" | "interaction" | "system" {
    if (eventType.includes('page') || eventType.includes('route')) return 'navigation';
    if (eventType.includes('post') || eventType.includes('story')) return 'content';
    if (eventType.includes('click') || eventType.includes('share')) return 'interaction';
    return 'system';
  }

  // Update user ID for the service
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Get current session ID
  getSessionId(): string | undefined {
    return this.sessionId;
  }
}

  // 🎯 HIGH-LEVEL TRACKING METHODS
  async trackLiveFeedInteraction(interaction: {
    action: "view" | "click" | "scroll" | "filter" | "share";
    story_id?: string;
    position?: number;
    duration?: number;
    filters_applied?: string[];
  }): Promise<void> {
    if (!this.userId) return;
    
    console.log(`📺 Tracking live feed interaction: ${interaction.action}`);

    // Track as content interaction
    if (interaction.story_id) {
      await this.trackContentInteraction(
        interaction.story_id,
        interaction.action,
        "live_feed_post",
        {
          position: interaction.position,
          duration: interaction.duration,
          filters: interaction.filters_applied
        }
      );
    }

    // Track as general event
    await this.trackEvent("live_feed_interaction", {
      action: interaction.action,
      story_id: interaction.story_id,
      position: interaction.position,
      duration: interaction.duration
    });

    // Update user analytics
    if (interaction.action === "view") {
      await this.incrementUserMetric("posts_viewed");
    } else if (interaction.action === "click") {
      await this.incrementUserMetric("posts_clicked");
    }
  }

  async trackStoryEngagement(storyId: string, engagement: {
    action: "view" | "click" | "share" | "bookmark" | "like" | "comment";
    reading_time?: number;
    scroll_depth?: number;
    completion_rate?: number;
  }): Promise<void> {
    if (!this.userId) return;
    
    console.log(`📖 Tracking story engagement: ${engagement.action} on ${storyId}`);

    // Track as content interaction
    await this.trackContentInteraction(
      storyId,
      engagement.action,
      "story",
      {
        reading_time: engagement.reading_time,
        scroll_depth: engagement.scroll_depth,
        completion_rate: engagement.completion_rate
      }
    );

    // Update user analytics for story views
    if (engagement.action === "view") {
      await this.incrementUserMetric("stories_opened");
    }
  }

  async trackEditorUsage(usage: {
    action: "ai_assist" | "edit" | "save" | "format" | "open" | "close";
    document_id?: string;
    session_duration?: number;
    characters_typed?: number;
    ai_suggestions_used?: number;
  }): Promise<void> {
    if (!this.userId) return;
    
    console.log(`✏️ Tracking editor usage: ${usage.action}`);

    // Track as general event
    await this.trackEvent("editor_usage", {
      action: usage.action,
      document_id: usage.document_id,
      session_duration: usage.session_duration,
      characters_typed: usage.characters_typed
    });

    // Update user analytics for AI usage
    if (usage.action === "ai_assist") {
      await this.incrementUserMetric("ai_requests_made", usage.ai_suggestions_used || 1);
    }
  }

  private async incrementUserMetric(metric: string, amount: number = 1): Promise<void> {
    if (!this.userId) return;
    
    try {
      const current = await this.getUserAnalytics();
      if (current) {
        const updates: any = {};
        updates[metric] = (current[metric] || 0) + amount;
        
        await convex.mutation(api.userAnalytics.updateUserAnalytics, {
          user_id: this.userId,
          updates
        });
      }
    } catch (error) {
      console.error(`❌ Error incrementing user metric ${metric}:`, error);
    }
  }
}

// Factory function for creating analytics service instances
export function createAnalyticsService(config: AnalyticsServiceConfig): AnalyticsService {
  return new AnalyticsService(config);
}

// Default configuration
export const defaultAnalyticsConfig: AnalyticsServiceConfig = {
  enabled: true,
  userId: undefined,
  trackPageViews: true,
  trackUserEvents: true,
  trackPerformance: true,
  enableMLTracking: true,
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  enableDebugLogging: process.env.NODE_ENV === "development"
};