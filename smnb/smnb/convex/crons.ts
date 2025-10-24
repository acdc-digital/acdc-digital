import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";

const crons = cronJobs();

// Run INCREMENTAL sentiment score updates every 30 minutes
// Only processes new posts since last update (running total model)
crons.interval(
  "update-sentiment-scores",
  { minutes: 30 }, // Run every 30 minutes (6:00, 6:30, 7:00, 7:30, etc.)
  internal.stats.sentimentActions.updateAllSentimentScores
);

// Generate sentiment index every hour
crons.hourly(
  "generate-sentiment-index",
  { minuteUTC: 0 }, // Run at the top of every hour (6:00, 7:00, 8:00, etc.)
  internal.stats.sentimentIndex.generateHourlySentimentIndex
);

// Fetch latest hourly ticker data every hour
crons.hourly(
  "fetch-hourly-ticker-data",
  { minuteUTC: 0 }, // Run at the top of every hour (XX:00)
  api.stats.populateLast24Hours.populateLast24Hours,
  { ticker: "MNQ=F" }
);

export default crons;
