// CLEANUP DUPLICATE EARNINGS EVENTS
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/convex/cleanupDuplicateEarnings.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Check for duplicate earnings events
export const checkDuplicates = query({
  args: {},
  returns: v.object({
    totalEarnings: v.number(),
    duplicateGroups: v.number(),
    details: v.array(v.object({
      title: v.string(),
      startTime: v.number(),
      count: v.number(),
      ids: v.array(v.string()),
    })),
  }),
  handler: async (ctx) => {
    const allEarnings = await ctx.db
      .query("calendar_events")
      .filter((q) => q.eq(q.field("eventType"), "earnings"))
      .collect();
    
    const eventMap = new Map<string, typeof allEarnings>();
    
    for (const event of allEarnings) {
      const key = `${event.title}_${event.startTime}`;
      const existing = eventMap.get(key);
      
      if (!existing) {
        eventMap.set(key, [event]);
      } else {
        existing.push(event);
      }
    }
    
    const duplicateGroups: Array<{
      title: string;
      startTime: number;
      count: number;
      ids: string[];
    }> = [];
    
    let duplicateGroupCount = 0;
    
    for (const [, events] of eventMap.entries()) {
      if (events.length > 1) {
        duplicateGroupCount++;
        duplicateGroups.push({
          title: events[0].title,
          startTime: events[0].startTime,
          count: events.length,
          ids: events.map(e => e._id),
        });
      }
    }
    
    return {
      totalEarnings: allEarnings.length,
      duplicateGroups: duplicateGroupCount,
      details: duplicateGroups,
    };
  },
});

// Remove duplicate earnings events, keeping only the oldest one for each title+date combo
export const removeDuplicateEarnings = mutation({
  args: {},
  returns: v.object({
    totalFound: v.number(),
    duplicatesRemoved: v.number(),
    keptEvents: v.number(),
  }),
  handler: async (ctx) => {
    console.log("🧹 Starting duplicate earnings cleanup...");
    
    // Get all earnings events
    const allEarnings = await ctx.db
      .query("calendar_events")
      .filter((q) => q.eq(q.field("eventType"), "earnings"))
      .collect();
    
    console.log(`📊 Found ${allEarnings.length} total earnings events`);
    
    // Group by title + startTime
    const eventMap = new Map<string, typeof allEarnings>();
    
    for (const event of allEarnings) {
      const key = `${event.title}_${event.startTime}`;
      const existing = eventMap.get(key);
      
      if (!existing) {
        eventMap.set(key, [event]);
      } else {
        existing.push(event);
      }
    }
    
    // Find and remove duplicates
    let duplicatesRemoved = 0;
    let keptEvents = 0;
    
    for (const [, events] of eventMap.entries()) {
      if (events.length > 1) {
        // Sort by _creationTime to keep the oldest
        events.sort((a, b) => a._creationTime - b._creationTime);
        
        const toKeep = events[0];
        const toDelete = events.slice(1);
        
        console.log(`🔍 Found ${events.length} duplicates for: ${events[0].title}`);
        console.log(`   Keeping: ${toKeep._id} (created: ${new Date(toKeep._creationTime).toISOString()})`);
        
        // Delete duplicates
        for (const event of toDelete) {
          await ctx.db.delete(event._id);
          duplicatesRemoved++;
          console.log(`   ❌ Deleted: ${event._id} (created: ${new Date(event._creationTime).toISOString()})`);
        }
        
        keptEvents++;
      } else {
        keptEvents++;
      }
    }
    
    console.log(`✅ Cleanup complete!`);
    console.log(`   Total earnings found: ${allEarnings.length}`);
    console.log(`   Unique events kept: ${keptEvents}`);
    console.log(`   Duplicates removed: ${duplicatesRemoved}`);
    
    return {
      totalFound: allEarnings.length,
      duplicatesRemoved,
      keptEvents,
    };
  },
});
