'use client';

import React from 'react';
import { api } from '@/convex/_generated/api';
import { useCachedQuery } from '@/lib/hooks/useStatsCache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Target, BarChart3 } from 'lucide-react';

export function MarketSentimentWidget() {
  const data = useCachedQuery(
    api.stats.trading.getMarketSentimentMetrics,
    {},
    "market-sentiment-metrics"
  );

  if (!data) {
    return (
      <Card className="bg-card border border-border h-[200px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.overall_sentiment > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = data.sentiment_trend === "bullish" ? "text-green-500" : 
                     data.sentiment_trend === "bearish" ? "text-red-500" : "text-yellow-500";
  
  return (
    <Card className="bg-card border border-border h-[200px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <Icon className={`w-4 h-4 ${trendColor}`} />
          Market Sentiment
        </CardTitle>
        <CardDescription className="text-xs">
          Reddit NASDAQ-100 analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${trendColor}`}>
              {data.overall_sentiment > 0 ? '+' : ''}{data.overall_sentiment}
            </span>
            {data.sentiment_change_24h !== 0 && (
              <Badge variant={data.sentiment_change_24h > 0 ? "default" : "destructive"} className="text-xs">
                {data.sentiment_change_24h > 0 ? '+' : ''}{data.sentiment_change_24h}%
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {data.sentiment_trend} ({data.sentiment_strength})
          </p>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-500/10 border-green-500/20">
            🟢 {data.bullish_signals}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-red-500/10 border-red-500/20">
            🔴 {data.bearish_signals}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-yellow-500/10 border-yellow-500/20">
            🟡 {data.neutral_signals}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function MomentumWidget() {
  const data = useCachedQuery(
    api.stats.trading.getMomentumIndicators,
    {},
    "momentum-indicators"
  );

  if (!data) {
    return (
      <Card className="bg-card border border-border h-[200px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Activity className="w-4 h-4" />
            Momentum Index
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendColor = data.momentum_trend === "accelerating" ? "text-green-500" : 
                     data.momentum_trend === "decelerating" ? "text-red-500" : "text-yellow-500";
  
  return (
    <Card className="bg-card border border-border h-[200px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <Activity className={`w-4 h-4 ${trendColor}`} />
          Momentum Index
        </CardTitle>
        <CardDescription className="text-xs">
          Market velocity indicator
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${trendColor}`}>
              {data.avg_momentum_score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {data.momentum_trend}
            {data.momentum_change_24h !== 0 && ` (${data.momentum_change_24h > 0 ? '+' : ''}${data.momentum_change_24h.toFixed(1)}%)`}
          </p>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">High momentum</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {data.high_momentum_tickers}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{width: `${data.avg_momentum_score}%`}}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VolatilityWidget() {
  const data = useCachedQuery(
    api.stats.trading.getVolatilityMetrics,
    {},
    "volatility-metrics"
  );

  if (!data) {
    return (
      <Card className="bg-card border border-border h-[200px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4" />
            Volatility Index
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelColor = data.volatility_level === "high" ? "text-red-500" : 
                     data.volatility_level === "moderate" ? "text-yellow-500" : "text-green-500";
  
  return (
    <Card className="bg-card border border-border h-[200px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <Target className={`w-4 h-4 ${levelColor}`} />
          Volatility Index
        </CardTitle>
        <CardDescription className="text-xs">
          Market stability gauge
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${levelColor}`}>
              {data.avg_volatility_index}
            </span>
            <Badge variant={data.volatility_level === "high" ? "destructive" : 
                           data.volatility_level === "moderate" ? "default" : "secondary"} 
                   className="text-xs capitalize">
              {data.volatility_level}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {data.volatility_trend}
          </p>
        </div>
        
        <div className="flex gap-2 mt-4">
          <div className="flex-1 text-center">
            <div className="text-xl font-bold text-red-500">{data.high_volatility_tickers}</div>
            <div className="text-[10px] text-muted-foreground">High vol</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xl font-bold text-green-500">{data.stable_tickers}</div>
            <div className="text-[10px] text-muted-foreground">Stable</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TradingSignalsWidget() {
  const data = useCachedQuery(
    api.stats.trading.getTradingSignalsSummary,
    {},
    "trading-signals-summary"
  );

  if (!data) {
    return (
      <Card className="bg-card border border-border h-[200px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="w-4 h-4" />
            Trading Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border h-[200px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-card-foreground">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          Trading Signals
        </CardTitle>
        <CardDescription className="text-xs">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {data.total_signals}
          </Badge>
          {' '}active signals • {data.avg_confidence}% confidence
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-5 gap-1">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{data.strong_buy}</div>
            <div className="text-[9px] text-muted-foreground">S.Buy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">{data.buy}</div>
            <div className="text-[9px] text-muted-foreground">Buy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">{data.hold}</div>
            <div className="text-[9px] text-muted-foreground">Hold</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">{data.sell}</div>
            <div className="text-[9px] text-muted-foreground">Sell</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{data.strong_sell}</div>
            <div className="text-[9px] text-muted-foreground">S.Sell</div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">High confidence</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {data.high_confidence_signals} / {data.total_signals}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
