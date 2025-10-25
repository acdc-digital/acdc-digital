"use client";

import React from "react";
import { CompactTickerBadge } from "./_components/CompactTickerBadge";
import { SentimentAnalysisCard } from "./_components/SentimentAnalysisCard";
import { NewsSummaryCard } from "./_components/NewsSummaryCard";
import { StockPriceDisplay } from "./_components/StockPriceDisplay";
import { useTickerContext } from "./_context/TickerContext";

interface WelcomeTabProps {
  isActive?: boolean;
}

export default function WelcomeTab({ isActive = true }: WelcomeTabProps) {
  const { selectedTicker } = useTickerContext();

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-[#1e1e1e] relative">
      {/* Quote Text - Absolute positioned background */}
      <div className="absolute top-4 left-6 pointer-events-none z-0">
        <p className="text-gray-500 dark:text-slate-500/10 font-newsreader font-semibold text-[86px] break-words leading-tight">
          &ldquo;Buy to the sound of cannons, sell to the sound of trumpets.&rdquo;
        </p>
      </div>

      {/* Quote Badges - COMMENTED OUT FOR NOW */}
      {/* <div className="flex-shrink-0 p-6 pb-0">
        <div className="space-y-3">
          <div className="inline-flex items-center bg-[#252526] border border-[#2d2d2d] rounded-md px-3 py-0 hover:bg-[#2d2d2d] transition-colors">
            <p className="pt-1.5 text-[16px] text-[#cccccc] text-center font-mono">
              &ldquo;Buy to the sound of cannons, sell to the sound of trumpets.&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center bg-[#252526] border border-[#2d2d2d] rounded-md px-3 py-0 hover:bg-[#2d2d2d] transition-colors">
              <p className="pt-1.5 text-[16px] text-[#cccccc] text-center font-mono">
                &ldquo;Gamblers think about profit, traders think about risk.&rdquo;
              </p>
            </div>

            <div className="inline-flex items-center bg-[#252526] border border-[#2d2d3d] rounded-md px-3 py-0 hover:bg-[#2d2d2d] transition-colors">
              <p className="pt-1.5 text-[16px] text-[#cccccc] text-center font-mono">
                &ldquo;This could be my second language.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Spacer - grows to push content down when no ticker selected */}
      <div className="flex-1 min-h-0 relative z-10" />

      {/* Ticker content - appears at bottom when ticker is selected, with max height constraint */}
      {/* Only render when both selectedTicker exists AND tab is active to avoid unnecessary queries */}
      {isActive && selectedTicker && (
        <div className="flex-shrink-0 p-6 pt-0 space-y-1 max-h-[60vh] flex flex-col relative z-10">
          {/* Stock Price Display - outside the badge container */}
          <div className="flex-shrink-0 w-full max-w-2xl">
            <StockPriceDisplay symbol={selectedTicker.symbol} />
          </div>

          {/* Compact Ticker Badge - left aligned, max width */}
          <div className="mb-3 flex-shrink-0 w-full max-w-2xl">
            <CompactTickerBadge
              symbol={selectedTicker.symbol}
              weight={selectedTicker.weight}
            />
          </div>

          {/* Analysis Row - Two columns side by side with fixed height */}
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
            <SentimentAnalysisCard 
              symbol={selectedTicker.symbol}
              weight={selectedTicker.weight}
            />
            <NewsSummaryCard 
              symbol={selectedTicker.symbol}
              weight={selectedTicker.weight}
            />
          </div>
        </div>
      )}
    </div>
  );
}
