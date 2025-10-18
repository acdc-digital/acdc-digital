"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { NASDAQ_100_COMPANIES } from "@/lib/services/livefeed/nasdaq100";
import { SentimentScore } from "./SentimentScore";
import { TickerVsIndex } from "./TickerVsIndex";
import { TickerVsNews } from "./TickerVsNews";
import { SentimentExcerpt } from "./SentimentExcerpt";
import { FinlightNewsSummary } from "./FinlightNewsSummary";
import { useTickerContext } from "../_context/TickerContext";

interface TickerBadgeProps {
  symbol: string;
  weight: number;
}

export function TickerBadge({ symbol, weight }: TickerBadgeProps) {
  const { setSelectedTicker } = useTickerContext();
  const companyInfo = NASDAQ_100_COMPANIES[symbol as keyof typeof NASDAQ_100_COMPANIES];
  const companyName = companyInfo?.name || symbol;

  return (
    <div className="relative p-6 rounded-xl bg-gradient-to-br from-[#252526] to-[#1e1e1e] border-2 border-[#3d3d3d] shadow-2xl">
      {/* Close Button */}
      <button
        onClick={() => setSelectedTicker(null)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-[#3d3d3d] transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-[#858585] hover:text-[#cccccc]" />
      </button>

      {/* Content */}
      <div className="flex items-center gap-6">
        {/* Company Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-xl bg-[#1e1e1e] border border-[#3d3d3d] overflow-hidden flex items-center justify-center">
            <Image
              src={`https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/${symbol}.png`}
              alt={`${symbol} logo`}
              width={48}
              height={48}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-2xl font-bold text-[#ffffff] tracking-tight">
              {companyName}
            </h2>
            <span className="text-base font-mono font-semibold text-[#858585]">
              {symbol}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-[#858585] font-medium">
                Sentiment Score
              </span>
              <div className="text-lg font-bold">
                <SentimentScore symbol={symbol} weight={weight} />
              </div>
            </div>

            <div className="h-8 w-px bg-[#3d3d3d]" />

            <TickerVsIndex symbol={symbol} />

            <div className="h-8 w-px bg-[#3d3d3d]" />

            <TickerVsNews symbol={symbol} />

            <div className="h-8 w-px bg-[#3d3d3d]" />

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-[#858585] font-medium">
                Index Weight
              </span>
              <div className="text-base font-mono font-bold text-[#cccccc]">
                {weight.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Excerpt */}
      <SentimentExcerpt symbol={symbol} weight={weight} />

      {/* Market News Summary */}
      <FinlightNewsSummary symbol={symbol} weight={weight} />

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#007acc]/5 to-transparent pointer-events-none" />
    </div>
  );
}
