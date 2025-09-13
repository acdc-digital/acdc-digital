// STATS SCHEDULED FUNCTIONS
// /Users/matthewsimon/Projects/SMNB/smnb/convex/stats/scheduled.ts

import { cronJobs } from "convex/server";
import { internal } from "../_generated/api";

const crons = cronJobs();

// Run hourly aggregation every hour at minute 5
crons.interval(
  "hourly-stats-aggregation",
  { minutes: 60 }, // Every 60 minutes (1 hour)
  internal.stats.aggregation.aggregateHourlyStats
);

// Run daily aggregation every day at 1:15 AM UTC  
crons.cron(
  "daily-stats-aggregation",
  "15 1 * * *", // Cron expression: 1:15 AM UTC daily
  internal.stats.aggregation.aggregateDailyStats
);

// Run cleanup every Sunday at 2:00 AM UTC
crons.cron(
  "stats-cleanup", 
  "0 2 * * 0", // Cron expression: 2:00 AM UTC every Sunday
  internal.stats.aggregation.cleanupOldStats
);

export default crons;