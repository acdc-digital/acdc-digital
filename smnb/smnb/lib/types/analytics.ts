// USER ANALYTICS TYPES & INTERFACES
// /Users/matthewsimon/Projects/SMNB/smnb/lib/types/analytics.ts

/**
 * Comprehensive user analytics type definitions
 * Supporting 9 levels of data hierarchy for SMNB user behavior tracking
 */

// ===================================================================
// 🎯 LEVEL 1: CORE USER IDENTITY
// ===================================================================

export interface UserCore {
  // Identity
  user_id: string;
  account_type: 'free' | 'premium' | 'editor' | 'admin';
  registration_date: Date;
  last_active: Date;
  total_sessions: number;
  
  // Account Status
  verification_status: boolean;
  subscription_tier: string;
  credits_remaining: number;
  api_usage_this_month: number;
  
  // Engagement Score
  overall_engagement_score: number; // 0-100
  content_quality_rating: number;   // User's avg content quality
  influence_score: number;          // Based on shares/engagement
}

// ===================================================================
// 📱 LEVEL 2: SESSION & DEVICE ANALYTICS
// ===================================================================

export interface SessionMetrics {
  // Session Basics
  session_id: string;
  session_start: Date;
  session_duration: number; // seconds
  page_views: number;
  bounce_rate: boolean;
  
  // Device & Platform
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screen_resolution: string;
  connection_speed: 'slow' | 'medium' | 'fast';
  
  // Geographic
  country: string;
  region: string;
  city: string;
  timezone: string;
  language: string;
  
  // Entry/Exit
  entry_point: string;      // First page visited
  exit_point: string;       // Last page before leaving
  referrer_source: string;  // Where they came from
  utm_campaign?: string;
  utm_source?: string;
}

// ===================================================================
// 📰 LEVEL 3: LIVE FEED INTERACTION METRICS
// ===================================================================

export interface LiveFeedMetrics {
  // Viewing Behavior
  posts_viewed: number;
  posts_scrolled_past: number;    // Saw but didn't engage
  avg_view_duration: number;      // Time spent per post
  scroll_depth: number;           // How far they scroll
  refresh_frequency: number;      // Manual refreshes per session
  
  // Interaction Metrics
  posts_clicked: number;
  posts_expanded: number;         // Read full content
  external_links_clicked: number; // Clicked through to Reddit
  
  // Engagement Actions
  posts_upvoted: number;
  posts_downvoted: number;
  posts_shared: number;
  posts_saved: number;
  posts_hidden: number;
  posts_reported: number;
  
  // Category Preferences
  categories_viewed: Record<string, number>;  // {technology: 45, politics: 23}
  subreddits_engaged: Record<string, number>; // {worldnews: 12, science: 8}
  
  // Sentiment Preference
  sentiment_preference: {
    positive: number;  // % of positive posts engaged
    neutral: number;
    negative: number;
  };
  
  // Time-based Patterns
  peak_viewing_hours: number[];      // [14, 15, 16] (2pm-4pm)
  avg_posts_per_visit: number;
  time_between_visits: number;       // hours
  
  // Quality Preferences
  min_quality_score_engaged: number; // Lowest score they'll read
  avg_quality_score_preference: number;
  high_priority_engagement_rate: number; // % of high priority posts clicked
}

// ===================================================================
// 📖 LEVEL 4: STORY & LONG-FORM CONTENT METRICS
// ===================================================================

export interface StoryMetrics {
  // Reading Behavior
  stories_opened: number;
  stories_completed: number;         // Read to end
  completion_rate: number;           // % finished
  avg_reading_time: number;          // seconds per story
  reading_speed: number;             // words per minute
  
  // Scroll & Navigation
  scroll_patterns: {
    smooth_scrollers: boolean;       // Continuous reading
    skimmers: boolean;               // Jump around
    completionists: boolean;         // Always finish
  };
  
  // Interaction Points
  inline_links_clicked: number;
  images_viewed_fullscreen: number;
  videos_played: number;
  video_completion_rate: number;
  
  // Story Preferences
  preferred_story_length: 'short' | 'medium' | 'long';
  preferred_topics: string[];
  author_follows: string[];
  
  // Engagement Depth
  comments_read: number;
  comments_posted: number;
  highlights_created: number;        // Text selections
  notes_added: number;
}

// ===================================================================
// 📧 LEVEL 5: NEWSLETTER ANALYTICS
// ===================================================================

export interface NewsletterMetrics {
  // Subscription Status
  subscribed: boolean;
  subscription_date: Date;
  subscription_source: string;       // How they subscribed
  email_verified: boolean;
  
  // Email Engagement
  emails_sent: number;
  emails_opened: number;
  open_rate: number;
  click_through_rate: number;
  
  // Click Patterns
  links_clicked_per_email: number;
  most_clicked_sections: string[];   // ['top stories', 'tech news']
  time_to_open: number;              // Hours after sending
  device_used_to_open: string;
  
  // Newsletter Preferences
  frequency_preference: 'daily' | 'weekly' | 'monthly';
  format_preference: 'summary' | 'detailed' | 'headlines';
  topic_preferences: string[];
  
  // Unsubscribe Signals
  emails_marked_spam: number;
  unsubscribe_attempts: number;
  preference_changes: number;
  
  // Content Generation (Editor)
  newsletters_created: number;
  newsletters_sent: number;
  avg_recipient_count: number;
  template_usage: Record<string, number>;
}

// ===================================================================
// ✍️ LEVEL 6: EDITOR & CONTENT CREATION METRICS
// ===================================================================

export interface EditorMetrics {
  // Creation Stats
  documents_created: number;
  documents_published: number;
  drafts_in_progress: number;
  avg_time_to_publish: number;       // hours
  
  // AI Usage
  ai_requests_made: number;
  ai_suggestions_accepted: number;
  ai_acceptance_rate: number;
  ai_features_used: string[];        // ['newsletter', 'formatting', 'summary']
  
  // Editor Behavior
  avg_session_duration: number;
  revision_count_per_doc: number;
  autosave_recoveries: number;
  collaboration_sessions: number;
  
  // Content Quality
  avg_word_count: number;
  readability_score: number;
  grammar_issues_fixed: number;
  
  // Publishing Patterns
  publishing_times: number[];        // Hours when they publish
  publishing_days: string[];         // Days of week
  cross_posting_platforms: string[]; // Where else they share
}

// ===================================================================
// 🧠 LEVEL 7: BEHAVIORAL PATTERNS & INTELLIGENCE
// ===================================================================

export interface BehavioralPatterns {
  // User Type Classification
  user_archetype: 'lurker' | 'engager' | 'creator' | 'curator' | 'influencer';
  
  // Content Journey
  content_discovery_path: string[];  // How they find content
  typical_session_flow: string[];    // Page sequence patterns
  
  // Engagement Evolution
  engagement_trend: 'increasing' | 'stable' | 'decreasing';
  feature_adoption_rate: number;     // How quickly they try new features
  
  // Social Behavior
  sharing_personality: 'private' | 'selective' | 'social';
  comment_sentiment: 'positive' | 'neutral' | 'critical';
  community_participation: number;   // 0-100 score
  
  // Learning Patterns
  topic_exploration_rate: number;    // New topics per week
  content_depth_preference: 'surface' | 'moderate' | 'deep';
  
  // Predictive Metrics
  churn_risk_score: number;         // 0-100
  upgrade_likelihood: number;       // 0-100
  viral_content_potential: number;  // 0-100
}

// ===================================================================
// 🤖 LEVEL 8: ADVANCED ANALYTICS & ML FEATURES
// ===================================================================

export interface MLDataPoints {
  // Clustering Features
  user_cluster_id: string;          // Similar user group
  content_affinity_vector: number[]; // Multi-dimensional preferences
  
  // Time Series Patterns
  activity_seasonality: {
    daily_pattern: number[];        // 24-hour activity distribution
    weekly_pattern: number[];       // 7-day pattern
    monthly_pattern: number[];      // 30-day pattern
  };
  
  // Recommendation Signals
  collaborative_filtering_score: Record<string, number>;
  content_based_filtering_score: Record<string, number>;
  
  // Anomaly Detection
  unusual_activity_flags: string[];
  bot_probability_score: number;
  
  // Network Effects
  user_influence_graph: {
    followers: string[];
    following: string[];
    interaction_strength: Record<string, number>;
  };
}

// ===================================================================
// 💼 LEVEL 9: BUSINESS INTELLIGENCE METRICS
// ===================================================================

export interface BusinessMetrics {
  // Revenue Attribution
  lifetime_value: number;
  revenue_generated: number;
  cost_to_acquire: number;
  
  // Growth Metrics
  referrals_made: number;
  referral_conversion_rate: number;
  viral_coefficient: number;
  
  // Platform Health
  support_tickets_created: number;
  feature_requests_submitted: number;
  bug_reports_filed: number;
  
  // Competitive Intelligence
  alternative_platforms_used: string[];
  feature_comparison_score: number;
  
  // Retention Indicators
  days_since_last_visit: number;
  login_streak: number;
  feature_stickiness: Record<string, number>;
}

// ===================================================================
// 📊 COMPOSITE ANALYTICS INTERFACE
// ===================================================================

export interface UserAnalytics {
  // Core Data (Levels 1-9)
  core: UserCore;
  sessions: SessionMetrics[];
  liveFeed: LiveFeedMetrics;
  stories: StoryMetrics;
  newsletter: NewsletterMetrics;
  editor: EditorMetrics;
  behavior: BehavioralPatterns;
  ml: MLDataPoints;
  business: BusinessMetrics;
  
  // Metadata
  last_updated: Date;
  data_version: string;
}

// ===================================================================
// 🎯 REAL-TIME EVENT TRACKING
// ===================================================================

export interface UserEvent {
  event_id: string;
  user_id: string;
  session_id: string;
  timestamp: Date;
  event_type: EventType;
  event_category: EventCategory;
  event_action: string;
  event_label?: string;
  event_value?: number;
  
  // Context
  page_url: string;
  page_title: string;
  referrer: string;
  
  // Custom Properties
  properties: Record<string, any>;
  
  // Processing
  processed: boolean;
  aggregated: boolean;
}

export enum EventType {
  // Navigation
  PAGE_VIEW = 'page_view',
  ROUTE_CHANGE = 'route_change',
  
  // Content
  POST_VIEW = 'post_view',
  POST_CLICK = 'post_click',
  POST_SHARE = 'post_share',
  POST_SAVE = 'post_save',
  POST_UPVOTE = 'post_upvote',
  POST_DOWNVOTE = 'post_downvote',
  POST_EXPAND = 'post_expand',
  POST_HIDE = 'post_hide',
  
  // Interaction
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  SEARCH = 'search',
  FILTER_APPLY = 'filter_apply',
  SCROLL = 'scroll',
  
  // Editor
  EDITOR_OPEN = 'editor_open',
  EDITOR_SAVE = 'editor_save',
  EDITOR_PUBLISH = 'editor_publish',
  AI_REQUEST = 'ai_request',
  AI_ACCEPT = 'ai_accept',
  
  // Newsletter
  NEWSLETTER_SUBSCRIBE = 'newsletter_subscribe',
  NEWSLETTER_UNSUBSCRIBE = 'newsletter_unsubscribe',
  EMAIL_OPEN = 'email_open',
  EMAIL_CLICK = 'email_click',
  
  // System
  ERROR = 'error',
  PERFORMANCE = 'performance',
  API_CALL = 'api_call'
}

export enum EventCategory {
  NAVIGATION = 'navigation',
  CONTENT = 'content',
  INTERACTION = 'interaction',
  EDITOR = 'editor',
  NEWSLETTER = 'newsletter',
  SYSTEM = 'system'
}

// ===================================================================
// 📱 SESSION TRACKING
// ===================================================================

export interface UserSession {
  session_id: string;
  user_id: string;
  
  // Timing
  session_start: Date;
  session_end?: Date;
  session_duration?: number; // seconds
  page_views: number;
  bounce_rate: boolean;
  
  // Device & Platform
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screen_resolution?: string;
  connection_speed: 'slow' | 'medium' | 'fast';
  
  // Geographic
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  language: string;
  
  // Navigation
  entry_point: string;
  exit_point?: string;
  referrer_source?: string;
  utm_campaign?: string;
  utm_source?: string;
  
  // Engagement
  events_count: number;
  interactions_count: number;
  content_engagement_score: number;
  
  created_at: Date;
  updated_at: Date;
}

// ===================================================================
// 🎨 CONTENT INTERACTION TRACKING
// ===================================================================

export interface ContentInteraction {
  interaction_id: string;
  user_id: string;
  content_id: string;
  content_type: 'live_feed_post' | 'story' | 'newsletter' | 'editor_document';
  
  // Interaction Details
  interaction_type: 'view' | 'click' | 'expand' | 'share' | 'save' | 'upvote' | 'downvote' | 'hide' | 'report';
  
  // Metrics
  view_duration?: number; // seconds
  scroll_depth?: number;  // percentage
  interaction_value?: number; // weighted value
  
  // Context
  page_url: string;
  session_id: string;
  device_type: string;
  
  timestamp: Date;
  created_at: Date;
}

// ===================================================================
// 📊 AGGREGATED ANALYTICS DATA
// ===================================================================

export interface AnalyticsAggregation {
  // Time Range
  period_type: 'hour' | 'day' | 'week' | 'month';
  period_start: Date;
  period_end: Date;
  
  // User Metrics
  total_users: number;
  active_users: number;
  new_users: number;
  returning_users: number;
  
  // Engagement Metrics
  total_sessions: number;
  avg_session_duration: number;
  total_page_views: number;
  bounce_rate: number;
  
  // Content Metrics
  posts_viewed: number;
  posts_engaged: number;
  engagement_rate: number;
  
  // User Segmentation
  user_archetypes: Record<string, number>;
  device_breakdown: Record<string, number>;
  geo_breakdown: Record<string, number>;
  
  created_at: Date;
}

// ===================================================================
// 🛠️ SERVICE INTERFACES
// ===================================================================

export interface AnalyticsServiceConfig {
  enable_real_time: boolean;
  batch_size: number;
  flush_interval: number; // ms
  privacy_mode: boolean;
  retention_days: number;
}

export interface AnalyticsQuery {
  user_id?: string;
  session_id?: string;
  event_types?: EventType[];
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
  aggregation?: 'hour' | 'day' | 'week' | 'month';
}

export interface AnalyticsResult<T> {
  data: T[];
  total_count: number;
  has_more: boolean;
  query_duration: number;
  cached: boolean;
}

// ===================================================================
// 🎯 DASHBOARD VISUALIZATION TYPES
// ===================================================================

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'percentage' | 'currency' | 'duration';
}

export interface ChartDataPoint {
  x: Date | string | number;
  y: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface DashboardChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'heatmap';
  data: ChartDataPoint[];
  config?: Record<string, any>;
}

export interface UserJourneyStep {
  step: string;
  users_entered: number;
  users_completed: number;
  conversion_rate: number;
  avg_time_spent: number;
}

export interface UserFunnel {
  name: string;
  steps: UserJourneyStep[];
  overall_conversion: number;
}

// ===================================================================
// 🔐 PRIVACY & COMPLIANCE
// ===================================================================

export interface PrivacySettings {
  data_collection_consent: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  personalization_consent: boolean;
  data_retention_preference: number; // days
  anonymize_data: boolean;
}

export interface DataExportRequest {
  user_id: string;
  export_type: 'full' | 'analytics_only' | 'personal_data_only';
  format: 'json' | 'csv' | 'pdf';
  date_range?: {
    start: Date;
    end: Date;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  completed_at?: Date;
  download_url?: string;
}

// ===================================================================
// 📈 PREDICTIVE ANALYTICS
// ===================================================================

export interface PredictiveModel {
  model_id: string;
  model_type: 'churn_prediction' | 'engagement_forecast' | 'ltv_prediction' | 'content_recommendation';
  confidence_score: number; // 0-100
  prediction_date: Date;
  valid_until: Date;
}

export interface ChurnPrediction extends PredictiveModel {
  churn_probability: number; // 0-100
  risk_factors: string[];
  recommended_actions: string[];
  days_to_predicted_churn: number;
}

export interface EngagementForecast extends PredictiveModel {
  predicted_engagement_score: number;
  trend_direction: 'increasing' | 'stable' | 'decreasing';
  key_influence_factors: string[];
}

// ===================================================================
// 🎮 REAL-TIME ANALYTICS EVENTS
// ===================================================================

export interface RealtimeAnalyticsUpdate {
  type: 'user_online' | 'user_offline' | 'new_session' | 'session_end' | 'event_batch';
  timestamp: Date;
  data: any;
}

export interface LiveAnalyticsMetrics {
  users_online: number;
  active_sessions: number;
  events_per_minute: number;
  top_pages: Array<{ page: string; views: number }>;
  top_events: Array<{ event: EventType; count: number }>;
  geographic_distribution: Record<string, number>;
  device_distribution: Record<string, number>;
}

// All interfaces are exported by default in TypeScript
// No need for explicit re-export since they're already exported above