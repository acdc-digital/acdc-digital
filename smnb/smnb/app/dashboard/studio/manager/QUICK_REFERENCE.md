# Session Manager - Alpha Vantage Quick Reference

## 🚀 Quick Start

Your Session Manager now has **13 powerful tools**:
- 7 Session Analytics Tools
- 5 Financial Market Tools (NEW!)

## 💰 Financial Tools

### 1. Real-Time Stock Quotes
**Ask:** "What's the current price of AAPL?"
- Get live stock prices
- See daily high/low
- View trading volume
- Check price changes

### 2. Company Search
**Ask:** "What's the ticker for Tesla?"
- Search by company name
- Find stock symbols
- Discover related securities

### 3. Market News & Sentiment
**Ask:** "Show me news about TSLA"
- Latest market news
- AI sentiment analysis
- Source attribution
- Relevance scoring

### 4. Company Fundamentals
**Ask:** "Give me an overview of Microsoft"
- Market capitalization
- P/E ratio & EPS
- Revenue & margins
- Dividend yield
- Beta & volatility

### 5. Technical Analysis
**Ask:** "Calculate 20-day SMA for AAPL"
- Simple Moving Average (SMA)
- Exponential Moving Average (EMA)
- Relative Strength Index (RSI)
- MACD indicators
- Bollinger Bands

## 🎯 Example Queries

### Basic Queries
```
"What's Apple stock trading at?"
"Show me Tesla's current price"
"Get quote for Microsoft"
```

### Advanced Research
```
"Analyze Tesla: price, news, and fundamentals"
"Compare AAPL and MSFT"
"What's the sentiment on tech stocks?"
```

### Technical Analysis
```
"Calculate 50-day SMA for AAPL"
"Show me RSI for NVDA"
"Get MACD for TSLA on daily"
```

### News Monitoring
```
"Latest news about Apple"
"What's happening with Tesla?"
"Show tech sector news"
```

## 📊 Data You Can Get

### Stock Quotes
- Current price
- Day's range (high/low)
- Volume
- Previous close
- Change & % change

### Company Data
- Market cap
- Financial ratios
- Revenue & earnings
- Profit margins
- 52-week range
- Dividend info

### News & Sentiment
- Headlines & summaries
- Publication time
- Sentiment scores (-1 to 1)
- Source credibility
- Ticker relevance

### Technical Indicators
- Moving averages
- Momentum indicators
- Volatility bands
- Trend signals
- Time series data

## ⚡ Pro Tips

1. **Be Specific:** Use ticker symbols when you know them (AAPL vs "Apple")
2. **Ask Natural:** The AI understands context - just ask naturally
3. **Combine Tools:** Request multiple analyses in one query
4. **Check Sentiment:** Always review news sentiment before decisions
5. **Use Intervals:** Specify timeframes for technical analysis

## 🔧 Setup Required

Make sure `ALPHA_VANTAGE_API_KEY` is set in your `.env.local`:

```bash
ALPHA_VANTAGE_API_KEY=your_key_here
```

Get free key: https://www.alphavantage.co/support/#api-key

## 📈 Common Use Cases

### Portfolio Monitoring
"Show me prices for AAPL, MSFT, and GOOGL"

### Pre-Market Research
"Give me fundamentals and news for TSLA"

### Technical Trading
"Calculate RSI and MACD for NVDA on 1-hour"

### Market Sentiment
"What's the sentiment on AI stocks?"

### Company Discovery
"Find stocks related to artificial intelligence"

## 🎨 Tool Icons in Chat

When tools execute, you'll see:
- 📈 Stock Quote (cyan)
- 🔎 Symbol Search (indigo)
- 📰 Market News (pink)
- 🏢 Company Info (violet)
- 📉 Technical Analysis (rose)

## ⚠️ Rate Limits

**Free Tier:**
- 25 requests per day
- 5 requests per minute

**Need More?**
Upgrade at: https://www.alphavantage.co/premium/

## 🆘 Troubleshooting

**"API key not configured"**
→ Add ALPHA_VANTAGE_API_KEY to .env.local

**"Rate limit exceeded"**
→ Wait a minute or upgrade your plan

**"Symbol not found"**
→ Try search_stock_symbol first to find the correct ticker

**"No data available"**
→ Some stocks/intervals may not have data - try different parameters

## 📚 Learn More

Full integration docs: `./ALPHA_VANTAGE_INTEGRATION.md`

Alpha Vantage docs: https://www.alphavantage.co/documentation/
