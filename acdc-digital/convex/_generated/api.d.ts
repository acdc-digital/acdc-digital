/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_intents from "../agents/intents.js";
import type * as agents_orchestrator from "../agents/orchestrator.js";
import type * as agents_tools from "../agents/tools.js";
import type * as ai_computerUse from "../ai/computerUse.js";
import type * as ai_contentTransform from "../ai/contentTransform.js";
import type * as ai_streaming from "../ai/streaming.js";
import type * as chat from "../chat.js";
import type * as chatMessages from "../chatMessages.js";
import type * as database from "../database.js";
import type * as documentCleanup from "../documentCleanup.js";
import type * as documentStatus from "../documentStatus.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as prosemirror from "../prosemirror.js";
import type * as sharedDocument from "../sharedDocument.js";

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
  "agents/intents": typeof agents_intents;
  "agents/orchestrator": typeof agents_orchestrator;
  "agents/tools": typeof agents_tools;
  "ai/computerUse": typeof ai_computerUse;
  "ai/contentTransform": typeof ai_contentTransform;
  "ai/streaming": typeof ai_streaming;
  chat: typeof chat;
  chatMessages: typeof chatMessages;
  database: typeof database;
  documentCleanup: typeof documentCleanup;
  documentStatus: typeof documentStatus;
  documents: typeof documents;
  http: typeof http;
  prosemirror: typeof prosemirror;
  sharedDocument: typeof sharedDocument;
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

export declare const components: {
  prosemirrorSync: {
    lib: {
      deleteDocument: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        null
      >;
      deleteSnapshots: FunctionReference<
        "mutation",
        "internal",
        { afterVersion?: number; beforeVersion?: number; id: string },
        null
      >;
      deleteSteps: FunctionReference<
        "mutation",
        "internal",
        {
          afterVersion?: number;
          beforeTs: number;
          deleteNewerThanLatestSnapshot?: boolean;
          id: string;
        },
        null
      >;
      getSnapshot: FunctionReference<
        "query",
        "internal",
        { id: string; version?: number },
        { content: null } | { content: string; version: number }
      >;
      getSteps: FunctionReference<
        "query",
        "internal",
        { id: string; version: number },
        {
          clientIds: Array<string | number>;
          steps: Array<string>;
          version: number;
        }
      >;
      latestVersion: FunctionReference<
        "query",
        "internal",
        { id: string },
        null | number
      >;
      submitSnapshot: FunctionReference<
        "mutation",
        "internal",
        {
          content: string;
          id: string;
          pruneSnapshots?: boolean;
          version: number;
        },
        null
      >;
      submitSteps: FunctionReference<
        "mutation",
        "internal",
        {
          clientId: string | number;
          id: string;
          steps: Array<string>;
          version: number;
        },
        | {
            clientIds: Array<string | number>;
            status: "needs-rebase";
            steps: Array<string>;
          }
        | { status: "synced" }
      >;
    };
  };
};
