"use node";

import { action } from "../_generated/server";
import { v, Infer } from "convex/values";
import { api } from "../_generated/api";

const DEFAULT_PROFILE_ID = "default";

const groupValidator = v.object({
  id: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  subreddits: v.array(v.string()),
});

type ControlsState = {
  profileId: string;
  defaultGroupsVersion: number;
  defaultGroups: Array<{
    id: string;
    label: string;
    description?: string;
    subreddits: string[];
  }>;
  activeGroupId: string | null;
  enabledDefaults: string[];
  customSubreddits: string[];
  searchDomains: string[];
  hasCustomizations: boolean;
  lastSyncedAt: number | null;
  source: "db" | "default";
};

type RedditSubredditData = {
  display_name?: string;
  display_name_prefixed?: string;
  title?: string;
  subscribers?: number;
};

function normalizeLooseSubreddit(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withoutPrefix = trimmed.replace(/^\/?r\//i, "");
  const cleaned = withoutPrefix.toLowerCase();
  const match = cleaned.match(/^[a-z0-9_]{2,50}$/);
  if (!match) return null;
  return cleaned;
}

function normalizeStrictSubreddit(input: string | undefined | null): string | null {
  const loose = normalizeLooseSubreddit(input);
  if (!loose) return null;
  const strictMatch = loose.match(/^[a-z0-9_]{3,21}$/);
  if (!strictMatch) return null;
  return loose;
}

type FetchResult =
  | { status: "success"; data: RedditSubredditData }
  | { status: "not_found" }
  | { status: "rate_limited" }
  | { status: "forbidden" }
  | { status: "error"; message?: string };

async function fetchSubredditMetadata(fetcher: typeof fetch, normalized: string): Promise<FetchResult> {
  const headers = {
    "User-Agent": "SMNB-Controls/1.0 (+https://github.com/acdc-digital)",
    Accept: "application/json",
  } satisfies Record<string, string>;

  const attempts: Array<{
    url: string;
    transform: (json: unknown) => RedditSubredditData | null | undefined;
  }> = [
    {
      url: `https://www.reddit.com/r/${encodeURIComponent(normalized)}/about.json`,
      transform: (json) => (typeof json === "object" && json !== null ? (json as { data?: RedditSubredditData }).data ?? null : null),
    },
    {
      url: `https://www.reddit.com/api/info.json?sr_name=${encodeURIComponent(normalized)}`,
      transform: (json) => {
        if (!json || typeof json !== "object") return null;
        const children = (json as { data?: { children?: Array<{ data?: RedditSubredditData }> } }).data?.children;
        return children && children.length > 0 ? children[0]?.data ?? null : null;
      },
    },
  ];

  let sawForbidden = false;
  let sawRateLimit = false;
  let lastError: string | undefined;

  for (const attempt of attempts) {
    try {
  const response = await fetcher(attempt.url, { headers });

      if (response.status === 404) {
        return { status: "not_found" };
      }
      if (response.status === 429) {
        sawRateLimit = true;
        continue;
      }
      if (response.status === 403) {
        sawForbidden = true;
        continue;
      }

      if (!response.ok) {
        lastError = `Request to ${attempt.url} failed with status ${response.status}`;
        continue;
      }

      const json = await response.json();
      const data = attempt.transform(json);
      if (data && typeof data === "object") {
        return { status: "success", data };
      }
    } catch (error) {
      lastError = (error as Error).message;
    }
  }

  if (sawRateLimit) {
    return { status: "rate_limited" };
  }
  if (sawForbidden) {
    return { status: "forbidden" };
  }
  return { status: "error", message: lastError };
}

export const addCustomSubreddit = action({
  args: {
    profileId: v.optional(v.string()),
    subreddit: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
    message: v.optional(v.string()),
    state: v.optional(
      v.object({
        profileId: v.string(),
        defaultGroupsVersion: v.number(),
        defaultGroups: v.array(groupValidator),
        activeGroupId: v.union(v.string(), v.null()),
        enabledDefaults: v.array(v.string()),
        customSubreddits: v.array(v.string()),
        searchDomains: v.array(v.string()),
        hasCustomizations: v.boolean(),
        lastSyncedAt: v.union(v.number(), v.null()),
        source: v.union(v.literal("db"), v.literal("default")),
      })
    ),
    subreddit: v.optional(
      v.object({
        slug: v.string(),
        displayName: v.string(),
        title: v.optional(v.string()),
        subscribers: v.optional(v.number()),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const profileId = (args.profileId ?? DEFAULT_PROFILE_ID).toLowerCase();
    const normalized = normalizeStrictSubreddit(args.subreddit);

    if (!normalized) {
      return {
        ok: false,
        message: "Enter a valid subreddit name (letters, numbers, underscores).",
      };
    }

    const currentState: ControlsState = await ctx.runQuery(api.system.studioControls.getControlsState, {
      profileId,
    });

    if (currentState.enabledDefaults.includes(normalized) || currentState.customSubreddits.includes(normalized)) {
      return {
        ok: true,
        message: "Subreddit already present in your list.",
        state: currentState,
        subreddit: {
          slug: normalized,
          displayName: `r/${normalized}`,
        },
      };
    }

  const fetchResult = await fetchSubredditMetadata(fetch, normalized);

    if (fetchResult.status === "not_found") {
      return {
        ok: false,
        message: `Subreddit r/${normalized} was not found.`,
      };
    }

    if (fetchResult.status === "rate_limited") {
      return {
        ok: false,
        message: "We are being rate limited by Reddit. Please wait a moment and retry.",
      };
    }

    const metadata = fetchResult.status === "success" ? fetchResult.data : undefined;
    const canonical = normalizeStrictSubreddit(metadata?.display_name) ?? normalized;
    const displayName: string =
      typeof metadata?.display_name_prefixed === "string" ? metadata.display_name_prefixed : `r/${canonical}`;

    const updatedCustom = [...currentState.customSubreddits, canonical];

    await ctx.runMutation(api.system.studioControls.saveSubredditSelection, {
      profileId,
      enabledDefaults: currentState.enabledDefaults,
      customSubreddits: updatedCustom,
    });

    const nextState: ControlsState = await ctx.runQuery(api.system.studioControls.getControlsState, {
      profileId,
    });

    return {
      ok: true,
      message:
        fetchResult.status === "forbidden"
          ? "Added subreddit. Reddit limited metadata verification, so details may be delayed."
          : fetchResult.status === "error"
            ? `Added subreddit. Metadata verification hit an issue${fetchResult.message ? ` (${fetchResult.message})` : "."}`
            : undefined,
      state: nextState,
      subreddit: {
        slug: canonical,
        displayName,
        title: typeof metadata?.title === "string" ? metadata.title : undefined,
        subscribers: typeof metadata?.subscribers === "number" ? metadata.subscribers : undefined,
      },
    };
  },
});
