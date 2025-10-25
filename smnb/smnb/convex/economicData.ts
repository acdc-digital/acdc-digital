// ECONOMIC DATA SYNC (CPI, GDP, etc.) FROM BLS AND ALPHA VANTAGE
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/economicData.ts

"use node";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Major economic indicators to track
const ECONOMIC_INDICATORS = [
  { 
    series: "CUSR0000SA0", 
    name: "CPI (Consumer Price Index)",
    color: "#f59e0b", // Amber
  },
  { 
    series: "CUUR0000SA0", 
    name: "CPI-U (All Urban Consumers)",
    color: "#f59e0b",
  },
  {
    series: "LNS14000000",
    name: "Unemployment Rate",
    color: "#ef4444", // Red
  },
];

interface BLSDataPoint {
  year: string;
  period: string;
  periodName: string;
  value: string;
  footnotes?: Array<{ code: string; text: string }>;
}

interface BLSResponse {
  status: string;
  responseTime: number;
  message?: string[];
  Results: {
    series: Array<{
      seriesID: string;
      data: BLSDataPoint[];
    }>;
  };
}

// Sync economic data from BLS
export const syncBLSData = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("📊 Syncing BLS economic data...");
    
    const blsApiKey = process.env.BLS_API_KEY;
    if (!blsApiKey) {
      console.error("❌ BLS_API_KEY not found");
      return { success: false, count: 0 };
    }
    
    try {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 1; // Get last year's data too
      
      const seriesIds = ECONOMIC_INDICATORS.map(ind => ind.series);
      
      const response = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriesid: seriesIds,
          startyear: startYear.toString(),
          endyear: currentYear.toString(),
          registrationkey: blsApiKey,
        }),
      });
      
      const data = await response.json() as BLSResponse;
      
      if (data.status !== "REQUEST_SUCCEEDED") {
        console.error("❌ BLS API request failed:", data.message);
        return { success: false, count: 0 };
      }
      
      let successCount = 0;
      
      for (const series of data.Results.series) {
        const indicator = ECONOMIC_INDICATORS.find(ind => ind.series === series.seriesID);
        if (!indicator) continue;
        
        // Process recent data points (last 12 months)
        const recentData = series.data.slice(0, 12);
        
        for (const dataPoint of recentData) {
          try {
            // Parse period (M01-M12 for monthly data)
            const month = parseInt(dataPoint.period.replace("M", "")) - 1; // 0-indexed
            const year = parseInt(dataPoint.year);
            
            // Release date is typically 2 weeks after month end (approximate)
            const releaseDate = new Date(year, month + 1, 15);
            releaseDate.setHours(8, 30, 0, 0); // 8:30 AM ET typical release time
            
            const title = `${indicator.name} Release`;
            const description = `${dataPoint.periodName} ${year}: ${dataPoint.value}`;
            
            await ctx.runMutation(internal.calendar.createEconomicDataEvent, {
              title,
              description,
              startTime: releaseDate.getTime(),
              endTime: releaseDate.getTime() + (60 * 60 * 1000), // 1 hour window
              color: indicator.color,
              source: "BLS",
              seriesId: series.seriesID,
            });
            
            successCount++;
          } catch (error) {
            console.error(`Failed to create event for ${indicator.name}:`, error);
          }
        }
      }
      
      console.log(`✅ Successfully synced ${successCount} BLS economic events`);
      
      return {
        success: successCount > 0,
        count: successCount,
      };
    } catch (error) {
      console.error("❌ Failed to sync BLS data:", error);
      return {
        success: false,
        count: 0,
      };
    }
  },
});

// Sync economic calendar from Alpha Vantage
export const syncAlphaVantageEconomicCalendar = internalAction({
  args: {},
  handler: async () => {
    console.log("📅 Syncing Alpha Vantage economic calendar...");
    
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.error("❌ ALPHA_VANTAGE_API_KEY not found");
      return { success: false, count: 0 };
    }
    
    try {
      // Alpha Vantage doesn't have a dedicated economic calendar endpoint
      // Instead, we can use their NEWS_SENTIMENT endpoint to find economic data releases
      console.log("⚠️ Alpha Vantage economic calendar not available - using BLS data only");
      
      return {
        success: true,
        count: 0,
      };
    } catch (error) {
      console.error("❌ Failed to sync Alpha Vantage economic calendar:", error);
      return {
        success: false,
        count: 0,
      };
    }
  },
});

// Combined sync action
export const syncAllEconomicData = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("🌍 Starting economic data sync...");
    
    const results = {
      bls: 0,
      alphaVantage: 0,
    };
    
    // Sync BLS data
    try {
      const blsResult = await ctx.runAction(internal.economicData.syncBLSData, {});
      results.bls = blsResult.count;
    } catch (error) {
      console.error("Failed to sync BLS:", error);
    }
    
    // Sync Alpha Vantage economic calendar
    try {
      const avResult = await ctx.runAction(internal.economicData.syncAlphaVantageEconomicCalendar, {});
      results.alphaVantage = avResult.count;
    } catch (error) {
      console.error("Failed to sync Alpha Vantage:", error);
    }
    
    const totalCount = results.bls + results.alphaVantage;
    
    console.log(`✅ Economic data sync complete: ${totalCount} total events`);
    console.log(`   BLS: ${results.bls}, Alpha Vantage: ${results.alphaVantage}`);
    
    return {
      success: totalCount > 0,
      results,
      totalCount,
    };
  },
});
