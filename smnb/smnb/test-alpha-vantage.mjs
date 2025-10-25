#!/usr/bin/env node

/**
 * Alpha Vantage MCP Integration Test
 * 
 * Quick test script to verify Alpha Vantage tools are working
 * Run: node test-alpha-vantage.mjs
 */

const ALPHA_VANTAGE_MCP_URL = 'https://mcp.alphavantage.co/mcp';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '4OI3ZP0V6AYU8EW0';

console.log('🧪 Testing Alpha Vantage MCP Integration...\n');

// Test 1: Stock Quote
async function testStockQuote() {
  try {
    console.log('📈 Test 1: Get Stock Quote for AAPL');
    
    const url = `${ALPHA_VANTAGE_MCP_URL}?apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'GLOBAL_QUOTE',
          arguments: { symbol: 'AAPL' }
        }
      }),
    });
    
    const data = await response.json();
    
    if (data.content?.[0]?.text) {
      const result = JSON.parse(data.content[0].text);
      console.log('✅ Success! Quote data:', {
        symbol: result['Global Quote']?.[0]?.symbol,
        price: result['Global Quote']?.[0]?.price,
        volume: result['Global Quote']?.[0]?.volume
      });
    } else {
      console.log('❌ Unexpected response:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  console.log('');
}

// Test 2: Symbol Search
async function testSymbolSearch() {
  try {
    console.log('🔎 Test 2: Search Symbol for "Tesla"');
    
    const url = `${ALPHA_VANTAGE_MCP_URL}?apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'SYMBOL_SEARCH',
          arguments: { keywords: 'Tesla' }
        }
      }),
    });
    
    const data = await response.json();
    
    if (data.content?.[0]?.text) {
      const result = JSON.parse(data.content[0].text);
      const matches = result.bestMatches || [];
      console.log(`✅ Success! Found ${matches.length} matches`);
      if (matches.length > 0) {
        console.log('Top match:', {
          symbol: matches[0]['1. symbol'],
          name: matches[0]['2. name']
        });
      }
    } else {
      console.log('❌ Unexpected response:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  console.log('');
}

// Test 3: Company Overview
async function testCompanyOverview() {
  try {
    console.log('🏢 Test 3: Get Company Overview for MSFT');
    
    const url = `${ALPHA_VANTAGE_MCP_URL}?apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        params: {
          name: 'COMPANY_OVERVIEW',
          arguments: { symbol: 'MSFT' }
        }
      }),
    });
    
    const data = await response.json();
    
    if (data.content?.[0]?.text) {
      const result = JSON.parse(data.content[0].text);
      console.log('✅ Success! Company data:', {
        symbol: result.Symbol,
        name: result.Name,
        marketCap: result.MarketCapitalization,
        peRatio: result.PERatio
      });
    } else {
      console.log('❌ Unexpected response:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  console.log('');
}

// Run all tests
(async () => {
  console.log(`Using API Key: ${ALPHA_VANTAGE_API_KEY.substring(0, 8)}...\n`);
  
  await testStockQuote();
  
  // Wait 13 seconds between calls to respect rate limit (5 per minute)
  console.log('⏳ Waiting 13 seconds (rate limit: 5/min)...\n');
  await new Promise(resolve => setTimeout(resolve, 13000));
  
  await testSymbolSearch();
  
  console.log('⏳ Waiting 13 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 13000));
  
  await testCompanyOverview();
  
  console.log('✅ All tests complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Navigate to Session Manager');
  console.log('3. Try: "What\'s the current price of AAPL?"');
})();
