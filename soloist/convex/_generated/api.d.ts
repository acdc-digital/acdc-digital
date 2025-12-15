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
import type * as auth from "../auth.js";
import type * as customAuth from "../customAuth.js";
import type * as http from "../http.js";
import type * as renderer_base_baseline from "../renderer/base/baseline.js";
import type * as renderer_base_baselineChat from "../renderer/base/baselineChat.js";
import type * as renderer_base_baselineChatActions from "../renderer/base/baselineChatActions.js";
import type * as renderer_heatmap_dailyLogTemplates from "../renderer/heatmap/dailyLogTemplates.js";
import type * as renderer_heatmap_dailyLogs from "../renderer/heatmap/dailyLogs.js";
import type * as renderer_heatmap_feed from "../renderer/heatmap/feed.js";
import type * as renderer_heatmap_longForm from "../renderer/heatmap/longForm.js";
import type * as renderer_heatmap_randomizer from "../renderer/heatmap/randomizer.js";
import type * as renderer_heatmap_score from "../renderer/heatmap/score.js";
import type * as renderer_heatmap_templates from "../renderer/heatmap/templates.js";
import type * as renderer_soloist_forecast from "../renderer/soloist/forecast.js";
import type * as renderer_soloist_generator from "../renderer/soloist/generator.js";
import type * as renderer_soloist_historicalForecast from "../renderer/soloist/historicalForecast.js";
import type * as shared_feedback_feedback from "../shared/feedback/feedback.js";
import type * as shared_lib_prompts from "../shared/lib/prompts.js";
import type * as shared_lib_requireAdmin from "../shared/lib/requireAdmin.js";
import type * as shared_payments_payments from "../shared/payments/payments.js";
import type * as shared_payments_stripe from "../shared/payments/stripe.js";
import type * as shared_payments_webhooks from "../shared/payments/webhooks.js";
import type * as shared_users_userAttributes from "../shared/users/userAttributes.js";
import type * as shared_users_userSubscriptions from "../shared/users/userSubscriptions.js";
import type * as shared_users_users from "../shared/users/users.js";
import type * as website_admin_admin from "../website/admin/admin.js";
import type * as website_admin_anthropic from "../website/admin/anthropic.js";
import type * as website_public_learnMore from "../website/public/learnMore.js";
import type * as website_public_newsletter from "../website/public/newsletter.js";
import type * as website_public_waitlist from "../website/public/waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  ResendOTP: typeof ResendOTP;
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  auth: typeof auth;
  customAuth: typeof customAuth;
  http: typeof http;
  "renderer/base/baseline": typeof renderer_base_baseline;
  "renderer/base/baselineChat": typeof renderer_base_baselineChat;
  "renderer/base/baselineChatActions": typeof renderer_base_baselineChatActions;
  "renderer/heatmap/dailyLogTemplates": typeof renderer_heatmap_dailyLogTemplates;
  "renderer/heatmap/dailyLogs": typeof renderer_heatmap_dailyLogs;
  "renderer/heatmap/feed": typeof renderer_heatmap_feed;
  "renderer/heatmap/longForm": typeof renderer_heatmap_longForm;
  "renderer/heatmap/randomizer": typeof renderer_heatmap_randomizer;
  "renderer/heatmap/score": typeof renderer_heatmap_score;
  "renderer/heatmap/templates": typeof renderer_heatmap_templates;
  "renderer/soloist/forecast": typeof renderer_soloist_forecast;
  "renderer/soloist/generator": typeof renderer_soloist_generator;
  "renderer/soloist/historicalForecast": typeof renderer_soloist_historicalForecast;
  "shared/feedback/feedback": typeof shared_feedback_feedback;
  "shared/lib/prompts": typeof shared_lib_prompts;
  "shared/lib/requireAdmin": typeof shared_lib_requireAdmin;
  "shared/payments/payments": typeof shared_payments_payments;
  "shared/payments/stripe": typeof shared_payments_stripe;
  "shared/payments/webhooks": typeof shared_payments_webhooks;
  "shared/users/userAttributes": typeof shared_users_userAttributes;
  "shared/users/userSubscriptions": typeof shared_users_userSubscriptions;
  "shared/users/users": typeof shared_users_users;
  "website/admin/admin": typeof website_admin_admin;
  "website/admin/anthropic": typeof website_admin_anthropic;
  "website/public/learnMore": typeof website_public_learnMore;
  "website/public/newsletter": typeof website_public_newsletter;
  "website/public/waitlist": typeof website_public_waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
