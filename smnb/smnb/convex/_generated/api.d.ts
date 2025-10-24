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
import type * as crons from "../crons.js";
import type * as editor_documents from "../editor/documents.js";
import type * as editor_generateContent from "../editor/generateContent.js";
import type * as editor_generatedPosts from "../editor/generatedPosts.js";
import type * as editor_newsletters from "../editor/newsletters.js";
import type * as engine_applyEvents from "../engine/applyEvents.js";
import type * as engine_control from "../engine/control.js";
import type * as engine_emitEvent from "../engine/emitEvent.js";
import type * as engine_mutations from "../engine/mutations.js";
import type * as engine_queries from "../engine/queries.js";
import type * as engine_setup from "../engine/setup.js";
import type * as engine_utils from "../engine/utils.js";
import type * as files from "../files.js";
import type * as host_chatAgent from "../host/chatAgent.js";
import type * as host_storyHistory from "../host/storyHistory.js";
import type * as keywords_extraction from "../keywords/extraction.js";
import type * as keywords_keywords from "../keywords/keywords.js";
import type * as keywords_metrics from "../keywords/metrics.js";
import type * as keywords_refinement from "../keywords/refinement.js";
import type * as llm_prompts from "../llm/prompts.js";
import type * as nexus_actions_generateEmbeddings from "../nexus/actions/generateEmbeddings.js";
import type * as nexus_actions_processDocument from "../nexus/actions/processDocument.js";
import type * as nexus_actions_retrieveContext from "../nexus/actions/retrieveContext.js";
import type * as nexus_agents from "../nexus/agents.js";
import type * as nexus_documents from "../nexus/documents.js";
import type * as nexus_embeddings from "../nexus/embeddings.js";
import type * as nexus_sessionChats from "../nexus/sessionChats.js";
import type * as reddit_enhancedTrends from "../reddit/enhancedTrends.js";
import type * as reddit_feed from "../reddit/feed.js";
import type * as reddit_posts from "../reddit/posts.js";
import type * as reddit_subredditSources from "../reddit/subredditSources.js";
import type * as reddit_subredditSourcesMutations from "../reddit/subredditSourcesMutations.js";
import type * as reddit_trends from "../reddit/trends.js";
import type * as stats_aggregation from "../stats/aggregation.js";
import type * as stats_bulkNewsGeneration from "../stats/bulkNewsGeneration.js";
import type * as stats_dailySentiment from "../stats/dailySentiment.js";
import type * as stats_debugSentiment from "../stats/debugSentiment.js";
import type * as stats_earningsData from "../stats/earningsData.js";
import type * as stats_finlightNews from "../stats/finlightNews.js";
import type * as stats_finlightNewsCache from "../stats/finlightNewsCache.js";
import type * as stats_getLast24HoursData from "../stats/getLast24HoursData.js";
import type * as stats_historicalChartData from "../stats/historicalChartData.js";
import type * as stats_historicalChartDataCache from "../stats/historicalChartDataCache.js";
import type * as stats_historicalChartDataQuery from "../stats/historicalChartDataQuery.js";
import type * as stats_index from "../stats/index.js";
import type * as stats_latestSentiment from "../stats/latestSentiment.js";
import type * as stats_mutations from "../stats/mutations.js";
import type * as stats_populateHistoricalData from "../stats/populateHistoricalData.js";
import type * as stats_populateLast24Hours from "../stats/populateLast24Hours.js";
import type * as stats_queries from "../stats/queries.js";
import type * as stats_runSentimentUpdate from "../stats/runSentimentUpdate.js";
import type * as stats_scheduled from "../stats/scheduled.js";
import type * as stats_sentimentActions from "../stats/sentimentActions.js";
import type * as stats_sentimentAnalysis from "../stats/sentimentAnalysis.js";
import type * as stats_sentimentExcerptCache from "../stats/sentimentExcerptCache.js";
import type * as stats_sentimentIndex from "../stats/sentimentIndex.js";
import type * as stats_sentimentQueries from "../stats/sentimentQueries.js";
import type * as stats_stockPrice from "../stats/stockPrice.js";
import type * as stats_stockPriceCache from "../stats/stockPriceCache.js";
import type * as stats_stockPriceQuery from "../stats/stockPriceQuery.js";
import type * as stats_subredditStats from "../stats/subredditStats.js";
import type * as stats_test from "../stats/test.js";
import type * as stats_testSentimentIndex from "../stats/testSentimentIndex.js";
import type * as stats_tickerVsIndex from "../stats/tickerVsIndex.js";
import type * as stats_tickerVsNews from "../stats/tickerVsNews.js";
import type * as stats_trading from "../stats/trading.js";
import type * as stats_tradingEnhanced from "../stats/tradingEnhanced.js";
import type * as system_apiHealth from "../system/apiHealth.js";
import type * as system_clearDatabase from "../system/clearDatabase.js";
import type * as system_debug from "../system/debug.js";
import type * as system_studioControls from "../system/studioControls.js";
import type * as system_studioControlsActions from "../system/studioControlsActions.js";
import type * as system_test from "../system/test.js";
import type * as ticker_iconCache from "../ticker/iconCache.js";
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
  crons: typeof crons;
  "editor/documents": typeof editor_documents;
  "editor/generateContent": typeof editor_generateContent;
  "editor/generatedPosts": typeof editor_generatedPosts;
  "editor/newsletters": typeof editor_newsletters;
  "engine/applyEvents": typeof engine_applyEvents;
  "engine/control": typeof engine_control;
  "engine/emitEvent": typeof engine_emitEvent;
  "engine/mutations": typeof engine_mutations;
  "engine/queries": typeof engine_queries;
  "engine/setup": typeof engine_setup;
  "engine/utils": typeof engine_utils;
  files: typeof files;
  "host/chatAgent": typeof host_chatAgent;
  "host/storyHistory": typeof host_storyHistory;
  "keywords/extraction": typeof keywords_extraction;
  "keywords/keywords": typeof keywords_keywords;
  "keywords/metrics": typeof keywords_metrics;
  "keywords/refinement": typeof keywords_refinement;
  "llm/prompts": typeof llm_prompts;
  "nexus/actions/generateEmbeddings": typeof nexus_actions_generateEmbeddings;
  "nexus/actions/processDocument": typeof nexus_actions_processDocument;
  "nexus/actions/retrieveContext": typeof nexus_actions_retrieveContext;
  "nexus/agents": typeof nexus_agents;
  "nexus/documents": typeof nexus_documents;
  "nexus/embeddings": typeof nexus_embeddings;
  "nexus/sessionChats": typeof nexus_sessionChats;
  "reddit/enhancedTrends": typeof reddit_enhancedTrends;
  "reddit/feed": typeof reddit_feed;
  "reddit/posts": typeof reddit_posts;
  "reddit/subredditSources": typeof reddit_subredditSources;
  "reddit/subredditSourcesMutations": typeof reddit_subredditSourcesMutations;
  "reddit/trends": typeof reddit_trends;
  "stats/aggregation": typeof stats_aggregation;
  "stats/bulkNewsGeneration": typeof stats_bulkNewsGeneration;
  "stats/dailySentiment": typeof stats_dailySentiment;
  "stats/debugSentiment": typeof stats_debugSentiment;
  "stats/earningsData": typeof stats_earningsData;
  "stats/finlightNews": typeof stats_finlightNews;
  "stats/finlightNewsCache": typeof stats_finlightNewsCache;
  "stats/getLast24HoursData": typeof stats_getLast24HoursData;
  "stats/historicalChartData": typeof stats_historicalChartData;
  "stats/historicalChartDataCache": typeof stats_historicalChartDataCache;
  "stats/historicalChartDataQuery": typeof stats_historicalChartDataQuery;
  "stats/index": typeof stats_index;
  "stats/latestSentiment": typeof stats_latestSentiment;
  "stats/mutations": typeof stats_mutations;
  "stats/populateHistoricalData": typeof stats_populateHistoricalData;
  "stats/populateLast24Hours": typeof stats_populateLast24Hours;
  "stats/queries": typeof stats_queries;
  "stats/runSentimentUpdate": typeof stats_runSentimentUpdate;
  "stats/scheduled": typeof stats_scheduled;
  "stats/sentimentActions": typeof stats_sentimentActions;
  "stats/sentimentAnalysis": typeof stats_sentimentAnalysis;
  "stats/sentimentExcerptCache": typeof stats_sentimentExcerptCache;
  "stats/sentimentIndex": typeof stats_sentimentIndex;
  "stats/sentimentQueries": typeof stats_sentimentQueries;
  "stats/stockPrice": typeof stats_stockPrice;
  "stats/stockPriceCache": typeof stats_stockPriceCache;
  "stats/stockPriceQuery": typeof stats_stockPriceQuery;
  "stats/subredditStats": typeof stats_subredditStats;
  "stats/test": typeof stats_test;
  "stats/testSentimentIndex": typeof stats_testSentimentIndex;
  "stats/tickerVsIndex": typeof stats_tickerVsIndex;
  "stats/tickerVsNews": typeof stats_tickerVsNews;
  "stats/trading": typeof stats_trading;
  "stats/tradingEnhanced": typeof stats_tradingEnhanced;
  "system/apiHealth": typeof system_apiHealth;
  "system/clearDatabase": typeof system_clearDatabase;
  "system/debug": typeof system_debug;
  "system/studioControls": typeof system_studioControls;
  "system/studioControlsActions": typeof system_studioControlsActions;
  "system/test": typeof system_test;
  "ticker/iconCache": typeof ticker_iconCache;
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
