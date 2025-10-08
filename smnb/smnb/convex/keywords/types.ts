// KEYWORD EXTRACTION TYPES
// Enhanced types for Nasdaq-100 sentiment correlation

import { Doc } from "../_generated/dataModel";

/**
 * Configuration options for keyword extraction
 */
export interface KeywordExtractionOptions {
  // Extraction mode
  mode?: 'general' | 'financeFocused' | 'hybrid';
  
  // Finance-specific options
  includeFinanceEntities?: boolean;
  linkToTickers?: boolean;
  financeBoostFactor?: number; // Multiplier for finance-related keywords (default: 1.5)
  
  // Sentiment configuration
  minSentimentConfidence?: number; // Minimum confidence to use sentiment (0-1)
  
  // Frequency and window settings
  minFrequencyWindow?: number; // Minimum occurrences in window
  timeWindowMinutes?: number; // Time window for analysis (default: 60)
  maxKeywordsPerPost?: number; // Limit keywords per post (default: 25)
  
  // Relationship and co-occurrence
  relationshipDepth?: number; // How many levels of relationships (default: 1)
  
  // Weighting strategies
  subredditWeightingStrategy?: 'flat' | 'domainAuthority' | 'custom';
  engagementWeighting?: {
    scoreWeight?: number; // Default: 0.4
    commentWeight?: number; // Default: 0.4
    upvoteRatioWeight?: number; // Default: 0.2
  };
  
  // Deduplication and normalization
  dedupeStrategy?: 'lemma' | 'lowercase' | 'aggressive';
  
  // Phrase detection
  phraseDetection?: 'list' | 'collocationPMI' | 'nounPhrases';
  
  // Filter lists
  stoplist?: string[]; // Words to exclude
  allowlist?: string[]; // Words to always include
  
  // Output options
  returnOccurrences?: boolean; // Return detailed occurrence records
}

/**
 * Result of keyword extraction from a post
 */
export interface ExtractedKeyword {
  text: string;
  normalized: string;
  type: 'phrase' | 'entity' | 'topic' | 'hashtag';
  
  // Frequency in this context
  occurrences: number;
  
  // Finance mapping
  finance?: {
    tickers: string[];
    relevanceScore: number;
    entityIds: string[];
  };
  
  // Sentiment (if available)
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    confidence: number;
  };
  
  // Context
  inTitle?: boolean;
  inBody?: boolean;
  
  // Score
  extractionScore: number; // 0-1 confidence in extraction
}

/**
 * Occurrence record for detailed tracking
 */
export interface KeywordOccurrence {
  keyword: string;
  normalized_keyword: string;
  post_id: string;
  subreddit: string;
  occurrence_time: number;
  
  sentiment_snapshot: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    confidence: number;
  };
  
  engagement_weight: number;
  post_score: number;
  comment_count: number;
  upvote_ratio: number;
  
  mapped_tickers: string[];
  
  in_title?: boolean;
  in_body?: boolean;
}

/**
 * Finance entity resolution result
 */
export interface FinanceEntityMatch {
  entityId: string;
  entityType: 'ticker' | 'company' | 'executive' | 'product' | 'sector';
  canonicalSymbol: string;
  name: string;
  matchedAlias: string; // The alias that matched
  matchConfidence: number; // 0-1
  context: string; // Surrounding text for context verification
}

/**
 * Engagement weights calculation result
 */
export interface EngagementWeights {
  total: number;
  scoreComponent: number;
  commentComponent: number;
  upvoteRatioComponent: number;
  subredditMultiplier: number;
}

/**
 * Trend calculation result
 */
export interface TrendMetrics {
  velocity: number; // Rate of change
  acceleration: number; // Rate of change of velocity
  emaShort: number; // Short-term EMA
  emaLong: number; // Long-term EMA
  trendStatus: Doc<"keyword_trends">["trend_status"];
}

/**
 * Sentiment aggregation for a ticker
 */
export interface TickerSentiment {
  ticker: string;
  weightedSentiment: number; // -1 to 1
  confidence: number;
  totalMentions: number;
  engagementSum: number;
  velocity: number;
  acceleration: number;
}

/**
 * Index-level sentiment snapshot
 */
export interface IndexSentiment {
  timestamp: number;
  indexWeightedSentiment: number;
  breadth: number; // % positive
  dispersion: number; // Std dev
  regimeTag: 'bullish' | 'bearish' | 'uncertain' | 'low-signal';
  topContributors: Array<{
    ticker: string;
    contribution: number;
    sentiment: number;
  }>;
}

/**
 * Co-occurrence graph edge
 */
export interface KeywordGraphEdge {
  source: string;
  target: string;
  strength: number;
  coOccurrenceCount: number;
  pmiScore?: number;
  jaccardScore?: number;
  financeRelevanceScore?: number;
  sharedTickers?: string[];
}

/**
 * Default subreddit weights (domain authority)
 */
export const DEFAULT_SUBREDDIT_WEIGHTS: Record<string, number> = {
  // Finance/investing subreddits - highest authority for finance topics
  'wallstreetbets': 1.5,
  'stocks': 1.4,
  'investing': 1.4,
  'stockmarket': 1.3,
  'options': 1.3,
  'daytrading': 1.2,
  'cryptocurrency': 1.2,
  
  // Tech subreddits - high authority for tech stocks
  'technology': 1.3,
  'programming': 1.2,
  'artificial': 1.2,
  'machinelearning': 1.2,
  
  // News/general
  'news': 1.1,
  'worldnews': 1.1,
  'business': 1.2,
  
  // Default for others
  'default': 1.0
};

/**
 * Default extraction options
 */
export const DEFAULT_EXTRACTION_OPTIONS: Required<KeywordExtractionOptions> = {
  mode: 'hybrid',
  includeFinanceEntities: true,
  linkToTickers: true,
  financeBoostFactor: 1.5,
  minSentimentConfidence: 0.3,
  minFrequencyWindow: 2,
  timeWindowMinutes: 60,
  maxKeywordsPerPost: 25,
  relationshipDepth: 1,
  subredditWeightingStrategy: 'domainAuthority',
  engagementWeighting: {
    scoreWeight: 0.4,
    commentWeight: 0.4,
    upvoteRatioWeight: 0.2
  },
  dedupeStrategy: 'lowercase',
  phraseDetection: 'list',
  stoplist: [],
  allowlist: [],
  returnOccurrences: false
};
