// KEYWORD EXTRACTION UTILITIES
// Helper functions for engagement, sentiment, and trend calculations

import { Doc } from "../_generated/dataModel";
import { KeywordExtractionOptions, DEFAULT_SUBREDDIT_WEIGHTS, EngagementWeights, TrendMetrics } from "./types";

/**
 * Calculate engagement weight for a post
 */
export function calculateEngagementWeight(
  post: Doc<"live_feed_posts">,
  options: KeywordExtractionOptions
): EngagementWeights {
  const weights = options.engagementWeighting || {
    scoreWeight: 0.4,
    commentWeight: 0.4,
    upvoteRatioWeight: 0.2
  };
  
  // Normalize score (log scale for Reddit scores which can be huge)
  const normalizedScore = Math.log10(Math.max(1, post.score)) / 5; // Divide by 5 to get 0-1 range for scores up to 100k
  
  // Normalize comments (log scale)
  const normalizedComments = Math.log10(Math.max(1, post.num_comments)) / 4; // Divide by 4 for 0-1 range
  
  // Upvote ratio is already 0-1
  const normalizedUpvoteRatio = post.upvote_ratio;
  
  // Calculate weighted components
  const scoreComponent = normalizedScore * (weights.scoreWeight || 0.4);
  const commentComponent = normalizedComments * (weights.commentWeight || 0.4);
  const upvoteRatioComponent = normalizedUpvoteRatio * (weights.upvoteRatioWeight || 0.2);
  
  // Get subreddit multiplier
  const subredditMultiplier = getSubredditWeight(
    post.subreddit,
    options.subredditWeightingStrategy || 'domainAuthority'
  );
  
  const baseTotal = scoreComponent + commentComponent + upvoteRatioComponent;
  const total = baseTotal * subredditMultiplier;
  
  return {
    total,
    scoreComponent,
    commentComponent,
    upvoteRatioComponent,
    subredditMultiplier
  };
}

/**
 * Get subreddit weight based on strategy
 */
export function getSubredditWeight(
  subreddit: string,
  strategy: 'flat' | 'domainAuthority' | 'custom'
): number {
  if (strategy === 'flat') {
    return 1.0;
  }
  
  if (strategy === 'domainAuthority') {
    const subredditLower = subreddit.toLowerCase();
    return DEFAULT_SUBREDDIT_WEIGHTS[subredditLower] || DEFAULT_SUBREDDIT_WEIGHTS['default'];
  }
  
  // Custom strategy could be implemented here
  return 1.0;
}

/**
 * Calculate composite finance relevance score
 */
export function calculateFinanceRelevance(
  keyword: string,
  mappedTickers: string[],
  options: KeywordExtractionOptions
): number {
  // Base relevance from having ticker mappings
  const hasTickerMapping = mappedTickers.length > 0;
  let relevance = hasTickerMapping ? 0.7 : 0.0;
  
  // Boost if multiple tickers (indicates financial context)
  if (mappedTickers.length > 1) {
    relevance += 0.15;
  }
  
  // Check if keyword itself is a known financial term
  const financialTerms = new Set([
    'stock', 'stocks', 'market', 'trading', 'investor', 'investment',
    'earnings', 'revenue', 'profit', 'loss', 'dividend', 'eps',
    'bull', 'bear', 'rally', 'crash', 'volatility', 'options',
    'calls', 'puts', 'hedge', 'portfolio', 'nasdaq', 'dow',
    'sp500', 's&p', 'index', 'futures', 'commodity', 'forex'
  ]);
  
  const keywordLower = keyword.toLowerCase();
  if (financialTerms.has(keywordLower)) {
    relevance += 0.15;
  }
  
  // Check for financial phrase patterns
  const financialPhrases = [
    'price target', 'market cap', 'stock price', 'share price',
    'q1 earnings', 'q2 earnings', 'q3 earnings', 'q4 earnings',
    'buy rating', 'sell rating', 'analyst rating', 'fair value',
    'all time high', 'ath', 'all time low', 'atl'
  ];
  
  for (const phrase of financialPhrases) {
    if (keywordLower.includes(phrase)) {
      relevance += 0.1;
      break;
    }
  }
  
  // Cap at 1.0
  return Math.min(relevance, 1.0);
}

/**
 * Calculate velocity (rate of change in occurrences)
 */
export function calculateVelocity(
  currentCount: number,
  previousCount: number
): number {
  if (previousCount === 0) {
    return currentCount > 0 ? 1.0 : 0.0;
  }
  
  return (currentCount - previousCount) / previousCount;
}

/**
 * Calculate acceleration (rate of change of velocity)
 */
export function calculateAcceleration(
  currentVelocity: number,
  previousVelocity: number
): number {
  return currentVelocity - previousVelocity;
}

/**
 * Determine trend status based on velocity and acceleration
 */
export function calculateTrendStatus(
  totalOccurrences: number,
  velocity: number,
  acceleration: number,
  existingStatus?: Doc<"keyword_trends">["trend_status"]
): Doc<"keyword_trends">["trend_status"] {
  const MIN_EMERGE = 5; // Minimum occurrences to be "emerging"
  
  // Dormant: No recent activity
  if (totalOccurrences === 0) {
    return "dormant";
  }
  
  // Emerging: New keyword with momentum
  if (totalOccurrences >= MIN_EMERGE && velocity > 0.5) {
    return "emerging";
  }
  
  // Rising: Positive velocity and acceleration
  if (velocity > 0.2 && acceleration > 0) {
    return "rising";
  }
  
  // Peak: Near-zero velocity with high occurrences
  if (Math.abs(velocity) <= 0.1 && totalOccurrences > MIN_EMERGE * 2) {
    return "peak";
  }
  
  // Declining: Negative velocity
  if (velocity < -0.25) {
    return "declining";
  }
  
  // Stable: Default for consistent presence
  if (totalOccurrences >= MIN_EMERGE) {
    return "stable";
  }
  
  // Default to existing status or dormant
  return existingStatus || "dormant";
}

/**
 * Calculate exponential moving average
 */
export function calculateEMA(
  currentValue: number,
  previousEMA: number,
  periods: number
): number {
  const alpha = 2 / (periods + 1);
  return (currentValue * alpha) + (previousEMA * (1 - alpha));
}

/**
 * Calculate trend metrics with EMA
 */
export function calculateTrendMetrics(
  currentCount: number,
  previousCount: number,
  previousVelocity: number,
  previousEmaShort: number,
  previousEmaLong: number,
  shortPeriod: number = 5,
  longPeriod: number = 20
): TrendMetrics {
  // Calculate velocity and acceleration
  const velocity = calculateVelocity(currentCount, previousCount);
  const acceleration = calculateAcceleration(velocity, previousVelocity);
  
  // Calculate EMAs
  const emaShort = calculateEMA(currentCount, previousEmaShort, shortPeriod);
  const emaLong = calculateEMA(currentCount, previousEmaLong, longPeriod);
  
  // Determine trend status
  const trendStatus = calculateTrendStatus(currentCount, velocity, acceleration);
  
  return {
    velocity,
    acceleration,
    emaShort,
    emaLong,
    trendStatus
  };
}

/**
 * Aggregate sentiment scores with confidence weighting
 */
export function aggregateSentiment(
  sentiments: Array<{
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    confidence: number;
    weight?: number;
  }>
): {
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  avgConfidence: number;
  weightedScore: number; // -1 to 1
} {
  if (sentiments.length === 0) {
    return {
      positive: 0,
      negative: 0,
      neutral: 1,
      mixed: 0,
      avgConfidence: 0,
      weightedScore: 0
    };
  }
  
  let totalWeight = 0;
  let weightedPositive = 0;
  let weightedNegative = 0;
  let weightedNeutral = 0;
  let weightedMixed = 0;
  let totalConfidence = 0;
  
  for (const sentiment of sentiments) {
    const weight = (sentiment.weight || 1) * sentiment.confidence;
    totalWeight += weight;
    
    weightedPositive += sentiment.positive * weight;
    weightedNegative += sentiment.negative * weight;
    weightedNeutral += sentiment.neutral * weight;
    weightedMixed += sentiment.mixed * weight;
    totalConfidence += sentiment.confidence;
  }
  
  if (totalWeight === 0) {
    return {
      positive: 0,
      negative: 0,
      neutral: 1,
      mixed: 0,
      avgConfidence: 0,
      weightedScore: 0
    };
  }
  
  const positive = weightedPositive / totalWeight;
  const negative = weightedNegative / totalWeight;
  const neutral = weightedNeutral / totalWeight;
  const mixed = weightedMixed / totalWeight;
  const avgConfidence = totalConfidence / sentiments.length;
  
  // Calculate weighted score: -1 (very negative) to +1 (very positive)
  const weightedScore = positive - negative;
  
  return {
    positive,
    negative,
    neutral,
    mixed,
    avgConfidence,
    weightedScore
  };
}

/**
 * Calculate performance tier based on composite metrics
 */
export function calculatePerformanceTier(
  engagementScore: number,
  sentimentMagnitude: number,
  velocity: number,
  uniquePosts: number
): Doc<"keyword_trends">["performance_tier"] {
  // Z-score normalization (simplified - would use population stats in production)
  const zEngagement = (engagementScore - 50) / 20; // Assume mean=50, std=20
  const zSentiment = sentimentMagnitude / 0.3; // Assume typical magnitude around 0.3
  const zVelocity = velocity / 0.5; // Assume typical velocity around 0.5
  const zPosts = (uniquePosts - 10) / 5; // Assume mean=10, std=5
  
  const composite = zEngagement + zSentiment + zVelocity + zPosts;
  
  if (composite >= 2.0) return "elite";
  if (composite >= 1.5) return "excel";
  if (composite >= 1.0) return "veryGood";
  if (composite >= 0.5) return "good";
  if (composite >= 0) return "avgPlus";
  if (composite >= -0.5) return "avg";
  if (composite >= -1.0) return "avgMinus";
  if (composite >= -1.5) return "poor";
  if (composite >= -2.0) return "veryPoor";
  return "critical";
}

/**
 * Calculate PMI (Pointwise Mutual Information) for co-occurrence
 */
export function calculatePMI(
  coOccurrenceCount: number,
  keyword1Count: number,
  keyword2Count: number,
  totalDocuments: number
): number {
  if (coOccurrenceCount === 0) return 0;
  
  const pXY = coOccurrenceCount / totalDocuments;
  const pX = keyword1Count / totalDocuments;
  const pY = keyword2Count / totalDocuments;
  
  if (pX === 0 || pY === 0) return 0;
  
  return Math.log2(pXY / (pX * pY));
}

/**
 * Calculate Jaccard similarity for co-occurrence
 */
export function calculateJaccard(
  coOccurrenceCount: number,
  keyword1Count: number,
  keyword2Count: number
): number {
  const union = keyword1Count + keyword2Count - coOccurrenceCount;
  if (union === 0) return 0;
  
  return coOccurrenceCount / union;
}

/**
 * Normalize keyword text
 */
export function normalizeKeyword(
  keyword: string,
  strategy: 'lemma' | 'lowercase' | 'aggressive' = 'lowercase'
): string {
  let normalized = keyword.trim();
  
  if (strategy === 'lowercase' || strategy === 'aggressive') {
    normalized = normalized.toLowerCase();
  }
  
  if (strategy === 'aggressive') {
    // Remove punctuation except hyphens within words
    normalized = normalized.replace(/[^\w\s-]/g, '');
    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ');
  }
  
  return normalized;
}
