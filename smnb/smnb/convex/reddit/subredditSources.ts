// Reddit Subreddit Source Management - Actions
// Handles Reddit API validation and source regeneration
// Uses Node.js for fetch API

"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

// Helper types
type Candidate = {
  name: string;
  type: "subreddit" | "user";
  segment: string;
  reason: string;
  baseScore: number;
};

type ValidatedSource = {
  name: string;
  type: "subreddit" | "user";
  segment: string;
  reason: string;
  relevance_score: number;
  metadata?: {
    subscribers?: number;
    active_users?: number;
    created_utc?: number;
    description?: string;
    is_nsfw?: boolean;
    is_quarantined?: boolean;
  };
  last_validated_at?: number;
  enabled?: boolean;
};

// Main action to validate and expand subreddit list
export const regenerateSubredditList = action({
  args: {},
  returns: v.object({
    validated: v.number(),
    failed: v.number(),
    total: v.number(),
    message: v.string(),
  }),
  handler: async (ctx): Promise<{ validated: number; failed: number; total: number; message: string }> => {
    console.log("🔄 Starting subreddit list regeneration...");

    // Set running state for UI persistence across tab switches
    await ctx.runMutation(internal.reddit.subredditSourcesMutations.setRegenerationRunning, { isRunning: true });

    // Get seed data and company candidates
    const candidates = [...getSeedCandidates(), ...getCompanyCandidates()];
    
    // Deduplicate
    const uniqueCandidates = deduplicateCandidates(candidates);
    console.log(`📊 Processing ${uniqueCandidates.length} unique candidates`);

    // Validate each candidate
    const validated: ValidatedSource[] = [];
    const failed: string[] = [];

    // Process sequentially to avoid rate limiting (Reddit: 60 req/min = 1 req/sec)
    console.log(`⏱️  Processing ${uniqueCandidates.length} candidates (this will take ~${Math.ceil(uniqueCandidates.length * 1.1 / 60)} minutes)...`);
    
    for (let i = 0; i < uniqueCandidates.length; i++) {
      const candidate = uniqueCandidates[i];
      
      // Stream progress to UI every 10 items
      if (i % 10 === 0 || i === uniqueCandidates.length - 1) {
        const progressMsg = `Progress: ${i + 1}/${uniqueCandidates.length} (${validated.length} valid, ${failed.length} failed)`;
        console.log(progressMsg);
        // Update progress in mutation (will be visible in UI via query)
        await ctx.runMutation(internal.reddit.subredditSourcesMutations.updateRegenerationProgress, {
          progress: progressMsg,
        });
      }
      
      const metadata = await validateRedditSource(candidate.name, candidate.type);
      
      if (metadata) {
        // Calculate relevance score with boosts
        let score = candidate.baseScore;
        if (metadata.subscribers && metadata.subscribers > 100000) score += 1;
        if (candidate.segment === "company_specific" && 
            /r\/(Apple|Microsoft|NVIDIA|AMD|teslamotors|Amazon|Google|META)/i.test(candidate.name)) {
          score += 1;
        }
        score = Math.max(1, Math.min(5, score));

        validated.push({
          name: candidate.name.replace(/^r\//, ''), // Remove r/ prefix for storage
          type: candidate.type,
          segment: candidate.segment,
          reason: candidate.reason,
          relevance_score: score,
          metadata,
          last_validated_at: Date.now(),
          enabled: true,
        });
      } else {
        failed.push(candidate.name);
      }
      
      // Delay between requests (1.1s to stay under 60/min rate limit)
      if (i < uniqueCandidates.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    }

    // Bulk upsert to database
    const result: { inserted: number; updated: number } = await ctx.runMutation(internal.reddit.subredditSourcesMutations.bulkUpsertSources, {
      sources: validated,
    });

    const message: string = `✅ Regeneration complete: ${result.inserted} new, ${result.updated} updated, ${failed.length} failed validation`;
    console.log(message);

    // Clear progress state
    await ctx.runMutation(internal.reddit.subredditSourcesMutations.clearRegenerationProgress);

    return {
      validated: validated.length,
      failed: failed.length,
      total: uniqueCandidates.length,
      message,
    };
  },
});

// Seed data functions - Expanded to generate 1000+ candidates
function getSeedCandidates(): Candidate[] {
  const seeds: Candidate[] = [
    // Core Market Forums (High Priority)
    { name: "r/StockMarket", type: "subreddit", segment: "market_forums", reason: "High-signal retail + news", baseScore: 5 },
    { name: "r/stocks", type: "subreddit", segment: "market_forums", reason: "Breadth + daily flows", baseScore: 5 },
    { name: "r/investing", type: "subreddit", segment: "market_forums", reason: "Long-form theses", baseScore: 5 },
    { name: "r/finance", type: "subreddit", segment: "market_forums", reason: "Macro, banks, policy", baseScore: 5 },
    { name: "r/TechStocks", type: "subreddit", segment: "market_forums", reason: "NDX mega-cap focus", baseScore: 5 },
    { name: "r/SecurityAnalysis", type: "subreddit", segment: "market_forums", reason: "Deep value analysis", baseScore: 4 },
    { name: "r/ValueInvesting", type: "subreddit", segment: "market_forums", reason: "Graham/Buffett approach", baseScore: 4 },
    { name: "r/dividends", type: "subreddit", segment: "market_forums", reason: "Dividend investing", baseScore: 4 },
    { name: "r/Quant", type: "subreddit", segment: "market_forums", reason: "Quantitative analysis", baseScore: 4 },
    { name: "r/FinancialPlanning", type: "subreddit", segment: "market_forums", reason: "Retail allocation trends", baseScore: 3 },
    { name: "r/Bogleheads", type: "subreddit", segment: "market_forums", reason: "Index fund flows", baseScore: 3 },
    { name: "r/Fire", type: "subreddit", segment: "market_forums", reason: "Early retirement trends", baseScore: 3 },
    { name: "r/fatFIRE", type: "subreddit", segment: "market_forums", reason: "High net worth FIRE", baseScore: 3 },
    { name: "r/leanfire", type: "subreddit", segment: "market_forums", reason: "Frugal FIRE", baseScore: 2 },
    { name: "r/personalfinance", type: "subreddit", segment: "market_forums", reason: "Retail investing behavior", baseScore: 4 },
    { name: "r/financialindependence", type: "subreddit", segment: "market_forums", reason: "FIRE movement", baseScore: 3 },
    
    // Trading Communities (High Volume)
    { name: "r/wallstreetbets", type: "subreddit", segment: "trading_communities", reason: "Retail momentum + options", baseScore: 5 },
    { name: "r/options", type: "subreddit", segment: "trading_communities", reason: "Gamma/IV chatter", baseScore: 5 },
    { name: "r/Daytrading", type: "subreddit", segment: "trading_communities", reason: "Tape-reading & catalysts", baseScore: 4 },
    { name: "r/swingtrading", type: "subreddit", segment: "trading_communities", reason: "Multi-day setups", baseScore: 4 },
    { name: "r/Forex", type: "subreddit", segment: "trading_communities", reason: "Currency correlations", baseScore: 4 },
    { name: "r/futures", type: "subreddit", segment: "trading_communities", reason: "Derivatives flow", baseScore: 4 },
    { name: "r/algorithmictrading", type: "subreddit", segment: "trading_communities", reason: "Quant + signals", baseScore: 4 },
    { name: "r/algotrading", type: "subreddit", segment: "trading_communities", reason: "Algorithmic trading alt", baseScore: 4 },
    { name: "r/thetagang", type: "subreddit", segment: "trading_communities", reason: "Premium selling", baseScore: 4 },
    { name: "r/pennystocks", type: "subreddit", segment: "trading_communities", reason: "Micro-cap speculation", baseScore: 3 },
    { name: "r/RobinHood", type: "subreddit", segment: "trading_communities", reason: "Retail platform trends", baseScore: 3 },
    { name: "r/Webull", type: "subreddit", segment: "trading_communities", reason: "Trading platform", baseScore: 2 },
    { name: "r/TDAmeritrade", type: "subreddit", segment: "trading_communities", reason: "Brokerage platform", baseScore: 2 },
    { name: "r/Fidelity", type: "subreddit", segment: "trading_communities", reason: "Brokerage platform", baseScore: 2 },
    { name: "r/Schwab", type: "subreddit", segment: "trading_communities", reason: "Brokerage platform", baseScore: 2 },
    { name: "r/interactivebrokers", type: "subreddit", segment: "trading_communities", reason: "Pro brokerage", baseScore: 2 },
    
    // Meme Stock Communities
    { name: "r/Superstonk", type: "subreddit", segment: "trading_communities", reason: "GME community", baseScore: 4 },
    { name: "r/GME", type: "subreddit", segment: "trading_communities", reason: "GameStop", baseScore: 4 },
    { name: "r/amcstock", type: "subreddit", segment: "trading_communities", reason: "AMC Entertainment", baseScore: 4 },
    { name: "r/WallStreetBetsELITE", type: "subreddit", segment: "trading_communities", reason: "WSB alternative", baseScore: 3 },
    { name: "r/WSBElite", type: "subreddit", segment: "trading_communities", reason: "WSB alt", baseScore: 3 },
    { name: "r/WallStreetbetsOG", type: "subreddit", segment: "trading_communities", reason: "WSB original", baseScore: 3 },
    { name: "r/WSBnew", type: "subreddit", segment: "trading_communities", reason: "WSB new", baseScore: 3 },
    { name: "r/smallstreetbets", type: "subreddit", segment: "trading_communities", reason: "Small account WSB", baseScore: 3 },
    { name: "r/SPACs", type: "subreddit", segment: "trading_communities", reason: "SPAC speculation", baseScore: 3 },
    { name: "r/Shortsqueeze", type: "subreddit", segment: "trading_communities", reason: "Short squeeze plays", baseScore: 3 },
    { name: "r/SqueezePlays", type: "subreddit", segment: "trading_communities", reason: "Squeeze setups", baseScore: 3 },
    
    // International Markets
    { name: "r/canadianinvestor", type: "subreddit", segment: "international", reason: "Canadian markets", baseScore: 3 },
    { name: "r/UKInvesting", type: "subreddit", segment: "international", reason: "UK markets", baseScore: 3 },
    { name: "r/AusFinance", type: "subreddit", segment: "international", reason: "Australian markets", baseScore: 3 },
    { name: "r/ASX_Bets", type: "subreddit", segment: "international", reason: "Australian WSB", baseScore: 3 },
    { name: "r/IndianStockMarket", type: "subreddit", segment: "international", reason: "Indian markets", baseScore: 3 },
    { name: "r/EuropeFIRE", type: "subreddit", segment: "international", reason: "European FIRE", baseScore: 2 },
    
    // Crypto (Market Correlation)
    { name: "r/CryptoCurrency", type: "subreddit", segment: "crypto", reason: "Crypto correlation to tech", baseScore: 4 },
    { name: "r/Bitcoin", type: "subreddit", segment: "crypto", reason: "BTC as risk indicator", baseScore: 4 },
    { name: "r/ethereum", type: "subreddit", segment: "crypto", reason: "ETH tech sentiment", baseScore: 3 },
    { name: "r/CryptoMarkets", type: "subreddit", segment: "crypto", reason: "Crypto trading flow", baseScore: 3 },
    { name: "r/ethtrader", type: "subreddit", segment: "crypto", reason: "ETH trading", baseScore: 3 },
    { name: "r/bitcoinmarkets", type: "subreddit", segment: "crypto", reason: "BTC trading", baseScore: 3 },
    
    // Macro & Economics
    { name: "r/Economics", type: "subreddit", segment: "macro", reason: "Rates, growth, policy", baseScore: 5 },
    { name: "r/economy", type: "subreddit", segment: "macro", reason: "Jobs/inflation news", baseScore: 5 },
    { name: "r/RealEstate", type: "subreddit", segment: "macro", reason: "Housing market indicator", baseScore: 4 },
    { name: "r/FirstTimeHomeBuyer", type: "subreddit", segment: "macro", reason: "Consumer sentiment", baseScore: 3 },
    { name: "r/REBubble", type: "subreddit", segment: "macro", reason: "Housing bear case", baseScore: 3 },
    { name: "r/Landlord", type: "subreddit", segment: "macro", reason: "Rental market trends", baseScore: 2 },
    
    // News & Geopolitics
    { name: "r/worldnews", type: "subreddit", segment: "news", reason: "Geopolitical catalysts", baseScore: 5 },
    { name: "r/news", type: "subreddit", segment: "news", reason: "Breaking US news", baseScore: 5 },
    { name: "r/politics", type: "subreddit", segment: "news", reason: "Policy changes", baseScore: 4 },
    { name: "r/geopolitics", type: "subreddit", segment: "news", reason: "International relations", baseScore: 4 },
    { name: "r/business", type: "subreddit", segment: "news", reason: "Business news", baseScore: 4 },
    
    // Technology & Innovation (NDX Heavy)
    { name: "r/technology", type: "subreddit", segment: "tech", reason: "Platform/AI cycles", baseScore: 5 },
    { name: "r/futurology", type: "subreddit", segment: "tech", reason: "AI/automation hype", baseScore: 4 },
    { name: "r/artificial", type: "subreddit", segment: "tech", reason: "AI momentum", baseScore: 5 },
    { name: "r/MachineLearning", type: "subreddit", segment: "tech", reason: "AI infra demand", baseScore: 4 },
    { name: "r/singularity", type: "subreddit", segment: "tech", reason: "AI acceleration", baseScore: 4 },
    { name: "r/LocalLLaMA", type: "subreddit", segment: "tech", reason: "Open-source AI", baseScore: 3 },
    { name: "r/StableDiffusion", type: "subreddit", segment: "tech", reason: "AI image generation", baseScore: 3 },
    { name: "r/OpenAI", type: "subreddit", segment: "tech", reason: "ChatGPT/GPT momentum", baseScore: 4 },
    { name: "r/ChatGPT", type: "subreddit", segment: "tech", reason: "ChatGPT usage", baseScore: 4 },
    { name: "r/ArtificialIntelligence", type: "subreddit", segment: "tech", reason: "General AI discussion", baseScore: 4 },
    
    // Semiconductors & Hardware
    { name: "r/hardware", type: "subreddit", segment: "sector", reason: "Component demand", baseScore: 4 },
    { name: "r/buildapc", type: "subreddit", segment: "sector", reason: "Consumer PC demand", baseScore: 3 },
    { name: "r/pcmasterrace", type: "subreddit", segment: "sector", reason: "Gaming hardware trends", baseScore: 3 },
    
    // Cloud & Enterprise
    { name: "r/aws", type: "subreddit", segment: "sector", reason: "AWS adoption", baseScore: 4 },
    { name: "r/Azure", type: "subreddit", segment: "sector", reason: "MSFT cloud growth", baseScore: 4 },
    { name: "r/googlecloud", type: "subreddit", segment: "sector", reason: "GCP trends", baseScore: 3 },
    { name: "r/devops", type: "subreddit", segment: "sector", reason: "Enterprise IT spending", baseScore: 3 },
    { name: "r/sysadmin", type: "subreddit", segment: "sector", reason: "IT infrastructure", baseScore: 3 },
    
    // Company Specific - FAANG+ (verified from reference list)
    { name: "r/apple", type: "subreddit", segment: "company_specific", reason: "AAPL #1 NDX weight", baseScore: 5 },
    { name: "r/microsoft", type: "subreddit", segment: "company_specific", reason: "MSFT AI/Cloud leader", baseScore: 5 },
    { name: "r/nvidia", type: "subreddit", segment: "company_specific", reason: "NVDA AI demand", baseScore: 5 },
    { name: "r/Amd", type: "subreddit", segment: "company_specific", reason: "AMD competition", baseScore: 4 },
    { name: "r/AMD_Stock", type: "subreddit", segment: "company_specific", reason: "AMD stock discussion", baseScore: 4 },
    { name: "r/intel", type: "subreddit", segment: "company_specific", reason: "INTC turnaround", baseScore: 4 },
    { name: "r/IntelStock", type: "subreddit", segment: "company_specific", reason: "Intel stock discussion", baseScore: 4 },
    { name: "r/teslamotors", type: "subreddit", segment: "company_specific", reason: "TSLA retail flows", baseScore: 5 },
    { name: "r/TeslaInvestorsClub", type: "subreddit", segment: "company_specific", reason: "TSLA bull case", baseScore: 4 },
    { name: "r/RealTesla", type: "subreddit", segment: "company_specific", reason: "TSLA bear case", baseScore: 3 },
    { name: "r/amazon", type: "subreddit", segment: "company_specific", reason: "AMZN retail/AWS", baseScore: 4 },
    { name: "r/google", type: "subreddit", segment: "company_specific", reason: "GOOGL search/AI", baseScore: 4 },
    { name: "r/Netflix", type: "subreddit", segment: "company_specific", reason: "NFLX streaming", baseScore: 3 },
    { name: "r/SpaceX", type: "subreddit", segment: "company_specific", reason: "SpaceX/Musk ventures", baseScore: 4 },
    { name: "r/PayPal", type: "subreddit", segment: "company_specific", reason: "PYPL payments", baseScore: 3 },
    { name: "r/Adobe", type: "subreddit", segment: "company_specific", reason: "ADBE creative cloud", baseScore: 3 },
    { name: "r/Qualcomm", type: "subreddit", segment: "company_specific", reason: "QCOM mobile chips", baseScore: 3 },
    { name: "r/Shopify", type: "subreddit", segment: "company_specific", reason: "SHOP e-commerce", baseScore: 3 },
    { name: "r/Starbucks", type: "subreddit", segment: "company_specific", reason: "SBUX consumer trends", baseScore: 3 },
    { name: "r/Costco", type: "subreddit", segment: "company_specific", reason: "COST retail", baseScore: 3 },
    { name: "r/Pepsi", type: "subreddit", segment: "company_specific", reason: "PEP consumer", baseScore: 2 },
    { name: "r/tmobile", type: "subreddit", segment: "company_specific", reason: "TMUS telecom", baseScore: 3 },
    { name: "r/lululemon", type: "subreddit", segment: "company_specific", reason: "LULU retail", baseScore: 3 },
    { name: "r/Palantir", type: "subreddit", segment: "company_specific", reason: "PLTR AI/data", baseScore: 4 },
    { name: "r/CrowdStrike", type: "subreddit", segment: "company_specific", reason: "CRWD cybersecurity", baseScore: 3 },
    { name: "r/MSTR", type: "subreddit", segment: "company_specific", reason: "MicroStrategy Bitcoin", baseScore: 3 },
    
    // Gaming & Entertainment (Consumer Spending)
    { name: "r/gaming", type: "subreddit", segment: "consumer", reason: "Gaming market trends", baseScore: 3 },
    { name: "r/PS5", type: "subreddit", segment: "consumer", reason: "Console demand", baseScore: 3 },
    { name: "r/XboxSeriesX", type: "subreddit", segment: "consumer", reason: "Xbox demand", baseScore: 3 },
    { name: "r/NintendoSwitch", type: "subreddit", segment: "consumer", reason: "Nintendo demand", baseScore: 3 },
    
    // Product Subs (verified names)
    { name: "r/iphone", type: "subreddit", segment: "company_related", reason: "Apple: iPhone", baseScore: 4 },
    { name: "r/ipad", type: "subreddit", segment: "company_related", reason: "Apple: iPad", baseScore: 3 },
    { name: "r/AppleWatch", type: "subreddit", segment: "company_related", reason: "Apple: Watch", baseScore: 3 },
    { name: "r/mac", type: "subreddit", segment: "company_related", reason: "Apple: Mac", baseScore: 3 },
    { name: "r/Surface", type: "subreddit", segment: "company_related", reason: "Microsoft: Surface", baseScore: 3 },
    { name: "r/xbox", type: "subreddit", segment: "company_related", reason: "Microsoft: Xbox", baseScore: 3 },
    { name: "r/android", type: "subreddit", segment: "company_related", reason: "Google: Android", baseScore: 4 },
    { name: "r/GooglePixel", type: "subreddit", segment: "company_related", reason: "Google: Pixel", baseScore: 3 },
    { name: "r/youtube", type: "subreddit", segment: "company_related", reason: "Google: YouTube", baseScore: 4 },
    { name: "r/twitch", type: "subreddit", segment: "company_related", reason: "Amazon: Twitch", baseScore: 3 },
    { name: "r/kindle", type: "subreddit", segment: "company_related", reason: "Amazon: Kindle", baseScore: 3 },
    { name: "r/oculus", type: "subreddit", segment: "company_related", reason: "Meta: Oculus", baseScore: 3 },
    
    // ETFs & Index Funds (Major market indicators)
    { name: "r/ETFs", type: "subreddit", segment: "etfs", reason: "ETF discussion", baseScore: 4 },
    { name: "r/Vitards", type: "subreddit", segment: "etfs", reason: "Steel/commodities", baseScore: 3 },
    
    // Sector-Specific Investing
    // Energy & Commodities
    { name: "r/energy", type: "subreddit", segment: "sector", reason: "Energy sector", baseScore: 4 },
    { name: "r/Oil", type: "subreddit", segment: "sector", reason: "Oil markets", baseScore: 4 },
    { name: "r/solar", type: "subreddit", segment: "sector", reason: "Solar energy", baseScore: 3 },
    { name: "r/RenewableEnergy", type: "subreddit", segment: "sector", reason: "Clean energy", baseScore: 3 },
    { name: "r/uranium", type: "subreddit", segment: "sector", reason: "Nuclear energy", baseScore: 3 },
    { name: "r/Commodities", type: "subreddit", segment: "sector", reason: "Commodity trading", baseScore: 4 },
    { name: "r/Gold", type: "subreddit", segment: "sector", reason: "Gold investing", baseScore: 4 },
    { name: "r/SilverBugs", type: "subreddit", segment: "sector", reason: "Silver investing", baseScore: 3 },
    
    // Healthcare & Biotech
    { name: "r/biotechplays", type: "subreddit", segment: "sector", reason: "Biotech trading", baseScore: 4 },
    { name: "r/biotech_investments", type: "subreddit", segment: "sector", reason: "Biotech investing", baseScore: 3 },
    { name: "r/MedicalInnovation", type: "subreddit", segment: "sector", reason: "Healthcare tech", baseScore: 3 },
    { name: "r/HealthIT", type: "subreddit", segment: "sector", reason: "Health IT", baseScore: 3 },
    
    // Financial Services
    { name: "r/FinancialCareers", type: "subreddit", segment: "sector", reason: "Finance industry", baseScore: 3 },
    { name: "r/Banking", type: "subreddit", segment: "sector", reason: "Banking sector", baseScore: 3 },
    { name: "r/FinTech", type: "subreddit", segment: "sector", reason: "Financial technology", baseScore: 4 },
    { name: "r/CreditCards", type: "subreddit", segment: "sector", reason: "Consumer credit trends", baseScore: 3 },
    { name: "r/Insurance", type: "subreddit", segment: "sector", reason: "Insurance industry", baseScore: 2 },
    
    // Manufacturing & Industrial
    { name: "r/manufacturing", type: "subreddit", segment: "sector", reason: "Manufacturing trends", baseScore: 3 },
    { name: "r/supplychain", type: "subreddit", segment: "sector", reason: "Supply chain issues", baseScore: 4 },
    { name: "r/Logistics", type: "subreddit", segment: "sector", reason: "Logistics trends", baseScore: 3 },
    
    // Retail & Consumer
    { name: "r/RetailInvestor", type: "subreddit", segment: "sector", reason: "Retail sector", baseScore: 3 },
    { name: "r/ecommerce", type: "subreddit", segment: "sector", reason: "E-commerce trends", baseScore: 4 },
    { name: "r/smallbusiness", type: "subreddit", segment: "sector", reason: "SMB trends", baseScore: 3 },
    { name: "r/Entrepreneur", type: "subreddit", segment: "sector", reason: "Startup trends", baseScore: 3 },
    { name: "r/startups", type: "subreddit", segment: "sector", reason: "Startup ecosystem", baseScore: 4 },
    
    // Aerospace & Defense
    { name: "r/aerospace", type: "subreddit", segment: "sector", reason: "Aerospace industry", baseScore: 3 },
    { name: "r/SpaceXInvestorsClub", type: "subreddit", segment: "sector", reason: "Space industry", baseScore: 3 },
    { name: "r/BlueOrigin", type: "subreddit", segment: "sector", reason: "Space sector", baseScore: 2 },
    
    // Automotive & Transportation
    { name: "r/electricvehicles", type: "subreddit", segment: "sector", reason: "EV market", baseScore: 4 },
    { name: "r/EVs", type: "subreddit", segment: "sector", reason: "EV discussion", baseScore: 4 },
    { name: "r/Rivian", type: "subreddit", segment: "sector", reason: "RIVN EV maker", baseScore: 3 },
    { name: "r/Lucid", type: "subreddit", segment: "sector", reason: "LCID EV maker", baseScore: 3 },
    { name: "r/NIO", type: "subreddit", segment: "sector", reason: "NIO Chinese EV", baseScore: 4 },
    { name: "r/cars", type: "subreddit", segment: "sector", reason: "Auto industry", baseScore: 3 },
    { name: "r/SelfDrivingCars", type: "subreddit", segment: "sector", reason: "Autonomous vehicles", baseScore: 4 },
    
    // More International Markets
    { name: "r/EuropeanInvestors", type: "subreddit", segment: "international", reason: "European markets", baseScore: 3 },
    { name: "r/UKPersonalFinance", type: "subreddit", segment: "international", reason: "UK personal finance", baseScore: 3 },
    { name: "r/GermanyFinance", type: "subreddit", segment: "international", reason: "German markets", baseScore: 2 },
    { name: "r/FranceFinance", type: "subreddit", segment: "international", reason: "French markets", baseScore: 2 },
    { name: "r/JapanFinance", type: "subreddit", segment: "international", reason: "Japanese markets", baseScore: 3 },
    { name: "r/ChinaStocks", type: "subreddit", segment: "international", reason: "Chinese markets", baseScore: 4 },
    { name: "r/IndiaInvestments", type: "subreddit", segment: "international", reason: "India markets", baseScore: 4 },
    { name: "r/BrazilianInvestors", type: "subreddit", segment: "international", reason: "Brazilian markets", baseScore: 2 },
    { name: "r/MexicoFinanciero", type: "subreddit", segment: "international", reason: "Mexican markets", baseScore: 2 },
    { name: "r/singaporefi", type: "subreddit", segment: "international", reason: "Singapore finance", baseScore: 3 },
    { name: "r/HongKong", type: "subreddit", segment: "international", reason: "Hong Kong markets", baseScore: 3 },
    
    // Options & Derivatives
    { name: "r/OptionsExclusive", type: "subreddit", segment: "derivatives", reason: "Options trading", baseScore: 3 },
    { name: "r/VegaGang", type: "subreddit", segment: "derivatives", reason: "Volatility trading", baseScore: 3 },
    { name: "r/StockOptionsTrader", type: "subreddit", segment: "derivatives", reason: "Options strategies", baseScore: 3 },
    { name: "r/Optionswheel", type: "subreddit", segment: "derivatives", reason: "Wheel strategy", baseScore: 3 },
    { name: "r/PMCCs", type: "subreddit", segment: "derivatives", reason: "Poor man's covered calls", baseScore: 2 },
    
    // Market Analysis & Data
    { name: "r/DDintoGME", type: "subreddit", segment: "analysis", reason: "Deep due diligence", baseScore: 3 },
    { name: "r/StockMarketChat", type: "subreddit", segment: "analysis", reason: "Market discussion", baseScore: 3 },
    { name: "r/MarketSentiment", type: "subreddit", segment: "analysis", reason: "Sentiment analysis", baseScore: 3 },
    { name: "r/Unusual_Whales", type: "subreddit", segment: "analysis", reason: "Unusual options flow", baseScore: 4 },
    { name: "r/RealDayTrading", type: "subreddit", segment: "analysis", reason: "Day trading education", baseScore: 4 },
    
    // Retirement & Tax Optimization
    { name: "r/Retirement", type: "subreddit", segment: "planning", reason: "Retirement planning", baseScore: 3 },
    { name: "r/tax", type: "subreddit", segment: "planning", reason: "Tax strategies", baseScore: 3 },
    { name: "r/taxadvice", type: "subreddit", segment: "planning", reason: "Tax planning", baseScore: 2 },
    { name: "r/fican", type: "subreddit", segment: "planning", reason: "Canadian FIRE", baseScore: 2 },
    { name: "r/ChubbyFIRE", type: "subreddit", segment: "planning", reason: "Mid-range FIRE", baseScore: 3 },
    
    // Additional Crypto (Market Correlation)
    { name: "r/CryptoTechnology", type: "subreddit", segment: "crypto", reason: "Blockchain tech", baseScore: 3 },
    { name: "r/defi", type: "subreddit", segment: "crypto", reason: "DeFi trends", baseScore: 3 },
    { name: "r/NFT", type: "subreddit", segment: "crypto", reason: "NFT markets", baseScore: 3 },
    { name: "r/web3", type: "subreddit", segment: "crypto", reason: "Web3 adoption", baseScore: 3 },
    
    // More Tech & Software
    { name: "r/programming", type: "subreddit", segment: "tech", reason: "Developer trends", baseScore: 3 },
    { name: "r/webdev", type: "subreddit", segment: "tech", reason: "Web development", baseScore: 3 },
    { name: "r/SaaS", type: "subreddit", segment: "tech", reason: "SaaS businesses", baseScore: 4 },
    { name: "r/CloudComputing", type: "subreddit", segment: "tech", reason: "Cloud trends", baseScore: 3 },
    { name: "r/datascience", type: "subreddit", segment: "tech", reason: "Data science demand", baseScore: 3 },
    { name: "r/deeplearning", type: "subreddit", segment: "tech", reason: "AI/ML trends", baseScore: 4 },
    { name: "r/LLM", type: "subreddit", segment: "tech", reason: "Large language models", baseScore: 4 },
    { name: "r/Anthropic", type: "subreddit", segment: "tech", reason: "Claude AI", baseScore: 3 },
    { name: "r/midjourney", type: "subreddit", segment: "tech", reason: "AI image generation", baseScore: 3 },
    { name: "r/Cybersecurity", type: "subreddit", segment: "tech", reason: "Cybersecurity trends", baseScore: 4 },
    { name: "r/netsec", type: "subreddit", segment: "tech", reason: "Network security", baseScore: 3 },
    { name: "r/DataEngineering", type: "subreddit", segment: "tech", reason: "Data infrastructure", baseScore: 3 },
    { name: "r/kubernetes", type: "subreddit", segment: "tech", reason: "K8s adoption", baseScore: 3 },
    { name: "r/docker", type: "subreddit", segment: "tech", reason: "Container trends", baseScore: 3 },
    { name: "r/reactjs", type: "subreddit", segment: "tech", reason: "React framework", baseScore: 3 },
    { name: "r/nextjs", type: "subreddit", segment: "tech", reason: "Next.js framework", baseScore: 3 },
    { name: "r/golang", type: "subreddit", segment: "tech", reason: "Go language", baseScore: 3 },
    { name: "r/rust", type: "subreddit", segment: "tech", reason: "Rust language", baseScore: 3 },
    { name: "r/Python", type: "subreddit", segment: "tech", reason: "Python development", baseScore: 3 },
  ];
  
  return seeds;
}

function getCompanyCandidates(): Candidate[] {
  // Expanded NDX-100 companies with likely existing subreddits
  const ndxCompanies: Array<[string, string, string[], number]> = [
    // Top 10 by weight
    ["AAPL", "Apple", ["iPhone", "iPad", "AppleWatch"], 5],
    ["MSFT", "Microsoft", ["Xbox", "Surface"], 5],
    ["NVDA", "NVIDIA", [], 5],
    ["AMZN", "Amazon", ["Kindle", "alexa"], 5],
    ["META", "Meta", ["Oculus", "instagram"], 5],
    ["GOOGL", "Google", ["Android", "Pixel"], 5],
    ["TSLA", "Tesla", [], 5],
    ["AVGO", "Broadcom", [], 4],
    ["COST", "Costco", [], 4],
    ["NFLX", "Netflix", [], 4],
    
    // Top 20 by weight
    ["AMD", "AMD", ["Ryzen"], 5],
    ["CSCO", "Cisco", [], 4],
    ["ADBE", "Adobe", ["Photoshop"], 4],
    ["PEP", "Pepsi", [], 3],
    ["TMUS", "TMobile", [], 4],
    ["INTC", "Intel", [], 4],
    ["CMCSA", "Comcast", [], 3],
    ["QCOM", "Qualcomm", [], 4],
    ["TXN", "TexasInstruments", [], 3],
    ["INTU", "Intuit", [], 4],
    
    // Other major NDX tech
    ["AMAT", "AppliedMaterials", [], 3],
    ["ASML", "ASML", [], 4],
    ["LRCX", "LamResearch", [], 3],
    ["KLAC", "KLA", [], 3],
    ["SNPS", "Synopsys", [], 3],
    ["CDNS", "Cadence", [], 3],
    ["MRVL", "Marvell", [], 3],
    ["NXPI", "NXP", [], 3],
    ["MU", "Micron", [], 4],
    ["MCHP", "Microchip", [], 2],
    
    // Software/Cloud
    ["CRM", "Salesforce", [], 4],
    ["NOW", "ServiceNow", [], 4],
    ["ORCL", "Oracle", [], 4],
    ["ADSK", "Autodesk", [], 3],
    ["PANW", "PaloAlto", [], 4],
    ["CRWD", "CrowdStrike", [], 4],
    ["SNOW", "Snowflake", [], 4],
    ["DDOG", "Datadog", [], 3],
    ["TEAM", "Atlassian", [], 3],
    ["WDAY", "Workday", [], 3],
    ["FTNT", "Fortinet", [], 3],
    ["ZS", "Zscaler", [], 3],
    
    // E-commerce/Payments
    ["PYPL", "PayPal", [], 4],
    ["SHOP", "Shopify", [], 4],
    ["MELI", "MercadoLibre", [], 3],
    ["BKNG", "Booking", [], 3],
    ["ABNB", "Airbnb", [], 4],
    ["DASH", "DoorDash", [], 4],
    ["UBER", "Uber", [], 4],
    ["LYFT", "Lyft", [], 3],
    
    // Biotech/Healthcare
    ["AMGN", "Amgen", [], 3],
    ["GILD", "Gilead", [], 3],
    ["REGN", "Regeneron", [], 3],
    ["VRTX", "Vertex", [], 3],
    ["BIIB", "Biogen", [], 3],
    ["ILMN", "Illumina", [], 3],
    
    // Consumer/Retail
    ["SBUX", "Starbucks", [], 4],
    ["LULU", "Lululemon", [], 4],
    ["MNST", "Monster", [], 3],
    ["MAR", "Marriott", [], 3],
    
    // Other notable NDX
    ["PLTR", "Palantir", [], 5],
    ["ARM", "ARM", [], 4],
    ["MSTR", "MicroStrategy", [], 4],
    ["COIN", "Coinbase", [], 4],
    ["RBLX", "Roblox", [], 3],
    ["ROKU", "Roku", [], 3],
    ["ZM", "Zoom", [], 3],
    ["DOCU", "DocuSign", [], 3],
    ["OKTA", "Okta", [], 3],
  ];

  const candidates: Candidate[] = [];
  
  for (const [ticker, company, products, baseScore] of ndxCompanies) {
    const cleanName = company.replace(/[^A-Za-z0-9]/g, "");
    
    // Only add the most likely variations (company name and ticker)
    candidates.push(
      { name: `r/${cleanName}`, type: "subreddit", segment: "company_specific", reason: `${ticker} company`, baseScore },
      { name: `r/${ticker}`, type: "subreddit", segment: "company_specific", reason: `${ticker} ticker`, baseScore: baseScore - 1 }
    );
    
    // Only add major product subs
    for (const product of products) {
      candidates.push({
        name: `r/${product}`,
        type: "subreddit",
        segment: "company_related",
        reason: `${company}: ${product}`,
        baseScore: baseScore - 1
      });
    }
  }
  
  // Only include confirmed active broad market subs
  const confirmedSubs = [
    "r/Superstonk", "r/GME", "r/amcstock",
    "r/SPACs", "r/smallstreetbets", "r/WallStreetBetsELITE",
    "r/pennystocks", "r/RobinHood", 
    "r/canadianinvestor", "r/UKInvesting", "r/AusFinance",
    "r/Forex", "r/swingtrading", "r/fatFIRE"
  ];
  
  for (const sub of confirmedSubs) {
    candidates.push({
      name: sub,
      type: "subreddit",
      segment: "trading_communities",
      reason: "Active trading community",
      baseScore: 4
    });
  }
  
  return candidates;
}

function deduplicateCandidates(candidates: Candidate[]): Candidate[] {
  const seen = new Map<string, Candidate>();
  for (const c of candidates) {
    const key = `${c.type}:${c.name.toLowerCase()}`;
    if (!seen.has(key) || (seen.get(key)!.baseScore < c.baseScore)) {
      seen.set(key, c);
    }
  }
  return Array.from(seen.values());
}

// Reddit API OAuth credentials and token management
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getRedditAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit OAuth credentials not configured. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const userAgent = process.env.REDDIT_USER_AGENT || 'SMNB-MNQ1-Scanner/1.0 (by /u/ACDCDigital)';

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`OAuth token request failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    accessToken = tokenData.access_token;
    // Set expiry with 5-minute buffer
    tokenExpiry = Date.now() + ((tokenData.expires_in - 300) * 1000);
    
    console.log('✅ Reddit OAuth token obtained, expires in', tokenData.expires_in, 'seconds');
    return accessToken!;
  } catch (error) {
    console.error('❌ Failed to get Reddit OAuth token:', error);
    throw error;
  }
}

async function validateRedditSource(name: string, type: "subreddit" | "user") {
  // Clean the name - remove r/ or u/ prefix if present
  const cleanName = name.replace(/^[ru]\//, '');
  
  // Get OAuth token
  const token = await getRedditAccessToken();
  const userAgent = process.env.REDDIT_USER_AGENT || 'SMNB-MNQ1-Scanner/1.0 (by /u/ACDCDigital)';
  
  // Use OAuth endpoint
  const url = type === "subreddit"
    ? `https://oauth.reddit.com/r/${cleanName}/about`
    : `https://oauth.reddit.com/user/${cleanName}/about`;
  
  try {
    const res = await fetch(url, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "User-Agent": userAgent 
      }
    });
    
    if (!res.ok) {
      console.log(`❌ ${name}: HTTP ${res.status}`);
      return null;
    }
    
    const json = await res.json();
    const data = json?.data;
    if (!data) {
      console.log(`❌ ${name}: No data in response`, json);
      return null;
    }
    
    // Just check if it exists - don't filter by NSFW or subscribers
    // We want all real subreddits for market monitoring
    const subscribers = data.subscribers ?? data.total_karma ?? 0;
    
    console.log(`✅ ${name}: ${subscribers.toLocaleString()} subscribers`);
    
    return {
      subscribers,
      active_users: data.active_user_count ?? 0,
      created_utc: data.created_utc ?? 0,
      description: data.public_description ?? "",
      is_nsfw: data.over18 ?? false,
      is_quarantined: data.quarantine ?? false,
    };
  } catch {
    return null;
  }
}
