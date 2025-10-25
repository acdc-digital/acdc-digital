// EARNINGS API - Alpha Vantage
// Free tier: 25 requests/day, 5 requests/minute

import { NextRequest, NextResponse } from 'next/server';

interface EarningsEvent {
  company: string;
  ticker: string;
  earningsDate: string;
  earningsReleaseTime: string | null;
  fiscalPeriod: string | null;
  epsEstimate: number | null;
  source: string;
}

// NASDAQ-100 major companies
const TICKER_TO_COMPANY: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  GOOGL: 'Alphabet Inc.',
  AMZN: 'Amazon.com Inc.',
  NVDA: 'NVIDIA Corporation',
  META: 'Meta Platforms Inc.',
  TSLA: 'Tesla Inc.',
  NFLX: 'Netflix Inc.',
  AMD: 'Advanced Micro Devices',
  INTC: 'Intel Corporation',
  CSCO: 'Cisco Systems',
  ADBE: 'Adobe Inc.',
  QCOM: 'Qualcomm Inc.',
  COST: 'Costco Wholesale',
  AVGO: 'Broadcom Inc.',
  PEP: 'PepsiCo Inc.',
  TXN: 'Texas Instruments',
  INTU: 'Intuit Inc.',
  CMCSA: 'Comcast Corporation',
  TMUS: 'T-Mobile US',
};

const DEFAULT_TICKERS = Object.keys(TICKER_TO_COMPANY).slice(0, 10);

/**
 * Fetch earnings calendar from Alpha Vantage
 * Function: EARNINGS_CALENDAR
 * @see https://www.alphavantage.co/documentation/#earnings-calendar
 */
async function fetchAlphaVantageEarnings(
  tickers: string[],
  apiKey: string
): Promise<EarningsEvent[]> {
  const results: EarningsEvent[] = [];
  
  try {
    // Alpha Vantage EARNINGS_CALENDAR returns upcoming earnings for all symbols
    // Note: Returns CSV format by default
    const url = `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`;
    
    console.log('📊 Fetching earnings calendar from Alpha Vantage...');
    
    const response = await fetch(url, {
      method: 'GET',
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`❌ Alpha Vantage API error: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText.substring(0, 500)}`);
      return [];
    }
    
    console.log(`📝 Response preview: ${responseText.substring(0, 200)}...`);
    
    // Check for API limit errors or premium requirements
    if (responseText.includes('API rate limit') || 
        responseText.includes('premium endpoint') ||
        responseText.includes('Thank you for using Alpha Vantage')) {
      console.error('❌ Alpha Vantage: API rate limit exceeded or premium required');
      console.error(`Full response: ${responseText}`);
      return [];
    }
    
    // Parse CSV (format: symbol,name,reportDate,fiscalDateEnding,estimate,currency)
    const lines = responseText.trim().split('\n');
    
    console.log(`📄 Parsing ${lines.length - 1} earnings events from CSV`);
    
    // Filter for requested tickers
    const tickerSet = new Set(tickers.map(t => t.toUpperCase()));
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 6) continue;
      
      const symbol = values[0]?.trim();
      const name = values[1]?.trim();
      const reportDate = values[2]?.trim();
      const fiscalDateEnding = values[3]?.trim();
      const estimate = values[4]?.trim();
      
      // Only include requested tickers
      if (!tickerSet.has(symbol)) continue;
      
      const company = TICKER_TO_COMPANY[symbol] || name;
      
      results.push({
        company,
        ticker: symbol,
        earningsDate: reportDate,
        earningsReleaseTime: null, // Alpha Vantage doesn't provide BMO/AMC
        fiscalPeriod: fiscalDateEnding,
        epsEstimate: estimate && estimate !== '-' ? parseFloat(estimate) : null,
        source: 'Alpha Vantage',
      });
      
      console.log(`  ✓ ${symbol}: ${reportDate} (EPS est: ${estimate || 'N/A'})`);
    }
    
    console.log(`✅ Found ${results.length} earnings events for requested tickers`);
    
  } catch (error) {
    console.error('❌ Error fetching from Alpha Vantage:', error);
  }
  
  return results;
}

export async function GET(request: NextRequest) {
  try {
    // Get Alpha Vantage API key
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'ALPHA_VANTAGE_API_KEY not configured',
          count: 0,
          earnings: [],
          note: 'Get free API key at https://www.alphavantage.co/support/#api-key',
        },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get('tickers');
    
    // Parse tickers from query param or use defaults
    const tickers = tickersParam
      ? tickersParam.split(',').map(t => t.trim().toUpperCase())
      : DEFAULT_TICKERS;
    
    console.log(`🔍 Fetching earnings for: ${tickers.join(', ')}`);
    
    // Fetch earnings data
    const earnings = await fetchAlphaVantageEarnings(tickers, apiKey);
    
    return NextResponse.json({
      success: true,
      count: earnings.length,
      earnings,
      timestamp: new Date().toISOString(),
      limits: {
        daily: '25 requests',
        perMinute: '5 requests',
        note: 'Free tier limits. Upgrade for more: https://www.alphavantage.co/premium/',
      },
    });
    
  } catch (error) {
    console.error('❌ Earnings API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        count: 0,
        earnings: [],
      },
      { status: 500 }
    );
  }
}
