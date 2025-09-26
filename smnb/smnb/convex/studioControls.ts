import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

type SubredditGroup = {
  id: string;
  label: string;
  description?: string;
  subreddits: string[];
};

const DEFAULT_PROFILE_ID = "default";
const DEFAULT_GROUPS_VERSION = 1;
const MAX_CUSTOM_SUBREDDITS = 100;
const MAX_ENABLED_DEFAULTS = 100;
const MAX_SEARCH_DOMAINS = 100;

const SUBREDDIT_GROUPS: ReadonlyArray<SubredditGroup> = [
  {
    id: "news",
    label: "News Pulse",
    description: "Breaking headlines and U.S. politics",
    subreddits: ["news", "worldnews", "politics", "economics", "breakingnews"],
  },
  {
    id: "worldnews",
    label: "Global Watch",
    description: "International coverage and geopolitics",
    subreddits: ["worldnews", "geopolitics", "europe", "asia", "internationalnews"],
  },
  {
    id: "tech",
    label: "Tech Radar",
    description: "Innovation, startups, and programming",
    subreddits: ["technology", "programming", "startups", "gadgets", "artificial"],
  },
  {
    id: "sports",
    label: "Sports Desk",
    description: "Major leagues and global competitions",
    subreddits: ["sports", "nfl", "nba", "soccer", "olympics"],
  },
  {
    id: "gaming",
    label: "Gaming Queue",
    description: "Consoles, PC, and industry news",
    subreddits: ["gaming", "pcgaming", "nintendo", "playstation", "xbox"],
  },
  {
    id: "funny",
    label: "Humor Loop",
    description: "Lightweight humor and internet culture",
    subreddits: ["funny", "memes", "dankmemes", "wholesomememes", "jokes"],
  },
  {
    id: "learning",
    label: "Curiosity Lab",
    description: "Education and explainers",
    subreddits: ["todayilearned", "explainlikeimfive", "askscience", "history", "documentaries"],
  },
  {
    id: "social",
    label: "Social Signals",
    description: "Community questions and human stories",
    subreddits: ["askreddit", "relationships", "advice", "socialskills", "confession"],
  },
];

const GROUP_LOOKUP = new Map(SUBREDDIT_GROUPS.map((group) => [group.id, group] as const));
const DEFAULT_SUBREDDIT_OPTIONS = new Set(
  SUBREDDIT_GROUPS.flatMap((group) => group.subreddits.map((sub) => sub.toLowerCase()))
);
DEFAULT_SUBREDDIT_OPTIONS.add("all");

const groupValidator = v.object({
  id: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  subreddits: v.array(v.string()),
});

type ControlsDoc = Doc<"studio_controls">;

type ControlsState = {
  profileId: string;
  defaultGroupsVersion: number;
  defaultGroups: SubredditGroup[];
  activeGroupId: string | null;
  enabledDefaults: string[];
  customSubreddits: string[];
  searchDomains: string[];
  hasCustomizations: boolean;
  lastSyncedAt: number | null;
  source: "db" | "default";
};

function fallbackState(profileId: string): ControlsState {
  const firstGroup = SUBREDDIT_GROUPS[0];
  return {
    profileId,
    defaultGroupsVersion: DEFAULT_GROUPS_VERSION,
    defaultGroups: SUBREDDIT_GROUPS.map((group) => ({
      ...group,
      subreddits: [...group.subreddits],
    })),
    activeGroupId: firstGroup?.id ?? null,
    enabledDefaults: firstGroup ? [...firstGroup.subreddits] : [],
    customSubreddits: [],
    searchDomains: [],
    hasCustomizations: false,
    lastSyncedAt: null,
    source: "default" as const,
  };
}

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

function uniqueList(values: string[], limit: number): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const lower = value.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    output.push(lower);
    if (output.length >= limit) break;
  }
  return output;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function computeMatchedGroup(enabledDefaults: string[], customSubreddits: string[]): SubredditGroup | undefined {
  if (customSubreddits.length > 0) return undefined;
  for (const group of SUBREDDIT_GROUPS) {
    const normalized = group.subreddits.map((sub) => sub.toLowerCase());
    if (arraysEqual(enabledDefaults, normalized)) {
      return group;
    }
  }
  return undefined;
}

function buildStateFromDoc(profileId: string, doc: ControlsDoc | null): ControlsState {
  if (!doc) {
    return fallbackState(profileId);
  }
  return {
    profileId,
    defaultGroupsVersion: DEFAULT_GROUPS_VERSION,
    defaultGroups: SUBREDDIT_GROUPS.map((group) => ({
      ...group,
      subreddits: [...group.subreddits],
    })),
    activeGroupId: doc.active_group_id ?? null,
    enabledDefaults: doc.enabled_defaults,
    customSubreddits: doc.custom_subreddits,
    searchDomains: doc.search_domains,
    hasCustomizations: doc.has_customizations,
    lastSyncedAt: doc.last_synced_at ?? null,
    source: "db" as const,
  };
}

async function getControlsDoc(ctx: { db: any }, profileId: string): Promise<ControlsDoc | null> {
  const existing = await ctx.db
    .query("studio_controls")
    .withIndex("by_profile_id", (q: any) => q.eq("profile_id", profileId))
    .unique();
  return existing ?? null;
}

function normalizeDomain(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  let sanitized = trimmed.replace(/^https?:\/\//, "");
  sanitized = sanitized.replace(/^www\./, "");
  const stopChars = sanitized.search(/[\/?#]/);
  if (stopChars >= 0) {
    sanitized = sanitized.slice(0, stopChars);
  }
  sanitized = sanitized.replace(/[^a-z0-9.-]/g, "");
  if (!sanitized || sanitized.length < 3) return null;
  if (!sanitized.includes(".")) return null;
  return sanitized;
}

export const getControlsState = query({
  args: { profileId: v.optional(v.string()) },
  returns: v.object({
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
  }),
  handler: async (ctx, args) => {
    const profileId = (args.profileId ?? DEFAULT_PROFILE_ID).toLowerCase();
    const doc = await getControlsDoc(ctx, profileId);

    if (!doc) {
      return fallbackState(profileId);
    }

    return buildStateFromDoc(profileId, doc);
  },
});

export const saveSubredditSelection = mutation({
  args: {
    profileId: v.optional(v.string()),
    enabledDefaults: v.array(v.string()),
    customSubreddits: v.array(v.string()),
  },
  returns: v.object({
    profileId: v.string(),
    activeGroupId: v.union(v.string(), v.null()),
    enabledDefaults: v.array(v.string()),
    customSubreddits: v.array(v.string()),
    hasCustomizations: v.boolean(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const profileId = (args.profileId ?? DEFAULT_PROFILE_ID).toLowerCase();
    const existing = await getControlsDoc(ctx, profileId);

    const normalizedDefaultsRaw = args.enabledDefaults
      .map((value) => normalizeLooseSubreddit(value))
      .filter((value): value is string => Boolean(value));

    const normalizedDefaults = uniqueList(
      normalizedDefaultsRaw.filter((value) => DEFAULT_SUBREDDIT_OPTIONS.has(value)),
      MAX_ENABLED_DEFAULTS,
    );

    const normalizedCustom = uniqueList(
      args.customSubreddits
        .map((value) => normalizeLooseSubreddit(value))
        .filter((value): value is string => Boolean(value)),
      MAX_CUSTOM_SUBREDDITS,
    );

    const matchedGroup = computeMatchedGroup(normalizedDefaults, normalizedCustom);
    const hasCustomizations = !matchedGroup || normalizedCustom.length > 0;
  const activeGroupId = matchedGroup ? matchedGroup.id : null;

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        active_group_id: activeGroupId ?? undefined,
        enabled_defaults: normalizedDefaults,
        custom_subreddits: normalizedCustom,
        has_customizations: hasCustomizations,
        default_groups_version: DEFAULT_GROUPS_VERSION,
        updated_at: now,
        last_synced_at: now,
      });
    } else {
      await ctx.db.insert("studio_controls", {
        profile_id: profileId,
        active_group_id: activeGroupId ?? undefined,
        enabled_defaults: normalizedDefaults,
        custom_subreddits: normalizedCustom,
        search_domains: [],
        has_customizations: hasCustomizations,
        default_groups_version: DEFAULT_GROUPS_VERSION,
        created_at: now,
        updated_at: now,
        last_synced_at: now,
      });
    }

    return {
      profileId,
      activeGroupId,
      enabledDefaults: normalizedDefaults,
      customSubreddits: normalizedCustom,
      hasCustomizations,
      updatedAt: now,
    };
  },
});

export const setSearchDomains = mutation({
  args: {
    profileId: v.optional(v.string()),
    domains: v.array(v.string()),
  },
  returns: v.object({
    profileId: v.string(),
    searchDomains: v.array(v.string()),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const profileId = (args.profileId ?? DEFAULT_PROFILE_ID).toLowerCase();
    const existing = await getControlsDoc(ctx, profileId);

    const sanitizedDomains = uniqueList(
      args.domains
        .map((value) => normalizeDomain(value))
        .filter((value): value is string => Boolean(value)),
      MAX_SEARCH_DOMAINS,
    );

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        search_domains: sanitizedDomains,
        default_groups_version: DEFAULT_GROUPS_VERSION,
        updated_at: now,
        last_synced_at: now,
      });
    } else {
      await ctx.db.insert("studio_controls", {
        profile_id: profileId,
        active_group_id: SUBREDDIT_GROUPS[0]?.id ?? undefined,
        enabled_defaults: SUBREDDIT_GROUPS[0]?.subreddits.map((sub) => sub.toLowerCase()) ?? [],
        custom_subreddits: [],
        search_domains: sanitizedDomains,
        has_customizations: false,
        default_groups_version: DEFAULT_GROUPS_VERSION,
        created_at: now,
        updated_at: now,
        last_synced_at: now,
      });
    }

    return {
      profileId,
      searchDomains: sanitizedDomains,
      updatedAt: now,
    };
  },
});
