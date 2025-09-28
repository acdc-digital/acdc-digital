/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiHealth from "../apiHealth.js";
import type * as clearDatabase from "../clearDatabase.js";
import type * as costTracking from "../costTracking.js";
import type * as debug from "../debug.js";
import type * as editorDocuments from "../editorDocuments.js";
import type * as enhancedTrends from "../enhancedTrends.js";
import type * as generateContent from "../generateContent.js";
import type * as generatedPosts from "../generatedPosts.js";
import type * as keywordMetrics from "../keywordMetrics.js";
import type * as keywords from "../keywords.js";
import type * as newsletters from "../newsletters.js";
import type * as redditFeed from "../redditFeed.js";
import type * as redditPosts from "../redditPosts.js";
import type * as stats_aggregation from "../stats/aggregation.js";
import type * as stats_index from "../stats/index.js";
import type * as stats_mutations from "../stats/mutations.js";
import type * as stats_queries from "../stats/queries.js";
import type * as stats_scheduled from "../stats/scheduled.js";
import type * as stats_subredditStats from "../stats/subredditStats.js";
import type * as stats_test from "../stats/test.js";
import type * as storyHistory from "../storyHistory.js";
import type * as studioControls from "../studioControls.js";
import type * as studioControlsActions from "../studioControlsActions.js";
import type * as test from "../test.js";
import type * as tokenUsage from "../tokenUsage.js";
import type * as trends from "../trends.js";
import type * as userAnalytics from "../userAnalytics.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  apiHealth: typeof apiHealth;
  clearDatabase: typeof clearDatabase;
  costTracking: typeof costTracking;
  debug: typeof debug;
  editorDocuments: typeof editorDocuments;
  enhancedTrends: typeof enhancedTrends;
  generateContent: typeof generateContent;
  generatedPosts: typeof generatedPosts;
  keywordMetrics: typeof keywordMetrics;
  keywords: typeof keywords;
  newsletters: typeof newsletters;
  redditFeed: typeof redditFeed;
  redditPosts: typeof redditPosts;
  "stats/aggregation": typeof stats_aggregation;
  "stats/index": typeof stats_index;
  "stats/mutations": typeof stats_mutations;
  "stats/queries": typeof stats_queries;
  "stats/scheduled": typeof stats_scheduled;
  "stats/subredditStats": typeof stats_subredditStats;
  "stats/test": typeof stats_test;
  storyHistory: typeof storyHistory;
  studioControls: typeof studioControls;
  studioControlsActions: typeof studioControlsActions;
  test: typeof test;
  tokenUsage: typeof tokenUsage;
  trends: typeof trends;
  userAnalytics: typeof userAnalytics;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
