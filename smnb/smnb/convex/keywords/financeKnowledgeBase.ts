// FINANCE KNOWLEDGE BASE
// Nasdaq-100 tickers, companies, and entity resolution

/**
 * Nasdaq-100 ticker information
 * This is a static dataset updated periodically
 * For a production system, this would be loaded from a database or API
 */
export const NASDAQ_100_TICKERS = [
  // Top tech giants
  { symbol: 'AAPL', name: 'Apple Inc.', aliases: ['apple', 'iphone', 'tim cook'], sector: 'Technology', industry: 'Consumer Electronics' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', aliases: ['microsoft', 'windows', 'satya nadella', 'azure'], sector: 'Technology', industry: 'Software' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', aliases: ['alphabet', 'google', 'sundar pichai', 'youtube'], sector: 'Technology', industry: 'Internet' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', aliases: ['amazon', 'aws', 'jeff bezos', 'andy jassy', 'prime'], sector: 'Consumer Cyclical', industry: 'E-commerce' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', aliases: ['nvidia', 'jensen huang', 'geforce', 'cuda'], sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'META', name: 'Meta Platforms Inc.', aliases: ['meta', 'facebook', 'instagram', 'whatsapp', 'mark zuckerberg'], sector: 'Technology', industry: 'Social Media' },
  { symbol: 'TSLA', name: 'Tesla Inc.', aliases: ['tesla', 'elon musk', 'model 3', 'model y', 'cybertruck'], sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  
  // Other major tech
  { symbol: 'AVGO', name: 'Broadcom Inc.', aliases: ['broadcom'], sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'ORCL', name: 'Oracle Corporation', aliases: ['oracle', 'larry ellison'], sector: 'Technology', industry: 'Software' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', aliases: ['cisco'], sector: 'Technology', industry: 'Networking' },
  { symbol: 'ADBE', name: 'Adobe Inc.', aliases: ['adobe', 'photoshop', 'acrobat'], sector: 'Technology', industry: 'Software' },
  { symbol: 'NFLX', name: 'Netflix Inc.', aliases: ['netflix'], sector: 'Communication Services', industry: 'Entertainment' },
  { symbol: 'CRM', name: 'Salesforce Inc.', aliases: ['salesforce', 'marc benioff'], sector: 'Technology', industry: 'Software' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', aliases: ['amd', 'ryzen', 'radeon', 'lisa su'], sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'INTC', name: 'Intel Corporation', aliases: ['intel', 'core', 'xeon'], sector: 'Technology', industry: 'Semiconductors' },
  { symbol: 'QCOM', name: 'QUALCOMM Inc.', aliases: ['qualcomm', 'snapdragon'], sector: 'Technology', industry: 'Semiconductors' },
  
  // Additional notable companies (abbreviated list - full Nasdaq-100 has 100+ companies)
  { symbol: 'COST', name: 'Costco Wholesale Corporation', aliases: ['costco'], sector: 'Consumer Defensive', industry: 'Retail' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', aliases: ['pepsi', 'pepsico'], sector: 'Consumer Defensive', industry: 'Beverages' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', aliases: ['t-mobile', 'tmobile'], sector: 'Communication Services', industry: 'Telecom' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', aliases: ['comcast', 'xfinity'], sector: 'Communication Services', industry: 'Telecom' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', aliases: ['paypal'], sector: 'Financial Services', industry: 'Payments' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', aliases: ['airbnb'], sector: 'Consumer Cyclical', industry: 'Travel' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', aliases: ['starbucks'], sector: 'Consumer Cyclical', industry: 'Restaurants' },
] as const;

/**
 * Additional ticker patterns to recognize in text
 */
export const TICKER_PATTERNS = [
  // $TICKER format (common on social media)
  /\$([A-Z]{1,5})\b/g,
  // TICKER format (when surrounded by spaces/punctuation)
  /\b([A-Z]{2,5})\b(?=\s|[.,!?]|$)/g,
];

/**
 * Stopwords that look like tickers but aren't
 */
export const TICKER_STOPLIST = new Set([
  'USA', 'CEO', 'IPO', 'ETF', 'USD', 'API', 'AI', 'ML', 'UI', 'UX',
  'GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'OS', 'PC', 'MAC', 'IOS',
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN',
  'WAS', 'ONE', 'OUR', 'OUT', 'WHO', 'GET', 'HAS', 'HIM', 'HIS',
  'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY',
  'USE', 'HER', 'SHE', 'HIM', 'WHY', 'LET', 'PUT', 'SAY', 'SHE',
  'TOO', 'USE'
]);

/**
 * Build a normalized alias index for fast lookups
 */
export function buildFinanceAliasIndex(): Map<string, string[]> {
  const aliasIndex = new Map<string, string[]>();
  
  for (const ticker of NASDAQ_100_TICKERS) {
    // Add the symbol itself
    const symbolKey = ticker.symbol.toLowerCase();
    if (!aliasIndex.has(symbolKey)) {
      aliasIndex.set(symbolKey, []);
    }
    aliasIndex.get(symbolKey)!.push(ticker.symbol);
    
    // Add company name
    const nameKey = ticker.name.toLowerCase();
    if (!aliasIndex.has(nameKey)) {
      aliasIndex.set(nameKey, []);
    }
    aliasIndex.get(nameKey)!.push(ticker.symbol);
    
    // Add aliases
    for (const alias of ticker.aliases) {
      const aliasKey = alias.toLowerCase();
      if (!aliasIndex.has(aliasKey)) {
        aliasIndex.set(aliasKey, []);
      }
      aliasIndex.get(aliasKey)!.push(ticker.symbol);
    }
  }
  
  return aliasIndex;
}

/**
 * Resolve finance entities from text
 */
export interface FinanceEntityMatch {
  ticker: string;
  matchedText: string;
  matchType: 'symbol' | 'company' | 'alias' | 'pattern';
  confidence: number;
  position: number;
}

/**
 * Extract finance entities from text
 */
export function resolveFinanceEntities(text: string): FinanceEntityMatch[] {
  const matches: FinanceEntityMatch[] = [];
  const normalizedText = text.toLowerCase();
  const aliasIndex = buildFinanceAliasIndex();
  
  // 1. Check for ticker patterns ($AAPL, AAPL)
  for (const pattern of TICKER_PATTERNS) {
    const regex = new RegExp(pattern);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const potentialTicker = match[1].toUpperCase();
      
      // Skip if in stoplist
      if (TICKER_STOPLIST.has(potentialTicker)) {
        continue;
      }
      
      // Check if it's a known ticker
      const tickerKey = potentialTicker.toLowerCase();
      if (aliasIndex.has(tickerKey)) {
        const tickers = aliasIndex.get(tickerKey)!;
        matches.push({
          ticker: tickers[0], // Primary ticker
          matchedText: match[0],
          matchType: 'symbol',
          confidence: 0.95,
          position: match.index
        });
      }
    }
  }
  
  // 2. Check for company names and aliases
  for (const [alias, tickers] of aliasIndex.entries()) {
    if (alias.length < 3) continue; // Skip very short aliases
    
    const index = normalizedText.indexOf(alias);
    if (index !== -1) {
      // Verify word boundaries
      const before = index > 0 ? normalizedText[index - 1] : ' ';
      const after = index + alias.length < normalizedText.length 
        ? normalizedText[index + alias.length] 
        : ' ';
      
      const isWordBoundary = /[\s.,!?;:]/.test(before) && /[\s.,!?;:]/.test(after);
      
      if (isWordBoundary) {
        matches.push({
          ticker: tickers[0],
          matchedText: text.substring(index, index + alias.length),
          matchType: alias === tickers[0].toLowerCase() ? 'symbol' : 'alias',
          confidence: 0.85,
          position: index
        });
      }
    }
  }
  
  // 3. Deduplicate by ticker (keep highest confidence)
  const deduped = new Map<string, FinanceEntityMatch>();
  for (const match of matches) {
    const existing = deduped.get(match.ticker);
    if (!existing || match.confidence > existing.confidence) {
      deduped.set(match.ticker, match);
    }
  }
  
  return Array.from(deduped.values()).sort((a, b) => a.position - b.position);
}

/**
 * Get ticker information
 */
export function getTickerInfo(symbol: string) {
  return NASDAQ_100_TICKERS.find(t => t.symbol === symbol.toUpperCase());
}

/**
 * Get sector for a ticker
 */
export function getTickerSector(symbol: string): string | undefined {
  const info = getTickerInfo(symbol);
  return info?.sector;
}

/**
 * Get market cap weight (simplified - in production, load from real data)
 */
export function getMarketCapWeight(symbol: string): number {
  // Simplified weights - in production, use real market cap data
  const topWeights: Record<string, number> = {
    'AAPL': 0.12,
    'MSFT': 0.11,
    'GOOGL': 0.08,
    'AMZN': 0.07,
    'NVDA': 0.06,
    'META': 0.04,
    'TSLA': 0.03,
  };
  
  return topWeights[symbol] || 0.01; // Default small weight
}
