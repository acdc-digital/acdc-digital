import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isSameDay, differenceInCalendarDays } from 'date-fns';
import { getAuthUserId } from "@convex-dev/auth/server";

// Function to fix subscription ownership
export const fixSubscriptionOwnership = mutation({
  args: {
    subscriptionId: v.id("userSubscriptions"),
    correctUserId: v.id("users")
  },
  handler: async (ctx, args) => {
    console.log(`Moving subscription ${args.subscriptionId} to user ${args.correctUserId}`);
    
    await ctx.db.patch(args.subscriptionId, {
      userId: args.correctUserId,
      updatedAt: Date.now()
    });
    
    return { success: true };
  }
});

// Debug function to check user subscription state
export const debugUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    // Get current user ID
    const userId = await getAuthUserId(ctx);
    console.log("Current user ID from getAuthUserId:", userId);
    
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    console.log("All users:");
    allUsers.forEach(user => {
      console.log(`- User ID: ${user._id}, Auth ID: ${user.authId}, Email: ${user.email}`);
    });
    
    // Get all subscriptions
    const allSubscriptions = await ctx.db.query("userSubscriptions").collect();
    console.log("All subscriptions:");
    allSubscriptions.forEach(sub => {
      console.log(`- Sub ID: ${sub._id}, User ID: ${sub.userId}, Subscription ID: ${sub.subscriptionId}, Status: ${sub.status}`);
    });
    
    if (userId) {
      // Check if current user has a subscription
      const userSubscription = await ctx.db
        .query("userSubscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      console.log("Current user subscription:", userSubscription);
      
      // Also try to find user record
      const userRecord = await ctx.db.get(userId);
      console.log("Current user record:", userRecord);
    }
    
    return {
      currentUserId: userId,
      users: allUsers.length,
      subscriptions: allSubscriptions.length
    };
  }
});

// Simulate calling hasActiveSubscription with specific user context
export const debugHasActiveSubscription = query({
  args: { testUserId: v.optional(v.string()) },
  handler: async (ctx, { testUserId }) => {
    console.log("=== DEBUG hasActiveSubscription ===");
    
    // Get current user ID from auth
    const authUserId = await getAuthUserId(ctx);
    console.log("Auth user ID from getAuthUserId:", authUserId);
    
    // If testUserId provided, use that instead
    const userId = testUserId ? (testUserId as any) : authUserId;
    console.log("Using user ID for subscription check:", userId);
    
    if (!userId) {
      console.log("No user ID available, returning false");
      return { hasSubscription: false, reason: "No user ID" };
    }

    // First, let's find subscriptions using the user ID
    let subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    console.log("Subscription found by user ID:", subscription);

    // Check user record for debugging
    const user = await ctx.db.get(userId);
    console.log("User record:", user);
      
    if (!subscription) {
      console.log("No subscription found anywhere");
      return { hasSubscription: false, reason: "No subscription found" };
    }

    // Check if subscription is active
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    const currentTime = Date.now();
    const isNotExpired = !subscription.currentPeriodEnd || subscription.currentPeriodEnd > currentTime;
    
    console.log("Subscription status:", subscription.status);
    console.log("Is active:", isActive);
    console.log("Current time:", currentTime);
    console.log("Period end:", subscription.currentPeriodEnd);
    console.log("Is not expired:", isNotExpired);
    
    const hasActiveSubscription = isActive && isNotExpired;
    console.log("Final result:", hasActiveSubscription);
    
    return {
      hasSubscription: hasActiveSubscription,
      subscription,
      checks: { isActive, isNotExpired }
    };
  }
});

// Helper function to get ISO date string (YYYY-MM-DD) for a given Date - Copied from forecast.ts
const getISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Helper function to add days to a date - Copied from forecast.ts
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper function to get display day name (Today, Tomorrow, Yesterday, or full day name) - Copied from forecast.ts
function getDisplayDay(date: Date, today: Date) {
  // Compare only the date part (local time)
  if (isSameDay(date, today)) return "Today";
  if (differenceInCalendarDays(date, today) === 1) return "Tomorrow";
  if (differenceInCalendarDays(date, today) === -1) return "Yesterday";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

// Helper function to get short day name (Sun, Mon, etc.) - Copied from forecast.ts
function getShortDay(date: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

// Helper function to format date as Month Day (e.g., "May 4") - Copied from forecast.ts
function formatMonthDay(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * getTestSevenDayForecast: returns a clean 7-day array mixing real historical logs
 * (with null for missing days) and forecasts for the next three days.
 */
export const getTestSevenDayForecast = query({
  args: { userId: v.string(), startDate: v.string(), endDate: v.string() },
  handler: async ({ db }, { userId, startDate, endDate }) => {
    // Parse ISO date strings and ensure consistent format (YYYY-MM-DD)
    startDate = startDate.slice(0, 10); // Normalize to YYYY-MM-DD
    endDate = endDate.slice(0, 10);     // Normalize to YYYY-MM-DD
    
    // Create date objects with time set to midnight
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    
    console.log("getTestSevenDayForecast params:", { 
      userId, 
      startDate, 
      endDate,
      startDateObj: start.toISOString(),
      endDateObj: end.toISOString() 
    });
    
    console.log("Date objects:", { 
      start: start.toLocaleDateString(), 
      end: end.toLocaleDateString(),
      startDay: start.toLocaleDateString('en-US', { weekday: 'long' }),
      endDay: end.toLocaleDateString('en-US', { weekday: 'long' })
    });

    // Fetch all logs in the selected range - use the normalized dates
    const logs = await db.query("logs")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.gte(q.field("date"), startDate))
      .filter(q => q.lte(q.field("date"), endDate))
      .collect();
    
    console.log(`Found ${logs.length} logs in selected range`);

    // Map dates to scores (null if score missing)
    // Also map dates to answers for consulting functionality
    // Normalize log dates to YYYY-MM-DD for reliable matching
    const logMap = new Map<string, number | null>(
      logs.map(l => [l.date.slice(0, 10), l.score ?? null])
    );

    const answersMap = new Map<string, any>(
      logs.map(l => [l.date.slice(0, 10), l.answers])
    );

    // Fetch historical forecasts for the 4-day past period (startDate to endDate)
    // These are forecasts that *were* made for these dates when they were future.
    const historicalForecastRecords = await db.query("forecast")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.gte(q.field("date"), startDate))
      .filter(q => q.lte(q.field("date"), endDate))
      .collect();

    const historicalForecastMap = new Map<string, number | null>(
      historicalForecastRecords.map(f => [f.date.slice(0, 10), f.emotionScore ?? null])
    );
    console.log(`Found ${historicalForecastRecords.length} historical forecast records for the past 4 days.`);

    const sevenDayData: any[] = []; // Renamed 'result' to 'sevenDayData' for clarity
    
    // BUILD EXACTLY 4 DAYS OF PAST DATA (from startDate to endDate, inclusive)
    console.log("Building past days from", start.toLocaleDateString(), "to", end.toLocaleDateString());
    
    const referenceToday = end; // For getDisplayDay
    // Non-mutating approach for date iteration - create fresh date objects each time
    for (let i = 0; i <= Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      // Format as YYYY-MM-DD for consistency
      const iso = d.toISOString().slice(0, 10);
      
      // Use normalized ISO string for logMap lookup
      const score = logMap.get(iso) ?? null;
      const answers = answersMap.get(iso) ?? null;
      console.log(`Adding past day ${i+1}: ${iso} - ${d.toLocaleDateString()} (${d.toLocaleDateString('en-US', { weekday: 'long' })}) - Score: ${score}`);
      
      sevenDayData.push({
        date: iso,
        day: getDisplayDay(d, referenceToday),
        shortDay: getShortDay(d),
        formattedDate: formatMonthDay(d),
        emotionScore: score,
        isToday: isSameDay(d, referenceToday),
        isPast: d < referenceToday && !isSameDay(d, referenceToday),
        isFuture: false,
        answers: answers,
      });
    }

    // BUILD EXACTLY 3 DAYS OF FORECAST DATA (after endDate)
    console.log("Building forecast days after", end.toLocaleDateString());
    
    for (let i = 1; i <= 3; i++) {
      // Create fresh date object based on the end date
      const d = new Date(end);
      d.setDate(end.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      
      console.log(`Adding forecast day ${i}: ${iso} - ${d.toLocaleDateString()} (${d.toLocaleDateString('en-US', { weekday: 'long' })})`);
      
      // Fetch from forecast table
      const forecast = await db.query("forecast")
        .filter(q => q.eq(q.field("userId"), userId))
        .filter(q => q.eq(q.field("date"), iso))
        .first();
      
      if (forecast) {
        sevenDayData.push({
          date: iso,
          day: getDisplayDay(d, referenceToday),
          shortDay: getShortDay(d),
          formattedDate: formatMonthDay(d),
          emotionScore: forecast.emotionScore,
          isToday: false,
          isPast: false,
          isFuture: true,
          description: forecast.description ?? null,
          trend: forecast.trend ?? null,
          details: forecast.details ?? null,
          recommendation: forecast.recommendation ?? null,
          confidence: forecast.confidence ?? null,
        });
      } else {
        sevenDayData.push({
          date: iso,
          day: getDisplayDay(d, referenceToday),
          shortDay: getShortDay(d),
          formattedDate: formatMonthDay(d),
          emotionScore: null,
          isToday: false,
          isPast: false,
          isFuture: true,
          description: "Forecast Needed",
          trend: null,
          details: null,
          recommendation: null,
          confidence: null,
        });
      }
    }

    // Prepare the historicalForecasts array for the chart
    const historicalForecasts: { date: string; emotionScore: number | null }[] = [];
    for (let i = 0; i <= Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      historicalForecasts.push({
        date: iso,
        emotionScore: historicalForecastMap.get(iso) ?? null,
      });
    }
    console.log("Prepared historicalForecasts for chart:", historicalForecasts);

    // Final verification of dates
    if (sevenDayData.length > 0) {
      console.log("Result verification:", {
        firstDay: sevenDayData[0].date,
        firstDayParsed: new Date(sevenDayData[0].date).toLocaleDateString(),
        expectedFirstDay: start.toLocaleDateString(),
        daysTotal: sevenDayData.length
      });
    }
    
    console.log(`Returning ${sevenDayData.length} days for sevenDayData`);
    return { sevenDayData, historicalForecasts };
  }
}); 