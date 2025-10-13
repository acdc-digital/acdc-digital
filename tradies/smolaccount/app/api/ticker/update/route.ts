import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

// All 100 MNQ1! constituents  
const MNQ_SYMBOLS = [
  "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "GOOG", "META", "TSLA", "AVGO", "COST",
  "NFLX", "ADBE", "PEP", "CSCO", "CMCSA", "TMUS", "INTC", "AMD", "INTU", "QCOM",
  "AMGN", "HON", "TXN", "SBUX", "AMAT", "ISRG", "BKNG", "MDLZ", "ADP", "GILD",
  "VRTX", "REGN", "ADI", "LRCX", "PANW", "PYPL", "MU", "KLAC", "SNPS", "CDNS",
  "MRVL", "ASML", "NXPI", "ORLY", "CSX", "ABNB", "CTAS", "ADSK", "CHTR", "MNST",
  "PCAR", "AEP", "PAYX", "ROST", "FAST", "ODFL", "KDP", "EA", "VRSK", "DXCM",
  "CTSH", "EXC", "KHC", "GEHC", "TEAM", "CSGP", "LULU", "IDXX", "ANSS", "DDOG",
  "XEL", "BKR", "MCHP", "WBD", "ON", "FANG", "BIIB", "CCEP", "CDW", "ILMN",
  "GFS", "MRNA", "CRWD", "MDB", "WBA", "FTNT", "ZS", "DASH", "WDAY", "TTWO",
  "TTD", "ZM", "PDD", "CPRT", "DLTR", "ENPH", "SGEN", "ALGN", "SIRI",
];

// Persistent state - stored at module level to survive across requests
const state = {
  stockPricesCache: new Map<string, {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    lastUpdated: number;
  }>(),
  currentIndex: 0,
};

// Helper function to get quote data from Finnhub using REST API with delay
async function getQuote(symbol: string, delayMs: number = 0) {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function GET() {
  try {
    // Fetch 2 stocks at a time with spacing (stays well within 60 req/min rate limit)
    const symbolsToUpdate = [];
    for (let i = 0; i < 2; i++) {
      symbolsToUpdate.push(MNQ_SYMBOLS[state.currentIndex]);
      state.currentIndex = (state.currentIndex + 1) % MNQ_SYMBOLS.length;
    }

    console.log(`[Ticker Update] Fetching quotes for: ${symbolsToUpdate.join(", ")} (index: ${state.currentIndex}/${MNQ_SYMBOLS.length}, cached: ${state.stockPricesCache.size}/100)`);

    // Fetch quotes sequentially with small delays to avoid rate limits
    const results = [];
    for (let i = 0; i < symbolsToUpdate.length; i++) {
      const symbol = symbolsToUpdate[i];
      try {
        // Add 500ms delay between requests (2 stocks = 1 second total)
        const data = await getQuote(symbol, i > 0 ? 500 : 0);
        const { c: currentPrice, d: change, dp: changePercent } = data;
        const stockData = {
          symbol,
          price: currentPrice || 0,
          change: change || 0,
          changePercent: changePercent || 0,
          lastUpdated: Date.now(),
        };
        
        // Store in persistent cache
        state.stockPricesCache.set(symbol, stockData);
        results.push({ symbol, success: true });
      } catch (error) {
        console.error(`[Ticker Update] Error fetching ${symbol}:`, error instanceof Error ? error.message : "Unknown error");
        results.push({ symbol, success: false });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Ticker Update] Successfully updated ${successCount}/2 stocks (total cached: ${state.stockPricesCache.size}/100)`);

    return NextResponse.json({
      success: true,
      updated: successCount,
      symbols: symbolsToUpdate,
      currentIndex: state.currentIndex,
      totalCached: state.stockPricesCache.size,
      progress: `${state.stockPricesCache.size}/100 stocks`,
    });
  } catch (error) {
    console.error("[Ticker Update] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Export the cache for use by other API routes
export { state };
