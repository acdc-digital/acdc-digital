"use client";

import React, { useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface StockPriceDisplayProps {
  symbol: string;
}

export function StockPriceDisplay({ symbol }: StockPriceDisplayProps) {
  const priceData = useQuery(api.stats.stockPriceQuery.getStockPriceWithRefresh, {
    ticker: symbol,
  });
  
  const fetchPrice = useAction(api.stats.stockPrice.fetchStockPrice);

  // Trigger fetch if no data or needs refresh
  useEffect(() => {
    if (priceData === null) {
      console.log(`📈 Triggering stock price fetch for ${symbol}...`);
      fetchPrice({ ticker: symbol }).catch((error) => {
        console.error(`Error fetching stock price for ${symbol}:`, error);
      });
    }
  }, [priceData, symbol, fetchPrice]);

  if (!priceData) {
    return (
      <div className="flex items-center gap-2 text-[#858585] text-xs mb-2">
        <div className="animate-pulse">Loading price...</div>
      </div>
    );
  }

  const isPositive = priceData.change >= 0;

  return (
    <div className="flex items-baseline gap-1.5 mb-0">
      {/* Current Price */}
      <span className="text-sm font-semibold text-[#cccccc] font-mono">
        ${priceData.current_price.toFixed(2)}
      </span>

      {/* Change Amount */}
      <span
        className={`text-xs font-mono ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : ""}
        {priceData.change.toFixed(2)}
      </span>

      {/* Change Percent */}
      <span
        className={`text-xs font-mono ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        ({isPositive ? "+" : ""}
        {priceData.change_percent.toFixed(2)}%)
      </span>

      {/* Timestamp indicator */}
      {priceData.needs_refresh && (
        <span className="text-[10px] text-[#666] ml-auto">
          Refreshing soon...
        </span>
      )}
    </div>
  );
}
