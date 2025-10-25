import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";

const crons = cronJobs();

// DISABLED - Using Engine metrics instead
// Run INCREMENTAL sentiment score updates every 30 minutes
// Only processes new posts since last update (running total model)
// crons.interval(
//   "update-sentiment-scores",
//   { minutes: 30 }, // Run every 30 minutes (6:00, 6:30, 7:00, 7:30, etc.)
//   internal.stats.sentimentActions.updateAllSentimentScores
// );

// DISABLED - Using Engine metrics instead
// Generate sentiment index every hour
// crons.hourly(
//   "generate-sentiment-index",
//   { minuteUTC: 0 }, // Run at the top of every hour (6:00, 7:00, 8:00, etc.)
//   internal.stats.sentimentIndex.generateHourlySentimentIndex
// );

// DISABLED - Using Engine metrics instead
// Fetch latest hourly ticker data every hour
// crons.hourly(
//   "fetch-hourly-ticker-data",
//   { minuteUTC: 0 }, // Run at the top of every hour (XX:00)
//   api.stats.populateLast24Hours.populateLast24Hours,
//   { ticker: "MNQ=F" }
// );

// Sync federal reports daily at 6:00 AM UTC (1:00 AM EST / 10:00 PM PST)
crons.daily(
  "sync federal reports daily",
  { hourUTC: 6, minuteUTC: 0 },
  internal.federalReports.scheduledSync
);

// Sync earnings data daily at 6:30 AM UTC (1:30 AM EST / 10:30 PM PST)
crons.daily(
  "sync earnings data daily",
  { hourUTC: 6, minuteUTC: 30 },
  internal.earnings.syncEarningsData
);

// Sync economic data daily at 7:00 AM UTC (2:00 AM EST / 11:00 PM PST)
crons.daily(
  "sync economic data daily",
  { hourUTC: 7, minuteUTC: 0 },
  internal.economicData.syncAllEconomicData
);

export default crons;
