/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as ResendOTP from "../ResendOTP.js";
import type * as ResendOTPPasswordReset from "../ResendOTPPasswordReset.js";
import type * as admin from "../admin.js";
import type * as anthropic from "../anthropic.js";
import type * as auth from "../auth.js";
import type * as baseline from "../baseline.js";
import type * as baselineAnalysis from "../baselineAnalysis.js";
import type * as baselineChat from "../baselineChat.js";
import type * as baselineChatActions from "../baselineChatActions.js";
import type * as checkRateLimits from "../checkRateLimits.js";
import type * as cleanupAuth from "../cleanupAuth.js";
import type * as clearDatabase from "../clearDatabase.js";
import type * as customAuth from "../customAuth.js";
import type * as dailyLogTemplates from "../dailyLogTemplates.js";
import type * as dailyLogs from "../dailyLogs.js";
import type * as debugSubscription from "../debugSubscription.js";
import type * as debugUsers from "../debugUsers.js";
import type * as deleteRateLimits from "../deleteRateLimits.js";
import type * as feed from "../feed.js";
import type * as feedback from "../feedback.js";
import type * as forecast from "../forecast.js";
import type * as generator from "../generator.js";
import type * as historicalForecast from "../historicalForecast.js";
import type * as http from "../http.js";
import type * as manualSubscription from "../manualSubscription.js";
import type * as newsletter from "../newsletter.js";
import type * as payments from "../payments.js";
import type * as prompts from "../prompts.js";
import type * as randomizer from "../randomizer.js";
import type * as score from "../score.js";
import type * as stripe from "../stripe.js";
import type * as templates from "../templates.js";
import type * as testing from "../testing.js";
import type * as userAttributes from "../userAttributes.js";
import type * as userSubscriptions from "../userSubscriptions.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";
import type * as webhooks from "../webhooks.js";

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
  CustomPassword: typeof CustomPassword;
  ResendOTP: typeof ResendOTP;
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  admin: typeof admin;
  anthropic: typeof anthropic;
  auth: typeof auth;
  baseline: typeof baseline;
  baselineAnalysis: typeof baselineAnalysis;
  baselineChat: typeof baselineChat;
  baselineChatActions: typeof baselineChatActions;
  checkRateLimits: typeof checkRateLimits;
  cleanupAuth: typeof cleanupAuth;
  clearDatabase: typeof clearDatabase;
  customAuth: typeof customAuth;
  dailyLogTemplates: typeof dailyLogTemplates;
  dailyLogs: typeof dailyLogs;
  debugSubscription: typeof debugSubscription;
  debugUsers: typeof debugUsers;
  deleteRateLimits: typeof deleteRateLimits;
  feed: typeof feed;
  feedback: typeof feedback;
  forecast: typeof forecast;
  generator: typeof generator;
  historicalForecast: typeof historicalForecast;
  http: typeof http;
  manualSubscription: typeof manualSubscription;
  newsletter: typeof newsletter;
  payments: typeof payments;
  prompts: typeof prompts;
  randomizer: typeof randomizer;
  score: typeof score;
  stripe: typeof stripe;
  templates: typeof templates;
  testing: typeof testing;
  userAttributes: typeof userAttributes;
  userSubscriptions: typeof userSubscriptions;
  users: typeof users;
  waitlist: typeof waitlist;
  webhooks: typeof webhooks;
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
