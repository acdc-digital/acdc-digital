/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents from "../agents.js";
import type * as campaigns from "../campaigns.js";
import type * as deliveries from "../deliveries.js";
import type * as emailSending from "../emailSending.js";
import type * as http from "../http.js";
import type * as lib_resend from "../lib/resend.js";
import type * as myFunctions from "../myFunctions.js";
import type * as recipients from "../recipients.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  campaigns: typeof campaigns;
  deliveries: typeof deliveries;
  emailSending: typeof emailSending;
  http: typeof http;
  "lib/resend": typeof lib_resend;
  myFunctions: typeof myFunctions;
  recipients: typeof recipients;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
