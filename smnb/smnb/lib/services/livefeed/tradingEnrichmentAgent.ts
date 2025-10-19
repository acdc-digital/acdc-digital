// TRADING ENRICHMENT AGENT - NASDAQ-100 ANALYSIS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/livefeed/tradingEnrichmentAgent.ts

import { EnhancedRedditPost } from '@/lib/types/enhancedRedditPost';
import { NASDAQ_100_COMPANIES, SECTOR_MAPPING, INDUSTRY_RELATIONSHIPS, type TickerSymbol } from './nasdaq100';
import { enrichmentAgent } from './enrichmentAgent';

export interface CompanyMention {
  ticker: TickerSymbol;
  confidence: number; // 0-1 confidence score
  type: 'direct' | 'indirect' | 'sector' | 'competitor';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  context: string; // Surrounding text for context
  impactScore: number; // 0-100 potential market impact
}

export interface MarketSignals {
  companies: CompanyMention[];
  sectors: Record<string, {
    sentiment: number; // -1 to 1
    mentions: number;
  }>;
  marketIndicators: {
    volatility_signal: boolean;
    earnings_related: boolean;
    regulatory_mention: boolean;
    innovation_signal: boolean;
    supply_chain_impact: boolean;
  };
  tradingSignals: {
    momentum: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    timeframe: '1d' | '7d' | '30d';
    confidence: number;
  };
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  ticker: TickerSymbol;
  sentiment: number;
  volume: number; // Number of mentions
  engagement: number; // Upvotes + comments
  virality: number; // Rate of spread
}

export interface EnhancedTradingPost extends EnhancedRedditPost {
  market_analysis: MarketSignals;
  time_series_data: TimeSeriesDataPoint[];
  correlation_flags: string[]; // Related events/companies that might be affected
  aggregate_ready: boolean; // Flag for 30-day aggregation
  financial_sentiment: number; // -1 to 1
}

export class TradingEnrichmentAgent {
  /**
   * Enriches posts with both standard enrichment AND NASDAQ-100 trading analysis
   */
  async processRawPosts(rawPosts: EnhancedRedditPost[]): Promise<EnhancedTradingPost[]> {
    console.log(`💹 TradingEnrichmentAgent: Processing ${rawPosts.length} posts for NASDAQ-100 analysis...`);
    
    // First, run standard enrichment
    const standardEnriched = await enrichmentAgent.processRawPosts(rawPosts);
    
    // Then add trading-specific enrichment
    const tradingEnriched: EnhancedTradingPost[] = [];
    
    for (const post of standardEnriched) {
      try {
        const enhanced = await this.enrichSingleTradingPost(post);
        tradingEnriched.push(enhanced);
      } catch (error) {
        console.error('Error in trading enrichment:', error);
        tradingEnriched.push(this.createBasicTradingEnhancement(post));
      }
    }
    
    // Batch process for cross-company correlations
    this.detectCrossCompanyCorrelations(tradingEnriched);
    
    console.log(`✅ TradingEnrichmentAgent: Enriched ${tradingEnriched.length} posts with market analysis`);
    return tradingEnriched;
  }

  private async enrichSingleTradingPost(post: EnhancedRedditPost): Promise<EnhancedTradingPost> {
    const textToAnalyze = `${post.title} ${post.selftext || ''} ${post.url || ''}`.toLowerCase();
    
    // 1. Detect company mentions
    const companyMentions = this.detectCompanyMentions(textToAnalyze, post);
    
    // 2. Analyze market signals
    const marketSignals = this.analyzeMarketSignals(textToAnalyze, companyMentions);
    
    // 3. Calculate sentiment with financial context
    const financial_sentiment = this.calculateFinancialSentiment(textToAnalyze);
    
    // 4. Generate time series data points
    const timeSeriesData = this.generateTimeSeriesData(post, companyMentions, financial_sentiment);
    
    // 5. Identify correlation flags
    const correlationFlags = this.identifyCorrelations(textToAnalyze, companyMentions);
    
    return {
      ...post,
      market_analysis: marketSignals,
      time_series_data: timeSeriesData,
      correlation_flags: correlationFlags,
      aggregate_ready: true,
      financial_sentiment,
    };
  }

  private detectCompanyMentions(text: string, post: EnhancedRedditPost): CompanyMention[] {
    const mentions: CompanyMention[] = [];
    
    for (const [ticker, company] of Object.entries(NASDAQ_100_COMPANIES)) {
      let found = false;
      let confidence = 0;
      let contextStart = -1;
      
      // Check for ticker symbol (high confidence)
      const tickerPattern = new RegExp(`\\$${ticker}\\b|\\b${ticker}\\b(?=\\s|$|\\.|,|\\))`, 'gi');
      if (tickerPattern.test(text)) {
        found = true;
        confidence = 0.9;
        const match = text.match(tickerPattern);
        if (match) {
          contextStart = text.indexOf(match[0]);
        }
      }
      
      // Check for company name and aliases (medium-high confidence)
      if (!found) {
        for (const alias of company.aliases) {
          const aliasLower = alias.toLowerCase();
          if (text.includes(aliasLower)) {
            found = true;
            confidence = alias === company.name ? 0.8 : 0.6;
            contextStart = text.indexOf(aliasLower);
            break;
          }
        }
      }
      
      if (found && contextStart !== -1) {
        // Extract context (50 chars before and after)
        const contextEnd = Math.min(contextStart + 100, text.length);
        const context = text.substring(Math.max(0, contextStart - 50), contextEnd);
        
        // Determine sentiment from context
        const sentiment = this.analyzeMentionSentiment(context);
        
        // Calculate impact score based on post engagement and subreddit
        const impactScore = this.calculateImpactScore(post, confidence);
        
        mentions.push({
          ticker: ticker as TickerSymbol,
          confidence,
          type: 'direct',
          sentiment,
          context,
          impactScore
        });
      }
    }
    
    // Detect indirect mentions (sector/competitor relationships)
    const indirectMentions = this.detectIndirectMentions(text, mentions);
    mentions.push(...indirectMentions);
    
    return mentions;
  }

  private analyzeMentionSentiment(context: string): 'bullish' | 'bearish' | 'neutral' {
    const bullishKeywords = [
      'buy', 'long', 'calls', 'moon', 'rocket', 'bull', 'growth', 'up', 
      'breakthrough', 'innovative', 'leading', 'dominat', 'strong', 
      'outperform', 'beat', 'exceed', 'surge', 'rally', 'gain', 'profit',
      'upgrade', 'bullish', 'momentum', 'soar'
    ];
    
    const bearishKeywords = [
      'sell', 'short', 'puts', 'crash', 'bear', 'decline', 'down',
      'concern', 'risk', 'overvalued', 'bubble', 'weak', 'disappoint',
      'miss', 'cut', 'reduce', 'fall', 'drop', 'plunge', 'loss',
      'downgrade', 'bearish', 'dump'
    ];
    
    const lowerContext = context.toLowerCase();
    const bullishCount = bullishKeywords.filter(kw => lowerContext.includes(kw)).length;
    const bearishCount = bearishKeywords.filter(kw => lowerContext.includes(kw)).length;
    
    if (bullishCount > bearishCount + 1) return 'bullish';
    if (bearishCount > bullishCount + 1) return 'bearish';
    return 'neutral';
  }

  private detectIndirectMentions(text: string, directMentions: CompanyMention[]): CompanyMention[] {
    const indirect: CompanyMention[] = [];
    const mentionedTickers = new Set(directMentions.map(m => m.ticker));
    
    // Check for industry-wide impacts
    for (const [industry, tickers] of Object.entries(INDUSTRY_RELATIONSHIPS)) {
      const industryKeywords: Record<string, string[]> = {
        'semiconductors': ['chip', 'semiconductor', 'fab', 'foundry', 'wafer', 'silicon'],
        'cloud_computing': ['cloud', 'saas', 'iaas', 'paas', 'datacenter', 'server'],
        'ai_ml': ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'neural'],
        'streaming': ['streaming', 'content', 'subscriber', 'binge'],
        'evs': ['electric vehicle', 'ev', 'battery', 'charging', 'autonomous'],
        'fintech': ['payment', 'digital wallet', 'crypto', 'defi', 'blockchain'],
        'biotech': ['vaccine', 'drug', 'fda', 'clinical trial', 'pharma', 'therapeutic'],
        'cybersecurity': ['security', 'breach', 'hack', 'malware', 'ransomware', 'threat'],
        'software': ['software', 'app', 'platform', 'code', 'developer'],
        'e_commerce': ['ecommerce', 'e-commerce', 'online shopping', 'marketplace', 'delivery'],
        'healthcare_tech': ['medical device', 'healthcare', 'diagnostic', 'telemedicine'],
        'gaming': ['game', 'gaming', 'console', 'esports', 'multiplayer'],
        'telecom': ['5g', 'wireless', 'network', 'carrier', 'mobile'],
        'beverages': ['drink', 'beverage', 'soda', 'energy drink'],
        'food': ['food', 'snack', 'grocery', 'restaurant'],
        'retail': ['store', 'retail', 'shopping', 'merchant'],
      };
      
      const keywords = industryKeywords[industry] || [];
      if (keywords.some(kw => text.includes(kw))) {
        // Add competitors/related companies not directly mentioned
        for (const ticker of tickers) {
          if (!mentionedTickers.has(ticker as TickerSymbol)) {
            indirect.push({
              ticker: ticker as TickerSymbol,
              confidence: 0.3,
              type: 'sector',
              sentiment: 'neutral', // Will be refined based on context
              context: industry,
              impactScore: 20
            });
          }
        }
      }
    }
    
    return indirect;
  }

  private calculateImpactScore(post: EnhancedRedditPost, confidence: number): number {
    let score = 50; // Base score
    
    // Adjust based on subreddit influence
    const highImpactSubs = ['wallstreetbets', 'stocks', 'investing', 'options', 'stockmarket', 'wsb'];
    const techSubs = ['technology', 'programming', 'machinelearning', 'artificial', 'futurology'];
    const aiSubs = ['openai', 'claudeai', 'anthropic', 'localllama', 'stablediffusion'];
    
    if (post.subreddit) {
      const subredditLower = post.subreddit.toLowerCase();
      
      if (highImpactSubs.some(sub => subredditLower.includes(sub))) {
        score += 20;
      } else if (techSubs.some(sub => subredditLower.includes(sub))) {
        score += 10;
      } else if (aiSubs.some(sub => subredditLower.includes(sub))) {
        score += 15;
      }
    }
    
    // Adjust based on engagement (logarithmic scale)
    const engagementScore = Math.log10(Math.max(1, post.score + post.num_comments)) * 10;
    score += Math.min(20, engagementScore);
    
    // Apply confidence multiplier
    score *= confidence;
    
    return Math.min(100, Math.round(score));
  }

  private analyzeMarketSignals(text: string, mentions: CompanyMention[]): MarketSignals {
    const sectors: Record<string, { sentiment: number; mentions: number }> = {};
    
    // Aggregate by sector
    for (const mention of mentions) {
      const sector = SECTOR_MAPPING[mention.ticker];
      if (!sectors[sector]) {
        sectors[sector] = { sentiment: 0, mentions: 0 };
      }
      sectors[sector].mentions++;
      sectors[sector].sentiment += mention.sentiment === 'bullish' ? 1 : 
                                   mention.sentiment === 'bearish' ? -1 : 0;
    }
    
    // Normalize sector sentiment
    for (const sector of Object.keys(sectors)) {
      if (sectors[sector].mentions > 0) {
        sectors[sector].sentiment /= sectors[sector].mentions;
      }
    }
    
    // Detect market indicators
    const marketIndicators = {
      volatility_signal: /volatil|vix|uncertainty|swing|fluctuat/i.test(text),
      earnings_related: /earnings|revenue|guidance|eps|beat|miss|quarter/i.test(text),
      regulatory_mention: /sec|regulation|antitrust|investigation|fine|lawsuit/i.test(text),
      innovation_signal: /breakthrough|patent|innovation|disruption|launch|release/i.test(text),
      supply_chain_impact: /supply chain|shortage|logistics|shipping|delay/i.test(text),
    };
    
    // Calculate overall trading signal
    const overallSentiment = mentions.reduce((sum, m) => 
      sum + (m.sentiment === 'bullish' ? 1 : m.sentiment === 'bearish' ? -1 : 0), 0
    ) / Math.max(1, mentions.length);
    
    const tradingSignals = {
      momentum: overallSentiment > 0.5 ? 'strong_buy' :
                overallSentiment > 0.2 ? 'buy' :
                overallSentiment < -0.5 ? 'strong_sell' :
                overallSentiment < -0.2 ? 'sell' : 'hold',
      timeframe: marketIndicators.earnings_related ? '1d' : '7d',
      confidence: Math.min(1, mentions.length * 0.2) // More mentions = higher confidence
    } as const;
    
    return {
      companies: mentions,
      sectors,
      marketIndicators,
      tradingSignals
    };
  }

  private calculateFinancialSentiment(text: string): number {
    const sentimentWords = {
      strong_positive: ['breakthrough', 'disrupt', 'revolutionary', 'dominant', 'mooning', 'explode'],
      positive: ['growth', 'beat', 'exceed', 'strong', 'buy', 'upgrade', 'profit', 'gain'],
      negative: ['concern', 'risk', 'miss', 'downgrade', 'sell', 'weak', 'loss', 'decline'],
      strong_negative: ['crash', 'bankruptcy', 'fraud', 'collapse', 'investigation', 'scandal']
    };
    
    let sentimentScore = 0;
    let wordCount = 0;
    
    for (const [level, words] of Object.entries(sentimentWords)) {
      for (const word of words) {
        if (text.includes(word)) {
          wordCount++;
          switch(level) {
            case 'strong_positive': sentimentScore += 2; break;
            case 'positive': sentimentScore += 1; break;
            case 'negative': sentimentScore -= 1; break;
            case 'strong_negative': sentimentScore -= 2; break;
          }
        }
      }
    }
    
    // Normalize to -1 to 1 range
    return wordCount > 0 ? Math.max(-1, Math.min(1, sentimentScore / wordCount)) : 0;
  }

  private generateTimeSeriesData(
    post: EnhancedRedditPost,
    mentions: CompanyMention[],
    sentiment: number
  ): TimeSeriesDataPoint[] {
    const dataPoints: TimeSeriesDataPoint[] = [];
    
    for (const mention of mentions) {
      if (mention.confidence > 0.5) { // Only high-confidence mentions
        dataPoints.push({
          timestamp: new Date(post.created_utc * 1000),
          ticker: mention.ticker,
          sentiment: mention.sentiment === 'bullish' ? Math.abs(sentiment) : 
                    mention.sentiment === 'bearish' ? -Math.abs(sentiment) : 0,
          volume: 1, // Each mention counts as 1
          engagement: post.score + post.num_comments,
          virality: this.calculateVirality(post)
        });
      }
    }
    
    return dataPoints;
  }

  private calculateVirality(post: EnhancedRedditPost): number {
    // Calculate how fast the post is spreading
    const ageInHours = (Date.now() / 1000 - post.created_utc) / 3600;
    if (ageInHours <= 0) return 0;
    
    const engagementRate = (post.score + post.num_comments) / ageInHours;
    // Normalize to 0-100 scale
    return Math.min(100, Math.log10(Math.max(1, engagementRate)) * 20);
  }

  private identifyCorrelations(text: string, mentions: CompanyMention[]): string[] {
    const correlations: string[] = [];
    
    // Check for market-wide events
    if (/fed|fomc|interest rate|inflation|cpi|powell/i.test(text)) {
      correlations.push('macro_economic_event');
    }
    
    if (/merger|acquisition|buyout|deal|takeover/i.test(text)) {
      correlations.push('ma_activity');
    }
    
    if (/lawsuit|sue|legal|court|settlement/i.test(text)) {
      correlations.push('legal_risk');
    }
    
    if (/layoff|restructur|downsize|fire/i.test(text)) {
      correlations.push('workforce_change');
    }
    
    // Check for cross-sector impacts
    const mentionedSectors = new Set(
      mentions.map(m => SECTOR_MAPPING[m.ticker]).filter(Boolean)
    );
    
    if (mentionedSectors.size > 2) {
      correlations.push('multi_sector_impact');
    }
    
    // Supply chain correlations
    if (mentions.some(m => ['NVDA', 'AMD', 'INTC'].includes(m.ticker))) {
      if (mentions.some(m => ['ASML', 'AMAT', 'LRCX'].includes(m.ticker))) {
        correlations.push('semiconductor_supply_chain');
      }
    }
    
    // Cloud provider correlations
    if (mentions.some(m => ['MSFT', 'AMZN', 'GOOGL'].includes(m.ticker))) {
      correlations.push('cloud_competition');
    }
    
    return correlations;
  }

  private detectCrossCompanyCorrelations(posts: EnhancedTradingPost[]): void {
    // Analyze relationships between posts for pattern detection
    const companyPairs: Map<string, number> = new Map();
    
    for (const post of posts) {
      const tickers = post.market_analysis.companies.map(c => c.ticker);
      
      // Track co-mentions
      for (let i = 0; i < tickers.length; i++) {
        for (let j = i + 1; j < tickers.length; j++) {
          const pair = [tickers[i], tickers[j]].sort().join('-');
          companyPairs.set(pair, (companyPairs.get(pair) || 0) + 1);
        }
      }
    }
    
    // Flag posts with strong correlations
    for (const post of posts) {
      const tickers = post.market_analysis.companies.map(c => c.ticker);
      
      for (let i = 0; i < tickers.length; i++) {
        for (let j = i + 1; j < tickers.length; j++) {
          const pair = [tickers[i], tickers[j]].sort().join('-');
          const count = companyPairs.get(pair) || 0;
          
          if (count > 3) {
            post.correlation_flags.push(`correlation:${pair}`);
          }
        }
      }
    }
  }

  private createBasicTradingEnhancement(post: EnhancedRedditPost): EnhancedTradingPost {
    return {
      ...post,
      market_analysis: {
        companies: [],
        sectors: {},
        marketIndicators: {
          volatility_signal: false,
          earnings_related: false,
          regulatory_mention: false,
          innovation_signal: false,
          supply_chain_impact: false,
        },
        tradingSignals: {
          momentum: 'hold',
          timeframe: '7d',
          confidence: 0
        }
      },
      time_series_data: [],
      correlation_flags: [],
      aggregate_ready: false,
      financial_sentiment: 0
    };
  }
}

export const tradingEnrichmentAgent = new TradingEnrichmentAgent();
