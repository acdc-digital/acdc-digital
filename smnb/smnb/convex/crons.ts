import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run sentiment score updates once per day
crons.interval(
  "update-sentiment-scores",
  { hours: 24 }, // Run once per day
  internal.stats.sentimentActions.updateAllSentimentScores
);

export default crons;
