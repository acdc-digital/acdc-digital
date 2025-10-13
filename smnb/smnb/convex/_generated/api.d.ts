/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics_costTracking from "../analytics/costTracking.js";
import type * as analytics_queries from "../analytics/queries.js";
import type * as analytics_tokenUsage from "../analytics/tokenUsage.js";
import type * as analytics_userAnalytics from "../analytics/userAnalytics.js";
import type * as clearDatabase from "../clearDatabase.js";
import type * as editor_documents from "../editor/documents.js";
import type * as editor_generateContent from "../editor/generateContent.js";
import type * as editor_generatedPosts from "../editor/generatedPosts.js";
import type * as editor_newsletters from "../editor/newsletters.js";
import type * as host_chatAgent from "../host/chatAgent.js";
import type * as host_storyHistory from "../host/storyHistory.js";
import type * as keywords_keywords from "../keywords/keywords.js";
import type * as keywords_metrics from "../keywords/metrics.js";
import type * as nexus_agents from "../nexus/agents.js";
import type * as nexus_sessionChats from "../nexus/sessionChats.js";
import type * as reddit_enhancedTrends from "../reddit/enhancedTrends.js";
import type * as reddit_feed from "../reddit/feed.js";
import type * as reddit_posts from "../reddit/posts.js";
import type * as reddit_trends from "../reddit/trends.js";
import type * as stats_aggregation from "../stats/aggregation.js";
import type * as stats_index from "../stats/index.js";
import type * as stats_mutations from "../stats/mutations.js";
import type * as stats_queries from "../stats/queries.js";
import type * as stats_scheduled from "../stats/scheduled.js";
import type * as stats_subredditStats from "../stats/subredditStats.js";
import type * as stats_test from "../stats/test.js";
import type * as stats_trading from "../stats/trading.js";
import type * as system_apiHealth from "../system/apiHealth.js";
import type * as system_clearDatabase from "../system/clearDatabase.js";
import type * as system_debug from "../system/debug.js";
import type * as system_studioControls from "../system/studioControls.js";
import type * as system_studioControlsActions from "../system/studioControlsActions.js";
import type * as system_test from "../system/test.js";
import type * as trading from "../trading.js";
import type * as users_messages from "../users/messages.js";
import type * as users_sessions from "../users/sessions.js";
import type * as users_users from "../users/users.js";

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
  "analytics/costTracking": typeof analytics_costTracking;
  "analytics/queries": typeof analytics_queries;
  "analytics/tokenUsage": typeof analytics_tokenUsage;
  "analytics/userAnalytics": typeof analytics_userAnalytics;
  clearDatabase: typeof clearDatabase;
  "editor/documents": typeof editor_documents;
  "editor/generateContent": typeof editor_generateContent;
  "editor/generatedPosts": typeof editor_generatedPosts;
  "editor/newsletters": typeof editor_newsletters;
  "host/chatAgent": typeof host_chatAgent;
  "host/storyHistory": typeof host_storyHistory;
  "keywords/keywords": typeof keywords_keywords;
  "keywords/metrics": typeof keywords_metrics;
  "nexus/agents": typeof nexus_agents;
  "nexus/sessionChats": typeof nexus_sessionChats;
  "reddit/enhancedTrends": typeof reddit_enhancedTrends;
  "reddit/feed": typeof reddit_feed;
  "reddit/posts": typeof reddit_posts;
  "reddit/trends": typeof reddit_trends;
  "stats/aggregation": typeof stats_aggregation;
  "stats/index": typeof stats_index;
  "stats/mutations": typeof stats_mutations;
  "stats/queries": typeof stats_queries;
  "stats/scheduled": typeof stats_scheduled;
  "stats/subredditStats": typeof stats_subredditStats;
  "stats/test": typeof stats_test;
  "stats/trading": typeof stats_trading;
  "system/apiHealth": typeof system_apiHealth;
  "system/clearDatabase": typeof system_clearDatabase;
  "system/debug": typeof system_debug;
  "system/studioControls": typeof system_studioControls;
  "system/studioControlsActions": typeof system_studioControlsActions;
  "system/test": typeof system_test;
  trading: typeof trading;
  "users/messages": typeof users_messages;
  "users/sessions": typeof users_sessions;
  "users/users": typeof users_users;
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
