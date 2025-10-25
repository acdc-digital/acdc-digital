"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SentimentChangeProps {
  symbol: string;
  className?: string;
}

export function SentimentChange({ symbol, className = "" }: SentimentChangeProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestScore = useQuery((api as any)["stats/latestSentiment"].getLatestSentimentScore, {
    ticker: symbol,
  });

  if (!latestScore || latestScore.score_change_percent === null || latestScore.score_change_percent === undefined) {
    return <span className={`text-[10px] text-[#858585] ${className}`}>—</span>;
  }

  const changePercent = latestScore.score_change_percent;
  
  // Check if change is exactly zero
  const isZero = changePercent === 0;
  const isPositive = changePercent > 0;
  
  const color = isZero ? "text-white" : (isPositive ? "text-green-500" : "text-red-500");
  const sign = isZero ? "" : (isPositive ? "+" : "");

  return (
    <span className={`text-[10px] font-mono ${color} ${className}`}>
      {sign}{changePercent.toFixed(2)}%
    </span>
  );
}
