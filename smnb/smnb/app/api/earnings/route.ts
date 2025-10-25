// EARNINGS REPORTS API
// /Users/matthewsimon/Projects/SMNB/smnb/app/api/earnings/route.ts

/**
 * Fetch earnings reports for NASDAQ-100 companies using Finlight.me API
 * 
 * Returns structured earnings data including:
 * - Company name and ticker
 * - Earnings date
 * - Conference call time
 * - Earnings release time (if available)
 */

import { NextRequest, NextResponse } from 'next/server';

// NASDAQ-100 major tickers (subset for initial implementation)
const NASDAQ_100_TICKERS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'AVGO', name: 'Broadcom Inc.' },
  { ticker: 'COST', name: 'Costco Wholesale Corp.' },
  { ticker: 'NFLX', name: 'Netflix Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices Inc.' },
  { ticker: 'PEP', name: 'PepsiCo Inc.' },
  { ticker: 'ADBE', name: 'Adobe Inc.' },
  { ticker: 'CSCO', name: 'Cisco Systems Inc.' },
  { ticker: 'CMCSA', name: 'Comcast Corp.' },
  { ticker: 'INTC', name: 'Intel Corp.' },
  { ticker: 'QCOM', name: 'Qualcomm Inc.' },
  { ticker: 'TXN', name: 'Texas Instruments Inc.' },
  { ticker: 'INTU', name: 'Intuit Inc.' },
  { ticker: 'AMGN', name: 'Amgen Inc.' },
];

interface EarningsReport {
  company: string;
  ticker: string;
  earningsDate: string;
  conferenceCallTime: string | null;
  earningsReleaseTime: string | null;
  source?: string;
}

interface FinlightArticle {
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  entities?: {
    tickers?: string[];
  };
}

interface FinlightResponse {
  articles: FinlightArticle[];
  totalResults: number;
}

/**
 * Extract earnings information from article content
 */
function extractEarningsInfo(article: FinlightArticle): {
  date: string | null;
  callTime: string | null;
  releaseTime: string | null;
} {
  const content = `${article.title} ${article.description} ${article.content}`.toLowerCase();
  
  // Common earnings keywords
  const earningsKeywords = [
    'earnings call',
    'earnings conference',
    'quarterly earnings',
    'q1 earnings',
    'q2 earnings',
    'q3 earnings',
    'q4 earnings',
    'earnings report',
    'earnings release',
    'earnings announcement',
  ];
  
  // Check if this is actually about earnings
  const isEarnings = earningsKeywords.some(keyword => content.includes(keyword));
  if (!isEarnings) {
    return { date: null, callTime: null, releaseTime: null };
  }
  
  // Extract date patterns (various formats)
  // Examples: "October 29, 2024", "Oct 29", "10/29/2024", "2024-10-29"
  const datePatterns = [
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{1,2},?\s+\d{4}/gi,
    /\d{1,2}\/\d{1,2}\/\d{4}/g,
    /\d{4}-\d{2}-\d{2}/g,
  ];
  
  let extractedDate: string | null = null;
  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      extractedDate = match[0];
      break;
    }
  }
  
  // Extract conference call time
  // Examples: "2:30 PM PT", "2:30 p.m. ET", "14:30 PST", "at 5:00 PM Eastern"
  const callTimePatterns = [
    /(?:call|conference).*?(\d{1,2}:\d{2}\s*(?:am|pm|a\.m\.|p\.m\.)\s*(?:et|pt|ct|mt|est|pst|cst|mst|eastern|pacific|central|mountain)?)/gi,
    /(?:at|scheduled for)\s+(\d{1,2}:\d{2}\s*(?:am|pm|a\.m\.|p\.m\.)\s*(?:et|pt|ct|mt|est|pst|cst|mst|eastern|pacific|central|mountain)?)/gi,
  ];
  
  let callTime: string | null = null;
  for (const pattern of callTimePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      callTime = match[1].trim();
      break;
    }
  }
  
  // Extract earnings release time (before market, after market, specific time)
  const releaseTimePatterns = [
    /(?:released?|publish(?:ed)?|announce(?:d)?).*?(?:before|after)\s+(?:the\s+)?(?:market|trading|bell)/gi,
    /(?:before|after)\s+(?:the\s+)?(?:market|trading|bell).*?(?:release|publish|announce)/gi,
    /(?:release|publish|announce).*?(\d{1,2}:\d{2}\s*(?:am|pm|a\.m\.|p\.m\.)\s*(?:et|pt|ct|mt)?)/gi,
  ];
  
  let releaseTime: string | null = null;
  for (const pattern of releaseTimePatterns) {
    const match = content.match(pattern);
    if (match) {
      if (match[1]) {
        releaseTime = match[1].trim();
      } else {
        releaseTime = match[0].includes('before') ? 'Before Market Open' : 'After Market Close';
      }
      break;
    }
  }
  
  return { date: extractedDate, callTime, releaseTime };
}

/**
 * Fetch earnings data for a specific ticker
 */
async function fetchTickerEarnings(ticker: string, apiKey: string): Promise<EarningsReport | null> {
  try {
    // Build Finlight query to find earnings-related articles
    // Try broader search without ticker field filter first
    const query = `${ticker} AND (earnings OR "quarterly results" OR "Q1" OR "Q2" OR "Q3" OR "Q4" OR "fiscal")`;
    
    // Fetch from last 90 days to catch upcoming earnings announcements
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`🔍 ${ticker}: Searching with query: "${query}" from ${fromDate}`);
    
    const requestBody = {
      query,
      from: fromDate,
      pageSize: 20, // Get more results to find earnings announcements
      language: 'en',
      includeContent: true,
      includeEntities: true,
      sortBy: 'publishedAt', // Most recent first
    };
    
    const response = await fetch('https://api.finlight.me/v2/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      console.error(`❌ Finlight API error for ${ticker}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: FinlightResponse = await response.json();
    
    console.log(`📰 ${ticker}: Found ${data.articles?.length || 0} articles (total: ${data.totalResults})`);
    
    if (!data.articles || data.articles.length === 0) {
      console.log(`ℹ️ No earnings articles found for ${ticker}`);
      return null;
    }
    
    // Debug: Log first article title to see what we're getting
    if (data.articles.length > 0) {
      console.log(`📄 ${ticker} sample: "${data.articles[0].title}"`);
    }
    
    // Process articles to extract earnings info
    let bestMatch: {
      date: string | null;
      callTime: string | null;
      releaseTime: string | null;
      source: string;
    } | null = null;
    
    for (const article of data.articles) {
      const info = extractEarningsInfo(article);
      
      // Debug: Log what we extracted
      if (info.date || info.callTime || info.releaseTime) {
        console.log(`  ✓ ${ticker}: date=${info.date}, call=${info.callTime}, release=${info.releaseTime}`);
      }
      
      // If we found a date, this is a good match
      if (info.date) {
        bestMatch = {
          date: info.date,
          callTime: info.callTime,
          releaseTime: info.releaseTime,
          source: article.source.name,
        };
        break; // Use first match with date
      }
    }
    
    if (!bestMatch || !bestMatch.date) {
      console.log(`ℹ️ No earnings date found for ${ticker}`);
      return null;
    }
    
    // Find company name from NASDAQ_100_TICKERS
    const company = NASDAQ_100_TICKERS.find(t => t.ticker === ticker);
    
    return {
      company: company?.name || ticker,
      ticker,
      earningsDate: bestMatch.date,
      conferenceCallTime: bestMatch.callTime,
      earningsReleaseTime: bestMatch.releaseTime,
      source: bestMatch.source,
    };
    
  } catch (error) {
    console.error(`❌ Error fetching earnings for ${ticker}:`, error);
    return null;
  }
}

/**
 * GET /api/earnings
 * 
 * Query params:
 * - tickers: Comma-separated list of tickers (optional, defaults to all NASDAQ-100)
 * - from: Start date for earnings search (optional, defaults to now)
 * - to: End date for earnings search (optional, defaults to 60 days from now)
 */
export async function GET(request: NextRequest) {
  try {
    const API_KEY = process.env.FINLIGHT_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'FINLIGHT_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const tickersParam = searchParams.get('tickers');
    const tickersToFetch = tickersParam 
      ? tickersParam.split(',').map(t => t.trim().toUpperCase())
      : NASDAQ_100_TICKERS.map(t => t.ticker);
    
    console.log(`📊 Fetching earnings for ${tickersToFetch.length} tickers...`);
    
    // Fetch earnings for all tickers (with rate limiting consideration)
    const results: EarningsReport[] = [];
    
    for (const ticker of tickersToFetch) {
      const earnings = await fetchTickerEarnings(ticker, API_KEY);
      if (earnings) {
        results.push(earnings);
      }
      
      // Small delay to avoid rate limiting (50ms between requests)
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Sort by earnings date (earliest first)
    results.sort((a, b) => {
      const dateA = new Date(a.earningsDate);
      const dateB = new Date(b.earningsDate);
      return dateA.getTime() - dateB.getTime();
    });
    
    console.log(`✅ Found ${results.length} earnings reports`);
    
    return NextResponse.json({
      success: true,
      count: results.length,
      earnings: results,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Earnings API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch earnings data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
