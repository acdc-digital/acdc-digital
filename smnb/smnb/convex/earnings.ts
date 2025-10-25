// EARNINGS DATA SYNC FROM ALPHA VANTAGE API
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/earnings.ts

"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Default tickers to fetch earnings for
const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'TSLA'];

interface EarningsEvent {
  company: string;
  ticker: string;
  earningsDate: string;
  earningsReleaseTime: string | null;
  fiscalPeriod: string | null;
  epsEstimate: number | null;
  source: string;
}

// Internal action to sync earnings data
export const syncEarningsData = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("📈 Syncing earnings data...");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/earnings/alpha?tickers=${DEFAULT_TICKERS.join(',')}`);
      const data = await response.json() as { success: boolean; earnings: EarningsEvent[] };
      
      if (!data.success || data.earnings.length === 0) {
        console.log("⚠️ No earnings data received");
        return { success: false, count: 0 };
      }
      
      console.log(`📊 Found ${data.earnings.length} earnings events`);
      
      let successCount = 0;
      
      // Create calendar events for each earnings report
      for (const earning of data.earnings) {
        try {
          const earningsDate = new Date(earning.earningsDate);
          earningsDate.setHours(0, 0, 0, 0);
          
          const title = `${earning.ticker} Earnings`;
          const description = [
            `Company: ${earning.company}`,
            earning.epsEstimate ? `EPS Estimate: $${earning.epsEstimate.toFixed(2)}` : '',
            earning.fiscalPeriod ? `Fiscal Period: ${earning.fiscalPeriod}` : '',
            earning.earningsReleaseTime ? `Release: ${earning.earningsReleaseTime}` : '',
            `Source: ${earning.source}`,
          ].filter(Boolean).join('\n');
          
          // Create calendar event using internal mutation
          await ctx.runMutation(internal.calendar.createEarningsEvent, {
            title,
            description,
            startTime: earningsDate.getTime(),
            endTime: earningsDate.getTime() + (24 * 60 * 60 * 1000) - 1, // End of day
            ticker: earning.ticker,
            source: earning.source,
          });
          
          successCount++;
        } catch (error) {
          console.error(`Failed to create earnings event for ${earning.ticker}:`, error);
        }
      }
      
      console.log(`✅ Successfully synced ${successCount} earnings events`);
      
      return {
        success: successCount > 0,
        count: successCount,
      };
    } catch (error) {
      console.error("❌ Failed to sync earnings data:", error);
      return {
        success: false,
        count: 0,
      };
    }
  },
});
