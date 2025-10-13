// TRADING HOST CONFIGURATION
// Bloomberg-style Trading Analyst Configuration

import { TickerSymbol } from '@/lib/services/livefeed/nasdaq100';

/**
 * Bloomberg-style Trading Analyst Configuration
 * Focused exclusively on NASDAQ-100 market movements and trading signals
 */

export interface TradingPersonality {
  name: string;
  systemPrompt: string;
  style: string;
  temperature: number;
  contextInstructions: string;
}

export interface TradingVerbosityLevel {
  name: string;
  description: string;
  maxTokens: number;
  targetLength: string;
  guidelines: string;
}

export const BLOOMBERG_ANALYST_PERSONALITY: TradingPersonality = {
  name: 'bloomberg_analyst',
  systemPrompt: `You are a Bloomberg-style market analyst covering the NASDAQ-100 exclusively. You deliver rapid-fire, data-packed market intelligence with zero fluff. Every word matters.

STYLE REQUIREMENTS:
- Start with ticker symbol and price movement (if available)
- Lead with the most material information
- Use precise financial terminology
- Include percentages, volumes, and metrics
- Reference sector impacts and correlations
- Mention institutional sentiment indicators
- Close with forward-looking implications
- Maximum 2-3 sentences unless breaking news

TONE: Authoritative, urgent when needed, always factual. No speculation without data.

FORMAT EXAMPLES:
"$NVDA surging 4.2% on semiconductor rally, volume 2.3x average. AI sector momentum lifting $AMD (+3.1%), $AVGO (+2.8%), institutional flow positive."

"$TSLA down 6% following delivery miss, breaking 200-day MA at $242. EV sector weakness spreading to charging infrastructure plays."

"Breaking: $MSFT announces $75B buyback program, dividend up 10%. Cloud giants rallying in sympathy, $GOOGL up 1.2%, $AMZN up 0.8%."`,
  style: 'Bloomberg market analyst - data-driven, concise, trading-focused',
  temperature: 0.55, // Lower temperature for more factual, consistent output
  contextInstructions: 'Focus on price action, volume, institutional flow, sector rotation, and technical levels. Always mention correlated tickers.'
};

export const TRADING_VERBOSITY_LEVELS: Record<string, TradingVerbosityLevel> = {
  flash: {
    name: 'flash',
    description: 'Market flash - single sentence',
    maxTokens: 50,
    targetLength: '1 sentence max',
    guidelines: 'Ticker, direction, catalyst. Example: "$AAPL +2.1% on iPhone demand data"'
  },
  standard: {
    name: 'standard',
    description: 'Standard market update',
    maxTokens: 120,
    targetLength: '2-3 sentences',
    guidelines: 'Price action, volume, related movers, brief context'
  },
  breaking: {
    name: 'breaking',
    description: 'Breaking news coverage',
    maxTokens: 200,
    targetLength: '3-4 sentences',
    guidelines: 'Lead with impact, include all affected tickers, institutional positioning, forward implications'
  }
};

export const TRADING_TONE_TEMPLATES = {
  bullish_signal: {
    prefix: '🟢 BUY SIGNAL:',
    style: 'Confident, momentum-focused',
    urgency: 'high'
  },
  bearish_signal: {
    prefix: '🔴 SELL SIGNAL:',
    style: 'Cautionary, risk-focused',
    urgency: 'high'
  },
  sector_rotation: {
    prefix: '🔄 SECTOR ROTATION:',
    style: 'Analytical, correlation-focused',
    urgency: 'medium'
  },
  earnings_alert: {
    prefix: '📊 EARNINGS:',
    style: 'Factual, metrics-heavy',
    urgency: 'high'
  },
  technical_break: {
    prefix: '📈 TECHNICAL:',
    style: 'Chart-focused, level-specific',
    urgency: 'medium'
  },
  volume_surge: {
    prefix: '🔥 VOLUME SURGE:',
    style: 'Activity-focused, flow-oriented',
    urgency: 'high'
  },
  market_moving: {
    prefix: '⚡ MARKET MOVING:',
    style: 'Impact-focused, broad coverage',
    urgency: 'critical'
  }
};

// Market hours and session configs
export const MARKET_SESSIONS = {
  premarket: { start: '04:00', end: '09:30', style: 'futures-focused' },
  regular: { start: '09:30', end: '16:00', style: 'standard coverage' },
  afterhours: { start: '16:00', end: '20:00', style: 'earnings and guidance' },
  overnight: { start: '20:00', end: '04:00', style: 'international markets correlation' }
};

// Key metrics to always include when available
export const TRADING_METRICS_PRIORITY = [
  'price_change_percent',
  'volume_vs_average',
  'institutional_flow',
  'options_flow',
  'relative_strength',
  'technical_levels',
  'sector_performance',
  'correlation_strength'
];

// Sector correlation groups for quick reference (only NASDAQ-100 tickers)
export const SECTOR_CORRELATION_GROUPS: Record<string, TickerSymbol[]> = {
  'MEGA_CAP_TECH': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA'],
  'SEMICONDUCTORS': ['NVDA', 'AMD', 'INTC', 'QCOM', 'AVGO', 'MRVL', 'ASML', 'AMAT', 'LRCX', 'KLAC'],
  'AI_PLAYS': ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD'],
  'CLOUD': ['MSFT', 'AMZN', 'GOOGL', 'ORCL', 'DDOG', 'MDB'],
  'EVS_CHARGING': ['TSLA'],
  'FINTECH': ['PYPL', 'INTU'],
  'BIOTECH': ['MRNA', 'GILD', 'AMGN', 'REGN', 'VRTX', 'BIIB', 'ILMN'],
  'CONSUMER': ['AMZN', 'TSLA', 'SBUX', 'ABNB', 'BKNG', 'DASH', 'COST']
};

// Trading alert thresholds
export const ALERT_THRESHOLDS = {
  PRICE_MOVE: {
    intraday: 3, // % move to trigger alert
    extended: 5  // % move in pre/after market
  },
  VOLUME: {
    unusual: 1.5, // 150% of average
    extreme: 3.0  // 300% of average  
  },
  OPTIONS: {
    call_put_skew: 0.7, // Significant when <0.7 or >1.3
    unusual_activity: 2.0 // 2x normal options volume
  },
  SENTIMENT: {
    extreme_bullish: 0.7,
    extreme_bearish: -0.7
  }
};
