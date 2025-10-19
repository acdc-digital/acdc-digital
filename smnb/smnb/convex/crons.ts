import { cronJobs } from "convex/server";
import { internal, api } from "./_generated/api";

const crons = cronJobs();

// Run sentiment score updates once per day
crons.interval(
  "update-sentiment-scores",
  { hours: 24 }, // Run once per day
  internal.stats.sentimentActions.updateAllSentimentScores
);

// Fetch latest hourly ticker data every hour
crons.hourly(
  "fetch-hourly-ticker-data",
  { minuteUTC: 0 }, // Run at the top of every hour (XX:00)
  api.stats.populateLast24Hours.populateLast24Hours,
  { ticker: "MNQ=F" }
);

export default crons;
