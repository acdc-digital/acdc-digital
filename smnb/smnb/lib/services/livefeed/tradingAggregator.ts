// TRADING AGGREGATOR - 30-DAY ROLLING WINDOW ANALYSIS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/livefeed/tradingAggregator.ts

import { EnhancedTradingPost, TimeSeriesDataPoint } from './tradingEnrichmentAgent';
import { type TickerSymbol, SECTOR_MAPPING } from './nasdaq100';
import convex from '@/lib/convex/convex';
import { api } from '@/convex/_generated/api';

export interface TickerMetrics {
  ticker: TickerSymbol;
  dailyData: DayMetrics[];
  aggregates: {
    totalMentions: number;
    avgSentiment: number;
    weightedSentiment: number; // Volume-weighted
    momentumScore: number; // Trend direction
    volatilityIndex: number;
    last7DaySentiment: number;
    last24HourSentiment: number;
  };
  tradingSignal: {
    action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;
    reasons: string[];
    priceTargetTrend: 'bullish' | 'bearish' | 'neutral';
  };
}

export interface DayMetrics {
  date: Date;
  mentions: number;
  totalEngagement: number;
  avgVirality: number;
  sentiment: number; // -1 to 1
  posts: string[]; // Post IDs for reference
}

export interface SectorAnalysis {
  sector: string;
  tickers: TickerSymbol[];
  avgSentiment: number;
  totalMentions: number;
  momentum: 'accelerating' | 'stable' | 'decelerating';
  correlationStrength: number;
}

export interface TradingSignals {
  timestamp: Date;
  topBuys: Array<{ ticker: TickerSymbol; confidence: number; reasons: string[] }>;
  topSells: Array<{ ticker: TickerSymbol; confidence: number; reasons: string[] }>;
  watchlist: Array<{ ticker: TickerSymbol; reason: string }>;
  sectorOutlook: SectorAnalysis[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
}

export class TradingAggregator {
  private tickerData: Map<TickerSymbol, TickerMetrics>;
  private readonly windowDays: number = 30;
  private readonly minConfidence: number = 0.6;

  constructor() {
    this.tickerData = new Map();
  }

  /**
   * Add enriched trading posts to the 30-day rolling window
   */
  async addPosts(posts: EnhancedTradingPost[]): Promise<void> {
    console.log(`📊 TradingAggregator: Adding ${posts.length} posts to 30-day window...`);
    
    for (const post of posts) {
      // Store company mentions in database
      if (post.market_analysis.companies.length > 0) {
        try {
          await convex.mutation(api.trading.storeBatchCompanyMentions, {
            mentions: post.market_analysis.companies.map(company => ({
              post_id: post.id,
              ticker: company.ticker,
              confidence: company.confidence,
              mention_type: company.type,
              sentiment: company.sentiment,
              context: company.context,
              impact_score: company.impactScore,
              post_title: post.title,
              post_subreddit: post.subreddit,
              post_score: post.score,
              post_created_at: post.created_utc,
            })),
          });
        } catch (error) {
          // Use helper to detect transient errors
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error);
            if (message.includes('SystemTimeoutError') || message.includes('ExpiredInQueue') || message.includes('InternalServerError')) {
              console.warn(`⚠️ Failed to store company mentions for post ${post.id} (transient backend issue):`, error);
              return; // Don't throw, just warn
            }
          }
          console.error(`❌ Failed to store company mentions for post ${post.id}:`, error);
        }
      }
      
      // Add to in-memory time series
      for (const dataPoint of post.time_series_data) {
        this.addTimeSeriesPoint(dataPoint, post.id);
      }
    }
    
    // Cleanup old data outside the 30-day window
    this.pruneOldData();
    
    // Recalculate aggregates
    this.recalculateAggregates();
    
    // Persist time series and signals to database
    await this.persistToDatabase();
    
    console.log(`✅ TradingAggregator: Now tracking ${this.tickerData.size} tickers`);
  }

  private addTimeSeriesPoint(point: TimeSeriesDataPoint, postId: string): void {
    const { ticker } = point;
    
    if (!this.tickerData.has(ticker)) {
      this.tickerData.set(ticker, this.createEmptyTickerMetrics(ticker));
    }
    
    const metrics = this.tickerData.get(ticker)!;
    const dateKey = this.getDateKey(point.timestamp);
    
    // Find or create day metrics
    let dayMetrics = metrics.dailyData.find(d => this.getDateKey(d.date) === dateKey);
    
    if (!dayMetrics) {
      dayMetrics = {
        date: new Date(point.timestamp),
        mentions: 0,
        totalEngagement: 0,
        avgVirality: 0,
        sentiment: 0,
        posts: []
      };
      metrics.dailyData.push(dayMetrics);
      metrics.dailyData.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    // Update day metrics
    const prevMentions = dayMetrics.mentions;
    dayMetrics.mentions++;
    dayMetrics.totalEngagement += point.engagement;
    
    // Incremental average for virality and sentiment
    dayMetrics.avgVirality = (dayMetrics.avgVirality * prevMentions + point.virality) / dayMetrics.mentions;
    dayMetrics.sentiment = (dayMetrics.sentiment * prevMentions + point.sentiment) / dayMetrics.mentions;
    
    if (!dayMetrics.posts.includes(postId)) {
      dayMetrics.posts.push(postId);
    }
  }

  private pruneOldData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.windowDays);
    const cutoffTime = cutoffDate.getTime();
    
    for (const [ticker, metrics] of this.tickerData.entries()) {
      metrics.dailyData = metrics.dailyData.filter(d => d.date.getTime() >= cutoffTime);
      
      // Remove tickers with no recent data
      if (metrics.dailyData.length === 0) {
        this.tickerData.delete(ticker);
      }
    }
  }

  private recalculateAggregates(): void {
    for (const metrics of this.tickerData.values()) {
      const dailyData = metrics.dailyData;
      
      if (dailyData.length === 0) continue;
      
      // Total mentions
      const totalMentions = dailyData.reduce((sum, d) => sum + d.mentions, 0);
      
      // Average sentiment (simple)
      const avgSentiment = dailyData.reduce((sum, d) => sum + d.sentiment, 0) / dailyData.length;
      
      // Volume-weighted sentiment
      const weightedSentiment = dailyData.reduce((sum, d) => sum + (d.sentiment * d.mentions), 0) / totalMentions;
      
      // Momentum score (comparing recent vs older sentiment)
      const momentumScore = this.calculateMomentum(dailyData);
      
      // Volatility index (sentiment variance)
      const volatilityIndex = this.calculateVolatility(dailyData);
      
      // Last 7 days sentiment
      const last7Days = this.getRecentDays(dailyData, 7);
      const last7DaySentiment = last7Days.reduce((sum, d) => sum + d.sentiment, 0) / Math.max(1, last7Days.length);
      
      // Last 24 hours sentiment
      const last24Hours = this.getRecentHours(dailyData, 24);
      const last24HourSentiment = last24Hours.reduce((sum, d) => sum + d.sentiment, 0) / Math.max(1, last24Hours.length);
      
      metrics.aggregates = {
        totalMentions,
        avgSentiment,
        weightedSentiment,
        momentumScore,
        volatilityIndex,
        last7DaySentiment,
        last24HourSentiment
      };
      
      // Generate trading signal
      metrics.tradingSignal = this.generateTradingSignal(metrics);
    }
  }

  private calculateMomentum(dailyData: DayMetrics[]): number {
    if (dailyData.length < 7) return 0;
    
    // Split into recent half vs older half
    const midpoint = Math.floor(dailyData.length / 2);
    const olderHalf = dailyData.slice(0, midpoint);
    const recentHalf = dailyData.slice(midpoint);
    
    const olderAvg = olderHalf.reduce((sum, d) => sum + d.sentiment, 0) / olderHalf.length;
    const recentAvg = recentHalf.reduce((sum, d) => sum + d.sentiment, 0) / recentHalf.length;
    
    // Momentum is the difference (positive = improving sentiment)
    return recentAvg - olderAvg;
  }

  private calculateVolatility(dailyData: DayMetrics[]): number {
    if (dailyData.length < 2) return 0;
    
    const sentiments = dailyData.map(d => d.sentiment);
    const mean = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
    
    return Math.sqrt(variance);
  }

  private getRecentDays(dailyData: DayMetrics[], days: number): DayMetrics[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return dailyData.filter(d => d.date >= cutoffDate);
  }

  private getRecentHours(dailyData: DayMetrics[], hours: number): DayMetrics[] {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    return dailyData.filter(d => d.date >= cutoffDate);
  }

  private generateTradingSignal(metrics: TickerMetrics): TickerMetrics['tradingSignal'] {
    const { aggregates } = metrics;
    const reasons: string[] = [];
    let score = 0;
    let confidence = 0;
    
    // Factor 1: Current sentiment (40% weight)
    if (aggregates.weightedSentiment > 0.5) {
      score += 2;
      reasons.push('Strong positive sentiment');
      confidence += 0.4;
    } else if (aggregates.weightedSentiment > 0.2) {
      score += 1;
      reasons.push('Moderate positive sentiment');
      confidence += 0.2;
    } else if (aggregates.weightedSentiment < -0.5) {
      score -= 2;
      reasons.push('Strong negative sentiment');
      confidence += 0.4;
    } else if (aggregates.weightedSentiment < -0.2) {
      score -= 1;
      reasons.push('Moderate negative sentiment');
      confidence += 0.2;
    }
    
    // Factor 2: Momentum (30% weight)
    if (aggregates.momentumScore > 0.3) {
      score += 1.5;
      reasons.push('Accelerating positive momentum');
      confidence += 0.3;
    } else if (aggregates.momentumScore > 0.1) {
      score += 0.5;
      reasons.push('Positive momentum');
      confidence += 0.15;
    } else if (aggregates.momentumScore < -0.3) {
      score -= 1.5;
      reasons.push('Accelerating negative momentum');
      confidence += 0.3;
    } else if (aggregates.momentumScore < -0.1) {
      score -= 0.5;
      reasons.push('Negative momentum');
      confidence += 0.15;
    }
    
    // Factor 3: Volume (20% weight)
    if (aggregates.totalMentions > 50) {
      confidence += 0.2;
      reasons.push('High mention volume');
    } else if (aggregates.totalMentions > 20) {
      confidence += 0.1;
      reasons.push('Moderate mention volume');
    } else if (aggregates.totalMentions < 5) {
      confidence -= 0.1;
      reasons.push('Low mention volume');
    }
    
    // Factor 4: Volatility (10% weight - high volatility reduces confidence)
    if (aggregates.volatilityIndex > 0.5) {
      confidence -= 0.1;
      reasons.push('High sentiment volatility');
    }
    
    // Determine action based on score
    let action: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    let priceTargetTrend: 'bullish' | 'bearish' | 'neutral';
    
    if (score >= 3) {
      action = 'strong_buy';
      priceTargetTrend = 'bullish';
    } else if (score >= 1.5) {
      action = 'buy';
      priceTargetTrend = 'bullish';
    } else if (score <= -3) {
      action = 'strong_sell';
      priceTargetTrend = 'bearish';
    } else if (score <= -1.5) {
      action = 'sell';
      priceTargetTrend = 'bearish';
    } else {
      action = 'hold';
      priceTargetTrend = 'neutral';
    }
    
    // Confidence must be between 0 and 1
    confidence = Math.max(0, Math.min(1, confidence));
    
    return {
      action,
      confidence,
      reasons,
      priceTargetTrend
    };
  }

  private createEmptyTickerMetrics(ticker: TickerSymbol): TickerMetrics {
    return {
      ticker,
      dailyData: [],
      aggregates: {
        totalMentions: 0,
        avgSentiment: 0,
        weightedSentiment: 0,
        momentumScore: 0,
        volatilityIndex: 0,
        last7DaySentiment: 0,
        last24HourSentiment: 0
      },
      tradingSignal: {
        action: 'hold',
        confidence: 0,
        reasons: [],
        priceTargetTrend: 'neutral'
      }
    };
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get trading signals for all tracked tickers
   */
  getTradingSignals(): TradingSignals {
    const timestamp = new Date();
    const tickerMetrics = Array.from(this.tickerData.values());
    
    // Sort by confidence and action
    const buys = tickerMetrics
      .filter(m => m.tradingSignal.action === 'buy' || m.tradingSignal.action === 'strong_buy')
      .filter(m => m.tradingSignal.confidence >= this.minConfidence)
      .sort((a, b) => b.tradingSignal.confidence - a.tradingSignal.confidence)
      .slice(0, 10)
      .map(m => ({
        ticker: m.ticker,
        confidence: m.tradingSignal.confidence,
        reasons: m.tradingSignal.reasons
      }));
    
    const sells = tickerMetrics
      .filter(m => m.tradingSignal.action === 'sell' || m.tradingSignal.action === 'strong_sell')
      .filter(m => m.tradingSignal.confidence >= this.minConfidence)
      .sort((a, b) => b.tradingSignal.confidence - a.tradingSignal.confidence)
      .slice(0, 10)
      .map(m => ({
        ticker: m.ticker,
        confidence: m.tradingSignal.confidence,
        reasons: m.tradingSignal.reasons
      }));
    
    const watchlist = tickerMetrics
      .filter(m => m.tradingSignal.action === 'hold')
      .filter(m => Math.abs(m.aggregates.momentumScore) > 0.2 || m.aggregates.totalMentions > 30)
      .slice(0, 15)
      .map(m => ({
        ticker: m.ticker,
        reason: m.aggregates.momentumScore > 0.2 ? 'Building momentum' : 
                m.aggregates.momentumScore < -0.2 ? 'Losing momentum' : 
                'High volume activity'
      }));
    
    // Sector analysis
    const sectorOutlook = this.analyzeSectors();
    
    // Overall market sentiment
    const avgMarketSentiment = tickerMetrics.reduce((sum, m) => sum + m.aggregates.weightedSentiment, 0) / 
                               Math.max(1, tickerMetrics.length);
    const marketSentiment: 'bullish' | 'bearish' | 'neutral' = 
      avgMarketSentiment > 0.2 ? 'bullish' : 
      avgMarketSentiment < -0.2 ? 'bearish' : 'neutral';
    
    // Risk level based on volatility
    const avgVolatility = tickerMetrics.reduce((sum, m) => sum + m.aggregates.volatilityIndex, 0) / 
                         Math.max(1, tickerMetrics.length);
    const riskLevel: 'low' | 'medium' | 'high' = 
      avgVolatility > 0.5 ? 'high' : 
      avgVolatility > 0.3 ? 'medium' : 'low';
    
    return {
      timestamp,
      topBuys: buys,
      topSells: sells,
      watchlist,
      sectorOutlook,
      marketSentiment,
      riskLevel
    };
  }

  private analyzeSectors(): SectorAnalysis[] {
    const sectorData: Map<string, {
      tickers: TickerSymbol[];
      sentiments: number[];
      mentions: number;
      recentSentiment: number[];
      olderSentiment: number[];
    }> = new Map();
    
    // Aggregate by sector
    for (const metrics of this.tickerData.values()) {
      const sector = SECTOR_MAPPING[metrics.ticker];
      if (!sector) continue;
      
      if (!sectorData.has(sector)) {
        sectorData.set(sector, {
          tickers: [],
          sentiments: [],
          mentions: 0,
          recentSentiment: [],
          olderSentiment: []
        });
      }
      
      const data = sectorData.get(sector)!;
      data.tickers.push(metrics.ticker);
      data.sentiments.push(metrics.aggregates.weightedSentiment);
      data.mentions += metrics.aggregates.totalMentions;
      
      // Track recent vs older for momentum
      const recentDays = this.getRecentDays(metrics.dailyData, 7);
      const olderDays = metrics.dailyData.filter(d => !recentDays.includes(d));
      
      if (recentDays.length > 0) {
        data.recentSentiment.push(
          recentDays.reduce((sum, d) => sum + d.sentiment, 0) / recentDays.length
        );
      }
      if (olderDays.length > 0) {
        data.olderSentiment.push(
          olderDays.reduce((sum, d) => sum + d.sentiment, 0) / olderDays.length
        );
      }
    }
    
    // Calculate sector metrics
    const sectorAnalyses: SectorAnalysis[] = [];
    
    for (const [sector, data] of sectorData.entries()) {
      const avgSentiment = data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length;
      
      const recentAvg = data.recentSentiment.length > 0 ?
        data.recentSentiment.reduce((sum, s) => sum + s, 0) / data.recentSentiment.length : 0;
      const olderAvg = data.olderSentiment.length > 0 ?
        data.olderSentiment.reduce((sum, s) => sum + s, 0) / data.olderSentiment.length : 0;
      
      const momentumDiff = recentAvg - olderAvg;
      const momentum: 'accelerating' | 'stable' | 'decelerating' = 
        momentumDiff > 0.2 ? 'accelerating' :
        momentumDiff < -0.2 ? 'decelerating' : 'stable';
      
      // Correlation strength (how aligned the tickers are)
      const variance = data.sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / data.sentiments.length;
      const correlationStrength = 1 - Math.min(1, variance); // Lower variance = higher correlation
      
      sectorAnalyses.push({
        sector,
        tickers: data.tickers,
        avgSentiment,
        totalMentions: data.mentions,
        momentum,
        correlationStrength
      });
    }
    
    return sectorAnalyses.sort((a, b) => b.totalMentions - a.totalMentions);
  }

  /**
   * Export time series data for visualization/analysis
   */
  exportTimeSeriesData(ticker?: TickerSymbol): Array<{
    date: Date;
    ticker: TickerSymbol;
    mentions: number;
    sentiment: number;
    engagement: number;
    virality: number;
  }> {
    const data: Array<{
      date: Date;
      ticker: TickerSymbol;
      mentions: number;
      sentiment: number;
      engagement: number;
      virality: number;
    }> = [];
    
    const tickersToExport = ticker ? 
      [this.tickerData.get(ticker)].filter(Boolean) as TickerMetrics[] :
      Array.from(this.tickerData.values());
    
    for (const metrics of tickersToExport) {
      for (const day of metrics.dailyData) {
        data.push({
          date: day.date,
          ticker: metrics.ticker,
          mentions: day.mentions,
          sentiment: day.sentiment,
          engagement: day.totalEngagement,
          virality: day.avgVirality
        });
      }
    }
    
    return data.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get current state for a specific ticker
   */
  getTickerMetrics(ticker: TickerSymbol): TickerMetrics | null {
    return this.tickerData.get(ticker) || null;
  }

  /**
   * Get all tracked tickers
   */
  getAllTickers(): TickerSymbol[] {
    return Array.from(this.tickerData.keys());
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalTickers: number;
    totalDataPoints: number;
    avgDataPointsPerTicker: number;
    dateRange: { start: Date; end: Date } | null;
  } {
    const allDataPoints = Array.from(this.tickerData.values())
      .flatMap(m => m.dailyData);
    
    if (allDataPoints.length === 0) {
      return {
        totalTickers: 0,
        totalDataPoints: 0,
        avgDataPointsPerTicker: 0,
        dateRange: null
      };
    }
    
    const dates = allDataPoints.map(d => d.date.getTime());
    
    return {
      totalTickers: this.tickerData.size,
      totalDataPoints: allDataPoints.length,
      avgDataPointsPerTicker: allDataPoints.length / this.tickerData.size,
      dateRange: {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates))
      }
    };
  }

  /**
   * Persist current state to Convex database
   */
  private async persistToDatabase(): Promise<void> {
    try {
      // Persist time series data (daily aggregates)
      for (const metrics of this.tickerData.values()) {
        for (const dayData of metrics.dailyData) {
          try {
            await convex.mutation(api.trading.upsertTimeSeriesData, {
              ticker: metrics.ticker,
              date: this.getDateKey(dayData.date),
              mentions: dayData.mentions,
              total_engagement: dayData.totalEngagement,
              avg_virality: dayData.avgVirality,
              sentiment: dayData.sentiment,
              post_ids: dayData.posts,
            });
          } catch (error) {
            // Check for transient errors
            if (error && typeof error === 'object' && 'message' in error) {
              const message = String(error);
              if (message.includes('SystemTimeoutError') || message.includes('ExpiredInQueue') || message.includes('InternalServerError')) {
                console.warn(`⚠️ Failed to persist time series for ${metrics.ticker} (transient backend issue):`, error);
                continue; // Skip this ticker but continue processing
              }
            }
            console.error(`❌ Failed to persist time series for ${metrics.ticker}:`, error);
          }
        }
        
        // Persist trading signal
        try {
          const windowStart = metrics.dailyData.length > 0 
            ? this.getDateKey(metrics.dailyData[0].date)
            : this.getDateKey(new Date());
          const windowEnd = metrics.dailyData.length > 0
            ? this.getDateKey(metrics.dailyData[metrics.dailyData.length - 1].date)
            : this.getDateKey(new Date());
            
          await convex.mutation(api.trading.upsertTradingSignal, {
            ticker: metrics.ticker,
            total_mentions: metrics.aggregates.totalMentions,
            avg_sentiment: metrics.aggregates.avgSentiment,
            weighted_sentiment: metrics.aggregates.weightedSentiment,
            momentum_score: metrics.aggregates.momentumScore,
            volatility_index: metrics.aggregates.volatilityIndex,
            last_7day_sentiment: metrics.aggregates.last7DaySentiment,
            last_24hour_sentiment: metrics.aggregates.last24HourSentiment,
            signal_action: metrics.tradingSignal.action,
            signal_confidence: metrics.tradingSignal.confidence,
            signal_reasons: metrics.tradingSignal.reasons,
            price_target_trend: metrics.tradingSignal.priceTargetTrend,
            sector: SECTOR_MAPPING[metrics.ticker] || 'Unknown',
            data_points_count: metrics.dailyData.length,
            window_start_date: windowStart,
            window_end_date: windowEnd,
          });
        } catch (error) {
          // Check for transient errors
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error);
            if (message.includes('SystemTimeoutError') || message.includes('ExpiredInQueue') || message.includes('InternalServerError')) {
              console.warn(`⚠️ Failed to persist trading signal for ${metrics.ticker} (transient backend issue):`, error);
              continue; // Skip this ticker but continue processing
            }
          }
          console.error(`❌ Failed to persist trading signal for ${metrics.ticker}:`, error);
        }
      }
      
      console.log(`💾 Persisted trading data for ${this.tickerData.size} tickers to database`);
    } catch (error) {
      console.error('❌ Error persisting trading data to database:', error);
    }
  }
}

// Global singleton instance
export const tradingAggregator = new TradingAggregator();
