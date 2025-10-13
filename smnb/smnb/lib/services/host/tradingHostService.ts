// TRADING HOST SERVICE
// Bloomberg-style NASDAQ-100 Analyst - Simplified Version

import { HostAgentService } from './hostAgentService';
import { EnhancedTradingPost } from '@/lib/services/livefeed/tradingEnrichmentAgent';
import { tradingAggregator } from '@/lib/services/livefeed/enhancedProcessingPipeline';
import { 
  BLOOMBERG_ANALYST_PERSONALITY, 
  TRADING_TONE_TEMPLATES,
  SECTOR_CORRELATION_GROUPS
} from './tradingHostConfig';
import { NewsItem } from '@/lib/types/hostAgent';
import { TickerSymbol } from '@/lib/services/livefeed/nasdaq100';

export class TradingHostService extends HostAgentService {
  private recentTickers: Map<TickerSymbol, { lastMentioned: Date; count: number }> = new Map();
  private sectorMomentum: Map<string, number> = new Map();
  
  constructor() {
    // Initialize with Bloomberg analyst personality
    super({
      personality: 'formal',
      verbosity: 'detailed',
      updateFrequency: 2000, // Faster updates for trading
      contextWindow: 10, // Track more context for correlations
      waterfallSpeed: 60, // Faster streaming for market data
      enableMockMode: false
    });
    
    console.log('📊 [TRADING HOST] Initializing Bloomberg-style analyst...');
    
    // Apply fast timing for rapid-fire delivery
    this.applyTimingPreset('fast');
    
    console.log('📊 [TRADING HOST] Bloomberg personality applied - faster streaming enabled');
  }
  
  /**
   * Process an enriched trading post with NASDAQ-100 analysis
   */
  async processTradingPost(post: EnhancedTradingPost): Promise<void> {
    if (!post.market_analysis?.companies?.length) {
      console.log('⏭️ [TRADING HOST] Skipping post with no company mentions');
      return;
    }
    
    console.log(`📊 [TRADING HOST] Processing post with ${post.market_analysis.companies.length} companies`);
    
    // Check if this is market-moving news
    const isMarketMoving = this.isMarketMovingNews(post);
    
    console.log(`📊 [TRADING HOST] Market-moving: ${isMarketMoving ? 'YES ⚡' : 'NO'}`);
    
    // Convert to NewsItem with trading context and custom prompt
    const newsItem = this.convertToTradingNewsItem(post);
    
    // Build custom prompt and inject it into metadata
    const customPrompt = this.buildTradingPrompt(newsItem, { market_analysis: post.market_analysis });
    newsItem.metadata = {
      ...newsItem.metadata,
      customPrompt, // Store custom prompt for base class to use
    };
    
    // Process via standard pipeline
    await this.processNewsItem(newsItem);
    
    // Track the post for stats
    this.handleTradingNarrationComplete(post);
  }
  
  /**
   * Determine if this is market-moving news
   */
  private isMarketMovingNews(post: EnhancedTradingPost): boolean {
    const { market_analysis } = post;
    
    // Check for high-impact indicators
    const hasHighImpactCompany = market_analysis.companies.some(c => 
      c.impactScore > 70 && c.confidence > 0.7
    );
    
    const hasVolatilitySignal = market_analysis.marketIndicators.volatility_signal;
    const hasEarningsNews = market_analysis.marketIndicators.earnings_related;
    const hasMultipleSectors = Object.keys(market_analysis.sectors).length > 2;
    
    // Check sentiment extremes
    const hasExtremeSentiment = market_analysis.companies.some(c =>
      c.sentiment === 'bullish' && c.confidence > 0.8 ||
      c.sentiment === 'bearish' && c.confidence > 0.8
    );
    
    return hasHighImpactCompany || hasVolatilitySignal || 
           hasEarningsNews || (hasMultipleSectors && hasExtremeSentiment);
  }
  
  /**
   * Convert trading post to NewsItem with enriched context
   */
  private convertToTradingNewsItem(post: EnhancedTradingPost): NewsItem {
    const topTickers = post.market_analysis.companies
      .slice(0, 5)
      .map(c => `$${c.ticker}`)
      .join(', ');
    
    return {
      id: post.id,
      title: `${topTickers}: ${post.title}`,
      content: post.selftext || post.title,
      author: post.author,
      platform: 'reddit' as const,
      timestamp: new Date(post.created_utc * 1000),
      url: post.url,
      subreddit: post.subreddit,
      engagement: {
        likes: post.score,
        comments: post.num_comments,
        shares: 0
      },
      hashtags: post.market_analysis.companies.map(c => c.ticker),
      // Store trading data in metadata - will also include customPrompt
      metadata: {
        market_analysis: post.market_analysis,
        time_series_data: post.time_series_data,
        correlation_flags: post.correlation_flags
      }
    };
  }
  
  /**
   * Build trading-specific prompt
   */
  private buildTradingPrompt(newsItem: NewsItem, post: { market_analysis: EnhancedTradingPost['market_analysis'] }): string {
    const { market_analysis } = post;
    
    // Get primary tickers
    const tickerDetails = market_analysis.companies
      .slice(0, 3)
      .map((c: EnhancedTradingPost['market_analysis']['companies'][0]) => {
        const tickerMetrics = tradingAggregator.getTickerMetrics(c.ticker);
        return `$${c.ticker}: ${c.sentiment} (${Math.round(c.confidence * 100)}% conf), Impact: ${c.impactScore}/100` +
               (tickerMetrics ? `, 30d mentions: ${tickerMetrics.aggregates.totalMentions}` : '');
      })
      .join('\n');
    
    // Identify affected sectors
    const sectorSummary = Object.entries(market_analysis.sectors)
      .map(([sector, data]: [string, { sentiment: number; mentions: number }]) => `${sector}: ${data.sentiment > 0 ? '↑' : '↓'} ${(Math.abs(data.sentiment) * 100).toFixed(0)}%`)
      .join(', ');
    
    // Check for correlations
    const correlatedTickers = this.findCorrelatedTickers(market_analysis.companies[0]?.ticker);
    
    // Determine alert type
    const alertType = this.determineAlertType(post);
    const alertPrefix = alertType in TRADING_TONE_TEMPLATES ? 
      TRADING_TONE_TEMPLATES[alertType as keyof typeof TRADING_TONE_TEMPLATES].prefix : '';
    
    // Get market context
    const signals = tradingAggregator.getTradingSignals();
    const marketContext = `Market: ${signals.marketSentiment.toUpperCase()}, Risk: ${signals.riskLevel.toUpperCase()}, Top Buys: ${signals.topBuys.slice(0, 3).map(b => `$${b.ticker}`).join(', ') || 'None'}`;
    
    return `${BLOOMBERG_ANALYST_PERSONALITY.systemPrompt}

CURRENT MARKET CONTEXT:
${marketContext}

${alertPrefix ? `Use this prefix: "${alertPrefix}"` : ''}

SOURCE DATA:
Title: ${newsItem.title}
Content: ${newsItem.content}
Engagement: ${newsItem.engagement.likes} upvotes, ${newsItem.engagement.comments} comments

TICKER ANALYSIS:
${tickerDetails}

SECTOR IMPACT:
${sectorSummary}

MARKET INDICATORS:
- Volatility: ${market_analysis.marketIndicators.volatility_signal ? 'YES' : 'NO'}
- Earnings: ${market_analysis.marketIndicators.earnings_related ? 'YES' : 'NO'}
- Regulatory: ${market_analysis.marketIndicators.regulatory_mention ? 'YES' : 'NO'}

TRADING SIGNAL: ${market_analysis.tradingSignals.momentum} (${market_analysis.tradingSignals.timeframe})
${correlatedTickers.length > 0 ? `CORRELATED: ${correlatedTickers.join(', ')}` : ''}

INSTRUCTIONS:
1. Lead with top ticker and movement/signal
2. Include specific numbers
3. Mention correlated tickers
4. Close with forward-looking implication
5. Bloomberg style: "$TICKER action catalyst"
`.trim();
  }
  
  /**
   * Determine alert type
   */
  private determineAlertType(post: { market_analysis: EnhancedTradingPost['market_analysis'] }): string {
    const { market_analysis } = post;
    
    if (market_analysis.marketIndicators.earnings_related) return 'earnings_alert';
    if (market_analysis.marketIndicators.volatility_signal) return 'market_moving';
    
    const sentiment = market_analysis.companies[0]?.sentiment;
    const confidence = market_analysis.companies[0]?.confidence || 0;
    
    if (sentiment === 'bullish' && confidence > 0.7) return 'bullish_signal';
    if (sentiment === 'bearish' && confidence > 0.7) return 'bearish_signal';
    if (Object.keys(market_analysis.sectors).length > 2) return 'sector_rotation';
    
    return 'technical_break';
  }
  
  /**
   * Find correlated tickers
   */
  private findCorrelatedTickers(primaryTicker?: TickerSymbol): string[] {
    if (!primaryTicker) return [];
    
    const correlated: Set<string> = new Set();
    
    for (const tickers of Object.values(SECTOR_CORRELATION_GROUPS)) {
      if (tickers.includes(primaryTicker)) {
        tickers.forEach(ticker => {
          if (ticker !== primaryTicker) {
            correlated.add(`$${ticker}`);
          }
        });
      }
    }
    
    return Array.from(correlated).slice(0, 3);
  }
  
  /**
   * Handle completed trading narration
   */
  private handleTradingNarrationComplete(post: EnhancedTradingPost): void {
    // Track mentioned tickers
    post.market_analysis.companies.forEach(company => {
      const existing = this.recentTickers.get(company.ticker) || { lastMentioned: new Date(), count: 0 };
      this.recentTickers.set(company.ticker, {
        lastMentioned: new Date(),
        count: existing.count + 1
      });
    });
    
    // Update sector momentum
    Object.entries(post.market_analysis.sectors).forEach(([sector, data]: [string, { sentiment: number; mentions: number }]) => {
      const current = this.sectorMomentum.get(sector) || 0;
      this.sectorMomentum.set(sector, current + data.sentiment);
    });
    
    // Clean up old ticker mentions (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000;
    this.recentTickers.forEach((data, ticker) => {
      if (data.lastMentioned.getTime() < oneHourAgo) {
        this.recentTickers.delete(ticker);
      }
    });
    
    console.log(`📊 [TRADING HOST] Active tickers: ${this.recentTickers.size}`);
  }
  
  /**
   * Get trading statistics
   */
  getTradingStats(): {
    activeTickers: number;
    topMentionedTickers: Array<{ ticker: TickerSymbol; count: number }>;
    sectorMomentum: Array<{ sector: string; momentum: number }>;
  } {
    const topTickers = Array.from(this.recentTickers.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([ticker, data]) => ({ ticker, count: data.count }));
    
    const sectors = Array.from(this.sectorMomentum.entries())
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 5)
      .map(([sector, momentum]) => ({ sector, momentum }));
    
    return {
      activeTickers: this.recentTickers.size,
      topMentionedTickers: topTickers,
      sectorMomentum: sectors
    };
  }
}

// Export singleton instance
export const tradingHostService = new TradingHostService();
