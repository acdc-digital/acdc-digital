// EARNINGS API V2
// Uses mock data - replace with real financial API later

import { NextRequest, NextResponse } from 'next/server';

interface EarningsEvent {
  company: string;
  ticker: string;
  date: string;
  time: 'BMO' | 'AMC' | null; // Before Market Open / After Market Close
  estimate?: number;
}

// Mock earnings data - replace with real API call
const MOCK_EARNINGS: EarningsEvent[] = [
  { company: 'Apple Inc.', ticker: 'AAPL', date: '2025-11-01', time: 'AMC', estimate: 1.54 },
  { company: 'Microsoft Corporation', ticker: 'MSFT', date: '2025-10-30', time: 'AMC', estimate: 2.83 },
  { company: 'Alphabet Inc.', ticker: 'GOOGL', date: '2025-11-05', time: 'AMC', estimate: 1.85 },
  { company: 'Amazon.com Inc.', ticker: 'AMZN', date: '2025-10-31', time: 'AMC', estimate: 1.14 },
  { company: 'Tesla Inc.', ticker: 'TSLA', date: '2025-11-15', time: 'AMC', estimate: 0.73 },
  { company: 'NVIDIA Corporation', ticker: 'NVDA', date: '2025-11-20', time: 'AMC', estimate: 0.74 },
  { company: 'Meta Platforms Inc.', ticker: 'META', date: '2025-10-28', time: 'AMC', estimate: 5.21 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get('tickers');
    
    // Parse tickers from query param
    const requestedTickers = tickersParam
      ? tickersParam.split(',').map(t => t.trim().toUpperCase())
      : MOCK_EARNINGS.map(e => e.ticker);
    
    // Filter earnings for requested tickers
    const results = MOCK_EARNINGS
      .filter(event => requestedTickers.includes(event.ticker))
      .map(event => ({
        company: event.company,
        ticker: event.ticker,
        earningsDate: event.date,
        earningsReleaseTime: event.time === 'BMO' ? 'Before Market Open' : event.time === 'AMC' ? 'After Market Close' : null,
        epsEstimate: event.estimate,
        source: 'Mock Data',
      }));
    
    console.log(`📊 Earnings API v2: Returning ${results.length} events for ${requestedTickers.join(', ')}`);
    
    return NextResponse.json({
      success: true,
      count: results.length,
      earnings: results,
      timestamp: new Date().toISOString(),
      note: 'Using mock data. Replace with real financial API (FMP, AlphaVantage, etc.)',
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
