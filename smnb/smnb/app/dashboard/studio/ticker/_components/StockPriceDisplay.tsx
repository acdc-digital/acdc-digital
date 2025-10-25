"use client";

import React, { useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getCompanyName } from "@/lib/data/companyNames";
import { useDashboard } from "@/app/dashboard/DashboardContext";

interface StockPriceDisplayProps {
  symbol: string;
}

export function StockPriceDisplay({ symbol }: StockPriceDisplayProps) {
  const priceData = useQuery(api.stats.stockPriceQuery.getStockPriceWithRefresh, {
    ticker: symbol,
  });
  
  const fetchPrice = useAction(api.stats.stockPrice.fetchStockPrice);
  const { setActivePanel } = useDashboard();
  const companyName = getCompanyName(symbol);

  // Trigger fetch if no data or needs refresh
  useEffect(() => {
    if (priceData === null) {
      console.log(`📈 Triggering stock price fetch for ${symbol}...`);
      fetchPrice({ ticker: symbol }).catch((error) => {
        console.error(`Error fetching stock price for ${symbol}:`, error);
      });
    }
  }, [priceData, symbol, fetchPrice]);

  const handleCompanyClick = () => {
    console.log(`🔗 Navigating to company: ${symbol}`);
    
    // First navigate to the docs panel
    setActivePanel("docs");
    
    // Then dispatch event with a delay to ensure panel is visible
    setTimeout(() => {
      console.log(`📡 Dispatching navigateToCompany event for: ${symbol}`);
      window.dispatchEvent(new CustomEvent('navigateToCompany', { 
        detail: { ticker: symbol.toLowerCase() } 
      }));
    }, 150);
  };

  if (!priceData) {
    return (
      <div className="flex items-center gap-2 text-[#858585] text-xs mb-2">
        <div className="animate-pulse">Loading price...</div>
      </div>
    );
  }

  const isPositive = priceData.change >= 0;

  return (
    <div className="flex items-baseline justify-between gap-4 mb-0">
      {/* Left side: Price information */}
      <div className="flex items-baseline gap-2">
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
      </div>

      {/* Right side: Company name as hyperlink */}
      {companyName && (
        <button
          onClick={handleCompanyClick}
          className="text-xl text-white font-bold font-newsreader hover:underline transition-colors cursor-pointer"
          title={`View ${companyName} in company list`}
        >
          {companyName}
        </button>
      )}

      {/* Timestamp indicator */}
      {priceData.needs_refresh && (
        <span className="text-[10px] text-[#666]">
          Refreshing soon...
        </span>
      )}
    </div>
  );
}
