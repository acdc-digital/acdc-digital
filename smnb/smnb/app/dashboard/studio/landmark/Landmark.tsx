"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SentimentScore } from "@/app/dashboard/ticker/_components/SentimentScore";
import { Ticker, TickerIcon, TickerSymbol } from "@/components/ui/Ticker";
import { ChevronDown, Search } from "lucide-react";
import { useTickerContext } from "@/app/dashboard/ticker/_context/TickerContext";
import WelcomeTab from "@/app/dashboard/ticker/WelcomeTab";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Type for stock data with weight
interface StockWithWeight {
  symbol: string;
  weight: number;
}

// Nasdaq-100 constituents (top holdings) with current index weights (as of Oct 2025)
const nasdaqConstituents: StockWithWeight[] = [
  { symbol: "AAPL", weight: 10.63 },
  { symbol: "MSFT", weight: 8.79 },
  { symbol: "NVDA", weight: 8.45 },
  { symbol: "AMZN", weight: 5.54 },
  { symbol: "META", weight: 4.89 },
  { symbol: "AVGO", weight: 4.76 },
  { symbol: "GOOGL", weight: 2.67 },
  { symbol: "GOOG", weight: 2.59 },
  { symbol: "TSLA", weight: 2.51 },
  { symbol: "COST", weight: 2.49 },
  { symbol: "NFLX", weight: 2.34 },
  { symbol: "AMD", weight: 1.48 },
  { symbol: "PEP", weight: 1.43 },
  { symbol: "TMUS", weight: 1.41 },
  { symbol: "ADBE", weight: 1.41 },
  { symbol: "CSCO", weight: 1.39 },
  { symbol: "LIN", weight: 1.34 },
  { symbol: "QCOM", weight: 1.26 },
  { symbol: "CMCSA", weight: 1.18 },
  { symbol: "INTU", weight: 1.13 },
  { symbol: "TXN", weight: 1.11 },
  { symbol: "AMGN", weight: 1.06 },
  { symbol: "INTC", weight: 1.04 },
  { symbol: "AMAT", weight: 1.02 },
  { symbol: "HON", weight: 0.99 },
  { symbol: "ISRG", weight: 0.97 },
  { symbol: "BKNG", weight: 0.94 },
  { symbol: "VRTX", weight: 0.93 },
  { symbol: "ADP", weight: 0.91 },
  { symbol: "PANW", weight: 0.88 },
  { symbol: "SBUX", weight: 0.86 },
  { symbol: "GILD", weight: 0.84 },
  { symbol: "MU", weight: 0.83 },
  { symbol: "ADI", weight: 0.82 },
  { symbol: "REGN", weight: 0.79 },
  { symbol: "LRCX", weight: 0.77 },
  { symbol: "MDLZ", weight: 0.76 },
  { symbol: "KLAC", weight: 0.74 },
  { symbol: "SNPS", weight: 0.73 },
  { symbol: "PYPL", weight: 0.71 },
  { symbol: "CDNS", weight: 0.70 },
  { symbol: "ASML", weight: 0.69 },
  { symbol: "MRVL", weight: 0.68 },
  { symbol: "CRWD", weight: 0.66 },
  { symbol: "ABNB", weight: 0.66 },
  { symbol: "NXPI", weight: 0.65 },
  { symbol: "ORLY", weight: 0.65 },
  { symbol: "CTAS", weight: 0.64 },
  { symbol: "ADSK", weight: 0.63 },
  { symbol: "CSX", weight: 0.62 },
  { symbol: "WDAY", weight: 0.60 },
  { symbol: "PCAR", weight: 0.59 },
  { symbol: "CHTR", weight: 0.58 },
  { symbol: "MNST", weight: 0.58 },
  { symbol: "AEP", weight: 0.57 },
  { symbol: "PAYX", weight: 0.56 },
  { symbol: "ROST", weight: 0.55 },
  { symbol: "LULU", weight: 0.54 },
  { symbol: "ODFL", weight: 0.54 },
  { symbol: "FAST", weight: 0.53 },
  { symbol: "KDP", weight: 0.52 },
  { symbol: "DXCM", weight: 0.52 },
  { symbol: "CTSH", weight: 0.51 },
  { symbol: "EA", weight: 0.50 },
  { symbol: "GEHC", weight: 0.49 },
  { symbol: "VRSK", weight: 0.49 },
  { symbol: "EXC", weight: 0.48 },
  { symbol: "IDXX", weight: 0.48 },
  { symbol: "KHC", weight: 0.47 },
  { symbol: "TEAM", weight: 0.46 },
  { symbol: "CSGP", weight: 0.45 },
  { symbol: "TTWO", weight: 0.44 },
  { symbol: "ANSS", weight: 0.44 },
  { symbol: "DDOG", weight: 0.43 },
  { symbol: "ZS", weight: 0.43 },
  { symbol: "ON", weight: 0.42 },
  { symbol: "BIIB", weight: 0.41 },
  { symbol: "XEL", weight: 0.41 },
  { symbol: "BKR", weight: 0.40 },
  { symbol: "MCHP", weight: 0.39 },
  { symbol: "FANG", weight: 0.39 },
  { symbol: "WBD", weight: 0.38 },
  { symbol: "FTNT", weight: 0.38 },
  { symbol: "CDW", weight: 0.37 },
  { symbol: "CCEP", weight: 0.36 },
  { symbol: "ILMN", weight: 0.36 },
  { symbol: "MDB", weight: 0.35 },
  { symbol: "GFS", weight: 0.34 },
  { symbol: "DASH", weight: 0.33 },
  { symbol: "MRNA", weight: 0.32 },
  { symbol: "WBA", weight: 0.31 },
  { symbol: "TTD", weight: 0.30 },
  { symbol: "ZM", weight: 0.29 },
  { symbol: "PDD", weight: 0.28 },
  { symbol: "CPRT", weight: 0.27 },
  { symbol: "DLTR", weight: 0.26 },
  { symbol: "ENPH", weight: 0.25 },
  { symbol: "SGEN", weight: 0.24 },
  { symbol: "ALGN", weight: 0.23 },
  { symbol: "SIRI", weight: 0.22 },
];

// Component to show ticker's performance vs weighted index mean
function TickerVsIndex({ symbol }: { symbol: string }) {
  const vsIndexData = useQuery(api.stats.tickerVsIndex.getTickerVsIndexComparison, {
    ticker: symbol,
  });

  if (!vsIndexData) {
    return (
      <span className="text-[10px] text-[#666]">--</span>
    );
  }

  return (
    <span className={`text-[10px] font-mono ${
      vsIndexData.percentageVsIndex > 0 ? 'text-green-500' : 'text-red-500'
    }`}>
      {vsIndexData.percentageVsIndex > 0 ? '+' : ''}
      {vsIndexData.percentageVsIndex.toFixed(1)}%
    </span>
  );
}

export default function Landmark() {
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedTicker, setSelectedTicker } = useTickerContext();

  // Filter tickers based on search query
  const filteredTickers = useMemo(() => {
    if (!searchQuery.trim()) {
      return nasdaqConstituents;
    }
    const query = searchQuery.toLowerCase();
    return nasdaqConstituents.filter(stock => 
      stock.symbol.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Set a random ticker on mount if none selected
  useEffect(() => {
    if (!selectedTicker) {
      const randomIndex = Math.floor(Math.random() * nasdaqConstituents.length);
      const randomTicker = nasdaqConstituents[randomIndex];
      setSelectedTicker({ symbol: randomTicker.symbol, weight: randomTicker.weight });
    }
  }, []);

  return (
    <div className="flex h-full w-full">
      {/* Sidebar with Ticker */}
      <div className="w-[240px] bg-[#1e1e1e] border-r border-[#2d2d2d] flex-shrink-0 overflow-auto scrollbar-hide">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-2.25 pl-3.5 border-b border-[#2d2d2d] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium font-dm-sans text-[#CCCCCC]">
                Nasdaq-100 Index
              </h3>
              <button
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="flex items-center gap-1 text-[10px] text-[#858585] hover:text-[#cccccc] transition-colors"
              >
                Legend
                <ChevronDown 
                  className={`w-3 h-3 transition-transform ${isLegendOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            
            {/* Collapsible Legend */}
            {isLegendOpen && (
              <div className="flex flex-col gap-1 text-[10px] font-mono pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-green-500">●</span>
                  <span className="text-[#858585]">Strong Positive (120%+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-green-400">●</span>
                  <span className="text-[#858585]">Positive (105-120%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#cccccc]">●</span>
                  <span className="text-[#858585]">Neutral (95-105%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-400">●</span>
                  <span className="text-[#858585]">Negative (80-95%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-red-500">●</span>
                  <span className="text-[#858585]">Strong Negative (&lt;80%)</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Search Filter */}
          <div className="px-2.5 py-2 border-b border-[#2d2d2d]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#858585]" />
              <input
                type="text"
                placeholder="Filter tickers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-[#2d2d2d] border border-[#3d3d3d] rounded text-[#cccccc] placeholder-[#666] focus:outline-none focus:border-[#007ACC] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#858585] hover:text-[#cccccc] text-[10px] font-medium"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-1 text-[10px] text-[#858585]">
                {filteredTickers.length} result{filteredTickers.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {/* Ticker List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-2 space-y-1">
              {filteredTickers.map((stock) => (
                <div 
                  key={stock.symbol}
                  className="p-1.5 py-1 hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
                  onClick={() => setSelectedTicker({ symbol: stock.symbol, weight: stock.weight })}
                >
                  <Ticker>
                    <TickerIcon
                      src={`https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/${stock.symbol}.png`}
                      symbol={stock.symbol}
                    />
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <TickerSymbol symbol={stock.symbol} weight={stock.weight} className="flex-shrink-0" />
                      <div className="flex flex-col items-end gap-0.5 ml-2">
                        <SentimentScore symbol={stock.symbol} weight={stock.weight} />
                        <TickerVsIndex symbol={stock.symbol} />
                      </div>
                    </div>
                  </Ticker>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Welcome Tab */}
      <WelcomeTab />
    </div>
  );
}