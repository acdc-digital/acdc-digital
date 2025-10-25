"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TickerVsNewsProps {
  symbol: string;
  className?: string;
}

export function TickerVsNews({ symbol, className = "" }: TickerVsNewsProps) {
  const comparison = useQuery(api.stats.tickerVsNews.getTickerVsNewsComparison, {
    ticker: symbol,
  });

  if (!comparison) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-[10px] uppercase tracking-wider text-[#858585] font-medium mb-1">
          vs News
        </span>
        <span className="text-sm text-[#858585]">--</span>
      </div>
    );
  }

  const getIcon = () => {
    if (comparison.percentageVsNews > 5) {
      return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
    } else if (comparison.percentageVsNews < -5) {
      return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    }
    return <Minus className="w-3.5 h-3.5 text-yellow-500" />;
  };

  const getColor = () => {
    if (comparison.percentageVsNews > 10) return "text-green-500";
    if (comparison.percentageVsNews > 5) return "text-green-400";
    if (comparison.percentageVsNews >= -5) return "text-[#cccccc]";
    if (comparison.percentageVsNews >= -10) return "text-orange-400";
    return "text-red-500";
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-[#858585] font-medium mb-1">
        vs News
      </span>
      <div className="flex items-center gap-1.5">
        {getIcon()}
        <span className={`text-sm font-mono font-bold ${getColor()}`}>
          {comparison.percentageVsNews > 0 ? "+" : ""}
          {comparison.percentageVsNews.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
