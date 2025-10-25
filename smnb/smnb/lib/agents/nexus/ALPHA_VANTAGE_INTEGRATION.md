# Alpha Vantage MCP Integration for SessionManagerAgent

## Overview

The SessionManagerAgent now includes **5 financial market data tools** powered by Alpha Vantage's official MCP server. This integration provides real-time stock market data, company fundamentals, news sentiment, and technical analysis capabilities alongside the existing session analytics tools.

## Architecture

```
User Query
    ↓
SessionManagerAgent (Claude 3.5 Haiku)
    ↓
Alpha Vantage MCP Server (https://mcp.alphavantage.co/mcp)
    ↓
Alpha Vantage REST API
    ↓
Real-time Financial Data
    ↓
Claude Interprets & Formats Response
    ↓
Stream to User
```

## Setup

### 1. Environment Variables

Add your Alpha Vantage API key to `.env.local`:

```bash
# Alpha Vantage API Key (for fetching financial data)
# Get free key at: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### 2. Get Free API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Enter your email
3. Copy the API key
4. Add to `.env.local`

**Free Tier Limits:**
- 25 requests per day
- 5 API requests per minute

**Premium Tiers Available:**
- More requests per day/minute
- Real-time data updates
- Historical data access
- See: https://www.alphavantage.co/premium/

## Available Financial Tools

### 1. `get_stock_quote`
Get real-time stock price, volume, and market data.

**Example Queries:**
- "What's the current price of AAPL?"
- "Show me TSLA stock data"
- "Get the latest quote for MSFT"

**Response Data:**
- Current price
- Day's high/low
- Trading volume
- Previous close
- Change/change percent

### 2. `search_stock_symbol`
Search for stock ticker symbols by company name.

**Example Queries:**
- "What's the ticker for Apple?"
- "Find the symbol for Tesla"
- "Search for Microsoft stock"

**Response Data:**
- Symbol (ticker)
- Company name
- Type (Stock, ETF, etc.)
- Region
- Currency

### 3. `get_stock_news`
Get latest market news with AI sentiment analysis.

**Example Queries:**
- "Show me AAPL news"
- "What's the latest on Tesla?"
- "Get news sentiment for tech stocks"

**Response Data:**
- Article title & summary
- Source & author
- Publication time
- Sentiment score (-1 to 1)
- Relevance score
- Ticker mentions

### 4. `get_company_overview`
Get comprehensive company fundamentals and financial ratios.

**Example Queries:**
- "Give me an overview of AAPL"
- "Show company info for Microsoft"
- "What are Tesla's financials?"

**Response Data:**
- Market cap
- P/E ratio
- EPS
- Revenue
- Profit margin
- 52-week high/low
- Dividend yield
- Beta

### 5. `get_technical_indicator`
Calculate technical analysis indicators.

**Supported Indicators:**
- **SMA** - Simple Moving Average
- **EMA** - Exponential Moving Average  
- **RSI** - Relative Strength Index
- **MACD** - Moving Average Convergence Divergence
- **BBANDS** - Bollinger Bands

**Example Queries:**
- "Calculate 20-day SMA for AAPL"
- "Show me RSI for TSLA"
- "Get MACD indicator for MSFT on daily interval"

**Response Data:**
- Indicator values over time
- Timestamps
- Metadata (period, interval)

## Usage Examples

### Basic Stock Query
```
User: "What's the current price of Apple stock?"

Agent:
1. Calls search_stock_symbol("Apple") → AAPL
2. Calls get_stock_quote("AAPL")
3. Returns formatted price, volume, and change data
```

### News & Sentiment Analysis
```
User: "Show me recent news about Tesla with sentiment"

Agent:
1. Calls get_stock_news(tickers="TSLA", limit=10)
2. Returns news articles with sentiment scores
3. Summarizes overall market sentiment
```

### Company Research
```
User: "Give me a full analysis of Microsoft"

Agent:
1. Calls get_company_overview("MSFT")
2. Calls get_stock_news(tickers="MSFT")
3. Calls get_technical_indicator("MSFT", "RSI", "daily")
4. Synthesizes comprehensive company report
```

## Tool Configurations

All tools are configured in `SessionManagerAgent.ts`:

```typescript
// Alpha Vantage MCP Server URL
const ALPHA_VANTAGE_MCP_URL = 'https://mcp.alphavantage.co/mcp';

// Tools are defined in defineTools() method
protected defineTools(): Tool[] {
  return [
    // ... existing session analytics tools ...
    
    // Financial tools
    { name: 'get_stock_quote', ... },
    { name: 'search_stock_symbol', ... },
    { name: 'get_stock_news', ... },
    { name: 'get_company_overview', ... },
    { name: 'get_technical_indicator', ... },
  ];
}
```

## UI Integration

### Updated Chat Suggestions

New financial suggestions added to initial chat view:
- "What's the current AAPL stock price?"
- "Show TSLA news and sentiment"
- "Get company overview for MSFT"

### Tool Execution Display

Financial tools show with distinct icons and colors:
- 📈 Stock Quote (cyan)
- 🔎 Symbol Search (indigo)
- 📰 Market News (pink)
- 🏢 Company Info (violet)
- 📉 Technical Analysis (rose)

### Settings Panel

Updated to show both tool categories:
- **Session Analytics Tools** (7 tools)
- **Financial Market Tools** (5 tools)

Total: **13 tools** available

## Error Handling

The integration includes robust error handling:

```typescript
if (!ALPHA_VANTAGE_API_KEY) {
  return {
    error: true,
    message: 'Alpha Vantage API key not configured. Set ALPHA_VANTAGE_API_KEY in environment variables.',
  };
}
```

**Common Errors:**
1. **Missing API Key** - Returns helpful error message with setup instructions
2. **Rate Limit Exceeded** - Alpha Vantage returns specific rate limit error
3. **Invalid Symbol** - Returns symbol not found error
4. **Network Error** - Catches and returns fetch errors

## Rate Limiting

**Free Tier:** 25 requests/day, 5 requests/minute

**Best Practices:**
- Cache results when possible
- Batch requests intelligently
- Consider upgrading for production use
- Use appropriate time intervals for technical indicators

## MCP Protocol Details

The integration uses Alpha Vantage's official MCP server:

**Server URL:** `https://mcp.alphavantage.co/mcp?apikey=YOUR_API_KEY`

**Request Format:**
```typescript
{
  method: 'tools/call',
  params: {
    name: 'GLOBAL_QUOTE',  // Tool name
    arguments: {
      symbol: 'AAPL'       // Tool arguments
    }
  }
}
```

**Response Format:**
```typescript
{
  content: [
    {
      type: 'text',
      text: '{"Global Quote": {...}}'
    }
  ]
}
```

## Capabilities Added

Updated agent capabilities:
- `financial-data`
- `stock-market-data`
- `real-time-quotes`
- `technical-analysis`

## System Prompt Enhancement

The agent's system prompt now includes:

```
FINANCIAL MARKET DATA (Alpha Vantage):
- get_stock_quote: Real-time stock prices and market data
- search_stock_symbol: Find ticker symbols by company name
- get_stock_news: Latest news and sentiment analysis
- get_company_overview: Company fundamentals and financial ratios
- get_technical_indicator: Technical analysis indicators (SMA, EMA, RSI, MACD, etc.)

You have access to comprehensive financial market data through Alpha Vantage MCP server.
Use these tools when users ask about stocks, market data, company information, or technical analysis.
```

## Testing

### Test Commands

Try these in the Session Manager chat:

1. **Basic Quote:**
   - "What's AAPL trading at?"
   - "Show me Tesla's current price"

2. **Company Research:**
   - "Give me an overview of Microsoft"
   - "What are Amazon's fundamentals?"

3. **News & Sentiment:**
   - "Show recent news about NVDA"
   - "What's the sentiment on tech stocks?"

4. **Technical Analysis:**
   - "Calculate 50-day SMA for AAPL"
   - "Show me RSI for Bitcoin stocks"

5. **Multi-Tool Queries:**
   - "Analyze Tesla: price, news, and company info"
   - "Compare AAPL and MSFT fundamentals"

## Files Modified

1. **`SessionManagerAgent.ts`**
   - Added 5 financial tool definitions
   - Added 5 handler methods
   - Updated capabilities
   - Enhanced system prompt

2. **`ACDCChatMessage.tsx`**
   - Added financial tool icons and colors
   - Updated TOOL_INFO mapping

3. **`ACDCChat.tsx`**
   - Added financial suggestions
   - Updated tool count (8 → 13)
   - Enhanced settings panel

4. **`.env.local`**
   - Added ALPHA_VANTAGE_API_KEY

## Alpha Vantage Full Tool Catalog

The MCP server provides access to **100+ tools** across these categories:

### Core Stock APIs
- TIME_SERIES_INTRADAY, TIME_SERIES_DAILY, TIME_SERIES_DAILY_ADJUSTED
- GLOBAL_QUOTE, REALTIME_BULK_QUOTES, SYMBOL_SEARCH, MARKET_STATUS

### Options Data
- REALTIME_OPTIONS, HISTORICAL_OPTIONS

### Alpha Intelligence
- NEWS_SENTIMENT, EARNINGS_CALL_TRANSCRIPT, TOP_GAINERS_LOSERS
- INSIDER_TRANSACTIONS, ANALYTICS_FIXED_WINDOW

### Fundamental Data
- COMPANY_OVERVIEW, INCOME_STATEMENT, BALANCE_SHEET, CASH_FLOW
- EARNINGS, LISTING_STATUS, EARNINGS_CALENDAR, IPO_CALENDAR

### Forex
- FX_INTRADAY, FX_DAILY, FX_WEEKLY, FX_MONTHLY

### Cryptocurrencies
- CURRENCY_EXCHANGE_RATE, DIGITAL_CURRENCY_DAILY

### Commodities
- WTI, BRENT, NATURAL_GAS, COPPER, ALUMINUM, WHEAT, CORN

### Economic Indicators
- REAL_GDP, TREASURY_YIELD, CPI, INFLATION, UNEMPLOYMENT

### Technical Indicators (50+)
- SMA, EMA, RSI, MACD, BBANDS, STOCH, ADX, VWAP, etc.

**To add more tools:** Follow the same pattern in `SessionManagerAgent.ts`

## Resources

- **Alpha Vantage Docs:** https://www.alphavantage.co/documentation/
- **MCP Server Docs:** https://mcp.alphavantage.co/
- **API Key:** https://www.alphavantage.co/support/#api-key
- **Premium Plans:** https://www.alphavantage.co/premium/

## Support

For Alpha Vantage support: support@alphavantage.co

For integration issues: Check console logs in SessionManagerAgent handlers
