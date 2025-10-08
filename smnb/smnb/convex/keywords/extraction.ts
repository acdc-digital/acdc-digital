// ENHANCED KEYWORD EXTRACTION
// Finance-aware keyword extraction with Nasdaq-100 correlation

import { MutationCtx, QueryCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import {
  KeywordExtractionOptions,
  DEFAULT_EXTRACTION_OPTIONS,
  ExtractedKeyword,
  KeywordOccurrence
} from "./types";
import { resolveFinanceEntities } from "./financeKnowledgeBase";
import {
  calculateEngagementWeight,
  calculateFinanceRelevance,
  normalizeKeyword
} from "./utils";

/**
 * Enhanced keyword extraction from a post with finance awareness
 */
export async function extractKeywordsFromPostEnhanced(
  ctx: MutationCtx | QueryCtx,
  post: Doc<"live_feed_posts">,
  stats: Doc<"post_stats"> | undefined,
  options: Partial<KeywordExtractionOptions> = {}
): Promise<ExtractedKeyword[]> {
  // Merge with defaults
  const opts: KeywordExtractionOptions = { ...DEFAULT_EXTRACTION_OPTIONS, ...options };
  
  // Extract raw text
  const rawText = `${post.title || ''} ${post.selftext || ''}`;
  const normalizedText = rawText.toLowerCase();
  
  // Step 1: Collect keyword candidates
  const candidates: ExtractedKeyword[] = [];
  
  // Extract from existing stats if available
  if (stats?.keywords) {
    for (const keyword of stats.keywords) {
      candidates.push({
        text: keyword,
        normalized: normalizeKeyword(keyword, opts.dedupeStrategy),
        type: determineKeywordType(keyword),
        occurrences: 1,
        extractionScore: 0.7,
        inTitle: post.title.toLowerCase().includes(keyword.toLowerCase()),
        inBody: post.selftext.toLowerCase().includes(keyword.toLowerCase())
      });
    }
  }
  
  // Extract phrase patterns
  const phrases = extractPhrasePatterns(rawText, opts);
  for (const phrase of phrases) {
    candidates.push({
      text: phrase,
      normalized: normalizeKeyword(phrase, opts.dedupeStrategy),
      type: 'phrase',
      occurrences: countOccurrences(normalizedText, phrase.toLowerCase()),
      extractionScore: 0.8,
      inTitle: post.title.toLowerCase().includes(phrase.toLowerCase()),
      inBody: post.selftext.toLowerCase().includes(phrase.toLowerCase())
    });
  }
  
  // Step 2: Finance entity resolution
  let financeMatches: ReturnType<typeof resolveFinanceEntities> = [];
  if (opts.includeFinanceEntities) {
    financeMatches = resolveFinanceEntities(rawText);
    
    // Add finance entities as candidates
    for (const match of financeMatches) {
      candidates.push({
        text: match.matchedText,
        normalized: normalizeKeyword(match.ticker, opts.dedupeStrategy),
        type: 'entity',
        occurrences: 1,
        finance: {
          tickers: [match.ticker],
          relevanceScore: match.confidence,
          entityIds: [match.ticker]
        },
        extractionScore: match.confidence,
        inTitle: match.position < post.title.length,
        inBody: match.position >= post.title.length
      });
    }
  }
  
  // Step 3: Score and filter candidates
  const engagementWeights = calculateEngagementWeight(post, opts);
  
  // Merge duplicates and boost scores
  const merged = mergeCandidates(candidates, financeMatches, opts);
  
  // Apply finance boost
  for (const candidate of merged) {
    if (candidate.finance && opts.financeBoostFactor) {
      candidate.extractionScore *= opts.financeBoostFactor;
    }
  }
  
  // Sort by extraction score
  merged.sort((a, b) => b.extractionScore - a.extractionScore);
  
  // Limit results
  const limited = merged.slice(0, opts.maxKeywordsPerPost);
  
  // Step 4: Enrich with sentiment if available
  if (stats?.sentiment && stats.sentiment_confidence && 
      stats.sentiment_confidence >= (opts.minSentimentConfidence || 0)) {
    const sentimentSnapshot = mapSentiment(stats.sentiment, stats.sentiment_confidence);
    for (const keyword of limited) {
      keyword.sentiment = sentimentSnapshot;
    }
  }
  
  return limited;
}

/**
 * Extract phrase patterns from text
 */
function extractPhrasePatterns(text: string, opts: KeywordExtractionOptions): string[] {
  const phrases: string[] = [];
  const normalized = text.toLowerCase();
  
  // Define domain-specific phrase patterns
  const patterns = [
    // Financial phrases
    'stock market', 'bull market', 'bear market', 'market crash',
    'earnings report', 'quarterly earnings', 'revenue growth', 'profit margin',
    'market cap', 'price target', 'buy rating', 'sell rating',
    'all time high', 'all time low', 'stock split', 'dividend yield',
    
    // Technology phrases
    'artificial intelligence', 'machine learning', 'deep learning',
    'cloud computing', 'data science', 'software engineering',
    'web development', 'mobile app', 'neural network',
    
    // Mental health patterns
    'mental health', 'therapy session', 'anxiety disorder', 'panic attack',
    'depression treatment', 'coping mechanisms', 'emotional support',
    
    // Productivity patterns
    'time management', 'productivity tips', 'daily routine', 'habit formation',
    'goal setting', 'work life balance'
  ];
  
  // Check for allowlist patterns
  if (opts.allowlist && opts.allowlist.length > 0) {
    patterns.push(...opts.allowlist);
  }
  
  // Extract matching phrases
  for (const pattern of patterns) {
    if (normalized.includes(pattern.toLowerCase())) {
      // Check stoplist
      if (opts.stoplist && opts.stoplist.includes(pattern)) {
        continue;
      }
      phrases.push(pattern);
    }
  }
  
  return phrases;
}

/**
 * Determine keyword type
 */
function determineKeywordType(keyword: string): ExtractedKeyword["type"] {
  // Check if it looks like a ticker (all caps, 2-5 chars)
  if (/^[A-Z]{2,5}$/.test(keyword)) {
    return 'entity'; // Map ticker to entity type
  }
  
  // Check if it has multiple words
  if (keyword.includes(' ')) {
    return 'phrase';
  }
  
  // Check for hashtag
  if (keyword.startsWith('#')) {
    return 'hashtag';
  }
  
  // Check for subreddit
  if (keyword.startsWith('r/')) {
    return 'topic';
  }
  
  // Default to topic
  return 'topic';
}

/**
 * Count occurrences of a pattern in text
 */
function countOccurrences(text: string, pattern: string): number {
  if (!pattern) return 0;
  
  let count = 0;
  let pos = 0;
  
  while ((pos = text.indexOf(pattern, pos)) !== -1) {
    count++;
    pos += pattern.length;
  }
  
  return count;
}

/**
 * Merge duplicate candidates and boost finance-related ones
 */
function mergeCandidates(
  candidates: ExtractedKeyword[],
  financeMatches: ReturnType<typeof resolveFinanceEntities>,
  opts: KeywordExtractionOptions
): ExtractedKeyword[] {
  const merged = new Map<string, ExtractedKeyword>();
  
  for (const candidate of candidates) {
    const key = candidate.normalized;
    
    if (!merged.has(key)) {
      merged.set(key, { ...candidate });
    } else {
      const existing = merged.get(key)!;
      
      // Merge occurrences
      existing.occurrences += candidate.occurrences;
      
      // Take highest extraction score
      existing.extractionScore = Math.max(existing.extractionScore, candidate.extractionScore);
      
      // Merge finance data
      if (candidate.finance) {
        if (!existing.finance) {
          existing.finance = candidate.finance;
        } else {
          // Merge tickers
          const allTickers = new Set([
            ...existing.finance.tickers,
            ...candidate.finance.tickers
          ]);
          existing.finance.tickers = Array.from(allTickers);
          
          // Take highest relevance
          existing.finance.relevanceScore = Math.max(
            existing.finance.relevanceScore,
            candidate.finance.relevanceScore
          );
        }
      }
      
      // Merge position flags
      existing.inTitle = existing.inTitle || candidate.inTitle;
      existing.inBody = existing.inBody || candidate.inBody;
    }
  }
  
  // Calculate finance relevance for all keywords
  for (const [key, keyword] of merged.entries()) {
    const mappedTickers = keyword.finance?.tickers || [];
    const financeRelevance = calculateFinanceRelevance(keyword.text, mappedTickers, opts);
    
    if (financeRelevance > 0) {
      if (!keyword.finance) {
        keyword.finance = {
          tickers: mappedTickers,
          relevanceScore: financeRelevance,
          entityIds: []
        };
      } else {
        keyword.finance.relevanceScore = Math.max(
          keyword.finance.relevanceScore,
          financeRelevance
        );
      }
    }
  }
  
  return Array.from(merged.values());
}

/**
 * Map sentiment from post_stats to keyword sentiment format
 */
function mapSentiment(
  sentiment: string,
  confidence: number
): ExtractedKeyword["sentiment"] {
  const result = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
    confidence
  };
  
  switch (sentiment) {
    case 'positive':
      result.positive = 1;
      break;
    case 'negative':
      result.negative = 1;
      break;
    case 'neutral':
      result.neutral = 1;
      break;
    default:
      result.mixed = 1;
  }
  
  return result;
}

/**
 * Create occurrence records for detailed tracking
 */
export async function recordKeywordOccurrences(
  ctx: MutationCtx,
  post: Doc<"live_feed_posts">,
  keywords: ExtractedKeyword[],
  engagementWeight: number
): Promise<void> {
  const now = Date.now();
  
  for (const keyword of keywords) {
    const occurrence: Omit<Doc<"keyword_occurrences">, "_id" | "_creationTime"> = {
      keyword_id: keyword.normalized,
      post_id: post.id,
      subreddit: post.subreddit,
      occurrence_time: post.created_utc * 1000, // Convert to ms
      
      sentiment_snapshot: keyword.sentiment || {
        positive: 0,
        negative: 0,
        neutral: 1,
        mixed: 0,
        confidence: 0
      },
      
      engagement_weight: engagementWeight,
      post_score: post.score,
      comment_count: post.num_comments,
      upvote_ratio: post.upvote_ratio,
      
      mapped_tickers: keyword.finance?.tickers || [],
      
      in_title: keyword.inTitle,
      in_body: keyword.inBody,
      
      created_at: now
    };
    
    await ctx.db.insert("keyword_occurrences", occurrence);
  }
}

/**
 * Upsert keyword to keyword_trends table
 */
export async function upsertKeywordTrend(
  ctx: MutationCtx,
  keyword: ExtractedKeyword,
  post: Doc<"live_feed_posts">,
  engagementWeight: number
): Promise<void> {
  const normalized = keyword.normalized;
  const now = Date.now();
  
  // Check if keyword exists
  const existing = await ctx.db
    .query("keyword_trends")
    .withIndex("by_keyword", (q) => q.eq("normalized_keyword", normalized))
    .first();
  
  if (existing) {
    // Update existing keyword
    const updates: Partial<Doc<"keyword_trends">> = {
      total_occurrences: existing.total_occurrences + keyword.occurrences,
      unique_posts_count: existing.unique_posts_count + 1,
      last_seen_at: now,
      updated_at: now,
      last_processed_at: now
    };
    
    // Update finance fields
    if (keyword.finance) {
      updates.mapped_tickers = Array.from(new Set([
        ...(existing.mapped_tickers || []),
        ...keyword.finance.tickers
      ]));
      updates.finance_relevance_score = Math.max(
        existing.finance_relevance_score || 0,
        keyword.finance.relevanceScore
      );
    }
    
    // Update sentiment
    if (keyword.sentiment) {
      const totalOccurrences = updates.total_occurrences || existing.total_occurrences;
      const weight = 1 / totalOccurrences; // Weight new sentiment
      
      updates.sentiment_scores = {
        positive: existing.sentiment_scores.positive * (1 - weight) + keyword.sentiment.positive * weight,
        negative: existing.sentiment_scores.negative * (1 - weight) + keyword.sentiment.negative * weight,
        neutral: existing.sentiment_scores.neutral * (1 - weight) + keyword.sentiment.neutral * weight,
        mixed: existing.sentiment_scores.mixed * (1 - weight) + keyword.sentiment.mixed * weight
      };
      
      // Update dominant sentiment
      const maxScore = Math.max(
        updates.sentiment_scores.positive,
        updates.sentiment_scores.negative,
        updates.sentiment_scores.neutral,
        updates.sentiment_scores.mixed
      );
      
      if (maxScore === updates.sentiment_scores.positive) {
        updates.dominant_sentiment = 'positive';
      } else if (maxScore === updates.sentiment_scores.negative) {
        updates.dominant_sentiment = 'negative';
      } else if (maxScore === updates.sentiment_scores.neutral) {
        updates.dominant_sentiment = 'neutral';
      } else {
        updates.dominant_sentiment = 'mixed';
      }
    }
    
    // Update engagement scores
    updates.total_engagement_score = existing.total_engagement_score + engagementWeight;
    updates.avg_post_score = (existing.avg_post_score * existing.unique_posts_count + post.score) / 
                             (existing.unique_posts_count + 1);
    updates.avg_comment_count = (existing.avg_comment_count * existing.unique_posts_count + post.num_comments) / 
                                (existing.unique_posts_count + 1);
    
    // Update subreddit tracking
    const existingSubreddits = existing.top_subreddits || [];
    const subredditIndex = existingSubreddits.findIndex(s => s.subreddit === post.subreddit);
    
    if (subredditIndex >= 0) {
      existingSubreddits[subredditIndex].count++;
      existingSubreddits[subredditIndex].avg_score = 
        (existingSubreddits[subredditIndex].avg_score * (existingSubreddits[subredditIndex].count - 1) + post.score) /
        existingSubreddits[subredditIndex].count;
    } else {
      existingSubreddits.push({
        subreddit: post.subreddit,
        count: 1,
        avg_score: post.score
      });
    }
    
    // Sort and limit to top 10
    existingSubreddits.sort((a, b) => b.count - a.count);
    updates.top_subreddits = existingSubreddits.slice(0, 10);
    
    // Update source posts (keep last 50)
    const sourcePosts = existing.source_post_ids || [];
    sourcePosts.push(post.id);
    updates.source_post_ids = sourcePosts.slice(-50);
    
    await ctx.db.patch(existing._id, updates);
  } else {
    // Create new keyword
    const newKeyword: Omit<Doc<"keyword_trends">, "_id" | "_creationTime"> = {
      keyword: keyword.text,
      normalized_keyword: normalized,
      keyword_type: keyword.type,
      
      total_occurrences: keyword.occurrences,
      unique_posts_count: 1,
      first_seen_at: now,
      last_seen_at: now,
      peak_occurrence_time: now,
      
      avg_post_score: post.score,
      avg_comment_count: post.num_comments,
      avg_upvote_ratio: post.upvote_ratio,
      total_engagement_score: engagementWeight,
      viral_coefficient: 0,
      
      primary_category: "general",
      secondary_categories: [],
      related_keywords: [],
      
      sentiment_scores: keyword.sentiment || {
        positive: 0,
        negative: 0,
        neutral: 1,
        mixed: 0
      },
      dominant_sentiment: keyword.sentiment ? 
        (keyword.sentiment.positive > 0.5 ? 'positive' : 
         keyword.sentiment.negative > 0.5 ? 'negative' : 'neutral') : 
        'neutral',
      sentiment_confidence: keyword.sentiment?.confidence || 0,
      
      top_subreddits: [{
        subreddit: post.subreddit,
        count: 1,
        avg_score: post.score
      }],
      source_post_ids: [post.id],
      
      trend_status: "emerging",
      trend_velocity: 0,
      trend_acceleration: 0,
      
      performance_tier: "avg",
      
      llm_processed: false,
      
      mapped_tickers: keyword.finance?.tickers || [],
      finance_relevance_score: keyword.finance?.relevanceScore || 0,
      
      created_at: now,
      updated_at: now,
      last_processed_at: now,
      processing_version: 1
    };
    
    await ctx.db.insert("keyword_trends", newKeyword);
  }
}
