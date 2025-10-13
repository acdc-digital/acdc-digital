"use client";

import { PanelType } from "../ActivityBar";
import { Ticker, TickerIcon, TickerSymbol, TickerPrice, TickerPriceChange, TickerSkeleton } from "./_components/Ticker";
import { useTickerPrices } from "@/hooks/useTickerPrices";

interface SidePanelProps {
  activePanel: PanelType;
}

// MNQ1! constituents (Nasdaq-100 top holdings) - fallback data
const mnqConstituents = [
  { symbol: "AAPL", price: 175.43, change: 2.15, changePercent: 1.24 },
  { symbol: "MSFT", price: 378.91, change: -1.23, changePercent: -0.32 },
  { symbol: "AMZN", price: 145.86, change: 3.45, changePercent: 2.42 },
  { symbol: "NVDA", price: 495.22, change: 8.76, changePercent: 1.80 },
  { symbol: "GOOGL", price: 139.57, change: 1.89, changePercent: 1.37 },
  { symbol: "GOOG", price: 141.23, change: 1.95, changePercent: 1.40 },
  { symbol: "META", price: 342.89, change: 4.32, changePercent: 1.28 },
  { symbol: "TSLA", price: 242.84, change: -3.21, changePercent: -1.30 },
  { symbol: "AVGO", price: 875.34, change: 5.67, changePercent: 0.65 },
  { symbol: "COST", price: 623.45, change: 2.89, changePercent: 0.47 },
  { symbol: "NFLX", price: 445.67, change: -2.45, changePercent: -0.55 },
  { symbol: "ADBE", price: 512.34, change: 3.21, changePercent: 0.63 },
  { symbol: "PEP", price: 178.90, change: 1.12, changePercent: 0.63 },
  { symbol: "CSCO", price: 54.32, change: 0.87, changePercent: 1.63 },
  { symbol: "CMCSA", price: 42.15, change: -0.45, changePercent: -1.06 },
  { symbol: "TMUS", price: 156.78, change: 2.34, changePercent: 1.51 },
  { symbol: "INTC", price: 23.45, change: -1.87, changePercent: -7.39 },
  { symbol: "AMD", price: 143.67, change: 4.56, changePercent: 3.28 },
  { symbol: "INTU", price: 598.23, change: 3.45, changePercent: 0.58 },
  { symbol: "QCOM", price: 167.89, change: 2.67, changePercent: 1.62 },
  { symbol: "AMGN", price: 289.34, change: 1.23, changePercent: 0.43 },
  { symbol: "HON", price: 201.45, change: 0.98, changePercent: 0.49 },
  { symbol: "TXN", price: 187.56, change: 2.12, changePercent: 1.14 },
  { symbol: "SBUX", price: 95.67, change: -1.34, changePercent: -1.38 },
  { symbol: "AMAT", price: 198.45, change: 3.87, changePercent: 1.99 },
  { symbol: "ISRG", price: 378.90, change: 4.21, changePercent: 1.12 },
  { symbol: "BKNG", price: 3245.67, change: 15.43, changePercent: 0.48 },
  { symbol: "MDLZ", price: 67.89, change: 0.76, changePercent: 1.13 },
  { symbol: "ADP", price: 254.32, change: 1.98, changePercent: 0.78 },
  { symbol: "GILD", price: 78.45, change: -0.89, changePercent: -1.12 },
  { symbol: "VRTX", price: 412.34, change: 5.67, changePercent: 1.39 },
  { symbol: "REGN", price: 889.23, change: 8.90, changePercent: 1.01 },
  { symbol: "ADI", price: 223.45, change: 2.34, changePercent: 1.06 },
  { symbol: "LRCX", price: 789.56, change: 6.78, changePercent: 0.87 },
  { symbol: "PANW", price: 312.67, change: 4.32, changePercent: 1.40 },
  { symbol: "PYPL", price: 67.89, change: -2.34, changePercent: -3.33 },
  { symbol: "MU", price: 98.45, change: 3.21, changePercent: 3.37 },
  { symbol: "KLAC", price: 645.23, change: 5.43, changePercent: 0.85 },
  { symbol: "SNPS", price: 512.34, change: 4.56, changePercent: 0.90 },
  { symbol: "CDNS", price: 267.89, change: 3.21, changePercent: 1.21 },
  { symbol: "MRVL", price: 78.45, change: 2.87, changePercent: 3.80 },
  { symbol: "ASML", price: 812.34, change: 7.65, changePercent: 0.95 },
  { symbol: "NXPI", price: 234.56, change: 2.98, changePercent: 1.29 },
  { symbol: "ORLY", price: 978.45, change: 8.76, changePercent: 0.90 },
  { symbol: "CSX", price: 34.56, change: 0.87, changePercent: 2.58 },
  { symbol: "ABNB", price: 145.67, change: -1.23, changePercent: -0.84 },
  { symbol: "CTAS", price: 167.89, change: 1.98, changePercent: 1.19 },
  { symbol: "ADSK", price: 267.45, change: 3.21, changePercent: 1.21 },
  { symbol: "CHTR", price: 389.23, change: -2.34, changePercent: -0.60 },
  { symbol: "MNST", price: 56.78, change: 0.98, changePercent: 1.76 },
  { symbol: "PCAR", price: 98.45, change: 1.54, changePercent: 1.59 },
  { symbol: "AEP", price: 87.32, change: 0.76, changePercent: 0.88 },
  { symbol: "PAYX", price: 123.45, change: 1.23, changePercent: 1.01 },
  { symbol: "ROST", price: 134.56, change: 2.10, changePercent: 1.58 },
  { symbol: "FAST", price: 67.89, change: 0.87, changePercent: 1.30 },
  { symbol: "ODFL", price: 456.78, change: 4.32, changePercent: 0.95 },
  { symbol: "KDP", price: 34.56, change: 0.54, changePercent: 1.59 },
  { symbol: "EA", price: 145.67, change: -1.87, changePercent: -1.27 },
  { symbol: "VRSK", price: 234.56, change: 2.34, changePercent: 1.01 },
  { symbol: "DXCM", price: 89.45, change: -2.10, changePercent: -2.29 },
  { symbol: "CTSH", price: 76.89, change: 1.21, changePercent: 1.60 },
  { symbol: "EXC", price: 38.90, change: 0.45, changePercent: 1.17 },
  { symbol: "KHC", price: 34.67, change: -0.32, changePercent: -0.91 },
  { symbol: "GEHC", price: 89.34, change: 1.76, changePercent: 2.01 },
  { symbol: "TEAM", price: 178.90, change: -2.45, changePercent: -1.35 },
  { symbol: "CSGP", price: 56.78, change: 0.98, changePercent: 1.76 },
  { symbol: "LULU", price: 389.45, change: 3.87, changePercent: 1.00 },
  { symbol: "IDXX", price: 512.34, change: 5.43, changePercent: 1.07 },
  { symbol: "ANSS", price: 345.67, change: 3.21, changePercent: 0.94 },
  { symbol: "DDOG", price: 123.45, change: -1.54, changePercent: -1.23 },
  { symbol: "XEL", price: 67.89, change: 0.76, changePercent: 1.13 },
  { symbol: "BKR", price: 34.56, change: 0.54, changePercent: 1.59 },
  { symbol: "MCHP", price: 89.45, change: 1.87, changePercent: 2.14 },
  { symbol: "WBD", price: 12.34, change: -0.43, changePercent: -3.37 },
  { symbol: "ON", price: 67.89, change: 2.10, changePercent: 3.19 },
  { symbol: "FANG", price: 156.78, change: 3.21, changePercent: 2.09 },
  { symbol: "BIIB", price: 267.89, change: -2.34, changePercent: -0.87 },
  { symbol: "CCEP", price: 67.45, change: 0.87, changePercent: 1.31 },
  { symbol: "CDW", price: 198.45, change: 2.34, changePercent: 1.19 },
  { symbol: "ILMN", price: 145.67, change: -1.76, changePercent: -1.19 },
  { symbol: "GFS", price: 89.34, change: 1.23, changePercent: 1.40 },
  { symbol: "MRNA", price: 78.90, change: -3.21, changePercent: -3.91 },
  { symbol: "CRWD", price: 267.89, change: 4.56, changePercent: 1.73 },
  { symbol: "MDB", price: 389.45, change: -2.87, changePercent: -0.73 },
  { symbol: "WBA", price: 23.45, change: -0.98, changePercent: -4.01 },
  { symbol: "FTNT", price: 67.89, change: 1.98, changePercent: 3.00 },
  { symbol: "ZS", price: 178.90, change: 3.45, changePercent: 1.97 },
  { symbol: "DASH", price: 123.45, change: -2.10, changePercent: -1.67 },
  { symbol: "WDAY", price: 234.56, change: 2.87, changePercent: 1.24 },
  { symbol: "TTWO", price: 156.78, change: -1.43, changePercent: -0.90 },
  { symbol: "TTD", price: 89.45, change: 2.34, changePercent: 2.69 },
  { symbol: "ZM", price: 67.89, change: -1.87, changePercent: -2.68 },
  { symbol: "PDD", price: 134.56, change: 3.76, changePercent: 2.88 },
  { symbol: "CPRT", price: 45.67, change: 0.98, changePercent: 2.19 },
  { symbol: "DLTR", price: 123.45, change: -0.87, changePercent: -0.70 },
  { symbol: "ENPH", price: 89.34, change: -2.45, changePercent: -2.67 },
  { symbol: "SGEN", price: 201.23, change: 1.87, changePercent: 0.94 },
  { symbol: "ALGN", price: 289.45, change: 2.98, changePercent: 1.04 },
  { symbol: "SIRI", price: 4.56, change: -0.12, changePercent: -2.56 },
];

export function SidePanel({ activePanel }: SidePanelProps) {
  const { prices, isLoading } = useTickerPrices(5000); // Poll every 5 seconds
  
  // Create a map of live prices for quick lookup
  const livePricesMap = new Map(prices.map(p => [p.symbol, p]));
  
  // Always show all 100 stocks, but merge in live prices as they become available
  const displayData = mnqConstituents.map(stock => {
    const liveData = livePricesMap.get(stock.symbol);
    // Use live data if available, otherwise use fallback
    return liveData || stock;
  });

  if (!activePanel) return null;

  const renderPanelContent = () => {
    switch (activePanel) {
      case "dashboard":
        return (
          <div className="flex flex-col h-full">
            <div className="p-2.25 pl-3.5 border-b border-[#2d2d2d]">
              <h3 className="text-xs font-medium font-dm-sans text-[#CCCCCC]">
                MNQ1! Nasdaq-100 Index
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  // Show skeletons only during initial load
                  mnqConstituents.map((stock) => (
                    <div 
                      key={stock.symbol}
                      className="p-1.5 py-1 hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
                    >
                      <TickerSkeleton />
                    </div>
                  ))
                ) : (
                  // After loading, show all stocks with live or fallback data
                  displayData.map((stock) => (
                    <div 
                      key={stock.symbol}
                      className="p-1.5 py-1 hover:bg-[#2d2d2d] rounded transition-colors cursor-pointer"
                    >
                      <Ticker>
                        <TickerIcon
                          src={`https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/${stock.symbol}.png`}
                          symbol={stock.symbol}
                        />
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <TickerSymbol symbol={stock.symbol} className="flex-shrink-0" />
                          <div className="flex items-center gap-2 ml-2">
                            <TickerPrice price={stock.price} />
                            <TickerPriceChange change={stock.changePercent} showPercent />
                          </div>
                        </div>
                      </Ticker>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      
      case "invoices":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-sans text-xs font-semibold text-[#cccccc] mb-2">Invoices</h3>
              <div className="space-y-1">
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  All Invoices
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Draft
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Sent
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Paid
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Overdue
                </button>
              </div>
            </div>
          </div>
        );
      
      case "expenses":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-sans text-xs font-semibold text-[#cccccc] mb-2">Expenses</h3>
              <div className="space-y-1">
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  All Expenses
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Materials
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Tools & Equipment
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Vehicle
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Other
                </button>
              </div>
            </div>
          </div>
        );
      
      case "reports":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-sans text-xs font-semibold text-[#cccccc] mb-2">Financial Reports</h3>
              <div className="space-y-1">
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Income Statement
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Cash Flow
                </button>
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Tax Summary
                </button>
              </div>
            </div>
          </div>
        );
      
      case "calendar":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-sans text-xs font-semibold text-[#cccccc] mb-2">Calendar</h3>
              <div className="space-y-1">
                <button className="font-sans w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Upcoming Jobs
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Payment Due Dates
                </button>
              </div>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-sans text-xs font-semibold text-[#cccccc] mb-2">Settings</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Profile
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Business Details
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Integrations
                </button>
              </div>
            </div>
          </div>
        );
      
      case "account":
        return (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <h3 className="font-sans text-xs font-semibold text-[#cccccc] mb-2">Account</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Profile
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Subscription
                </button>
                <button className="w-full text-left px-2 py-1.5 text-xs text-[#cccccc] hover:bg-[#2d2d2d] rounded">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-[240px] bg-[#1e1e1e] border-r border-[#2d2d2d] flex-shrink-0 overflow-auto">
      {renderPanelContent()}
    </div>
  );
}
