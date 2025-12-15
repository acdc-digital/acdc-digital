// DETERMINISTIC BASELINE COMPUTATION
// /Users/matthewsimon/Projects/acdc-digital/soloist/convex/baseline.ts

import { mutation, query, action, internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ---------- Helpers: deterministic scoring maps ----------
function mapEmotionalFrequency(val: string | undefined): number {
  // lower intensity -> higher stability
  switch ((val || "").toLowerCase()) {
    case "rarely": return 85;
    case "sometimes": return 70;
    case "often": return 55;
    case "constantly": return 40;
    default: return 60;
  }
}

function mapStressRecovery(val: string | undefined): number {
  const s = (val || "").toLowerCase();
  if (s.includes("minute")) return 90;
  if (s.includes("hour")) return 80;
  if (s.includes("day") && !s.includes("several")) return 65;
  if (s.includes("several")) return 55;
  return 70;
}

function mapTypicalMood(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "optimistic": return 85;
    case "neutral": return 70;
    case "cautious": return 60;
    case "varies": return 55;
    default: return 65;
  }
}

function mapEmotionalAwareness(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "very easy": return 90;
    case "fairly easy": return 75;
    case "unsure": return 50;
    case "very difficult":
    case "difficult": return 35;
    default: return 65;
  }
}

function mapDecisionStyle(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "logic": return 85;
    case "balanced": return 70;
    case "instinct": return 55;
    default: return 68;
  }
}

function mapOverthinking(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "never": return 20;
    case "rarely": return 25;
    case "sometimes": return 45;
    case "often": return 70;
    case "frequently": return 70;
    case "constantly": return 85;
    default: return 50;
  }
}

function mapSetbackReaction(val: string | undefined): number {
  const s = (val || "").toLowerCase();
  if (s.includes("analyze")) return 85;
  if (s.includes("move on")) return 80;
  if (s.includes("discouraged")) return 45;
  if (s.includes("blame")) return 35;
  return 65;
}

function mapRoutineConsistency(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "very consistent":
    case "very-consistent":
    case "consistent": return 85;
    case "somewhat": return 65;
    case "unpredictable": return 45;
    default: return 60;
  }
}

function mapReflectionFrequency(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "daily": return 90;
    case "weekly": return 70;
    case "occasionally": return 55;
    case "rarely": return 40;
    default: return 60;
  }
}

function estimateResetSkill(val: string | undefined): number {
  const text = (val || "").trim();
  if (!text) return 55;
  const tokens = text
    .split(/[,/;]| and | or |\s+/gi)
    .map(s => s.trim())
    .filter(Boolean);
  const unique = new Set(tokens).size;
  if (unique >= 6) return 90;
  if (unique >= 4) return 80;
  if (unique >= 2) return 70;
  return 55;
}

function mapSocialPref(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "minimal": return 50;
    case "moderate": return 65;
    case "frequent": return 60;
    case "very frequent":
    case "very-frequent": return 60;
    default: return 60;
  }
}

function mapSelfUnderstanding(val: string | undefined): number {
  switch ((val || "").toLowerCase()) {
    case "very well":
    case "very-well":
    case "very": return 85;
    case "fairly well":
    case "fairly-well":
    case "fairly": return 70;
    case "somewhat": return 60;
    case "unsure": return 50;
    default: return 65;
  }
}

function motivationVector(val: string | undefined): {
  achievement: number;
  growth: number;
  curiosity: number;
  recognition?: number;
  security?: number;
} {
  const pick = (val || "").toLowerCase();
  
  if (pick === "achievement") return { achievement: 1, growth: 0, curiosity: 0 };
  if (pick === "growth") return { achievement: 0, growth: 1, curiosity: 0 };
  if (pick === "curiosity") return { achievement: 0, growth: 0, curiosity: 1 };
  if (pick === "recognition") return { achievement: 0, growth: 0, curiosity: 0, recognition: 1 };
  if (pick === "security") return { achievement: 0, growth: 0, curiosity: 0, security: 1 };
  if (pick === "impact") return { achievement: 0, growth: 0, curiosity: 0, recognition: 0.5 };
  
  // Default to growth
  return { achievement: 0, growth: 1, curiosity: 0 };
}

// ---------- Composite + confidence ----------
function compositeIndex(s: {
  emotional_stability: number;
  emotional_awareness: number;
  cognitive_rationality: number;
  rumination_risk: number;
  resilience: number;
  routine_consistency: number;
  reflection_habit: number;
  self_understanding: number;
}): number {
  const weighted =
      1.2 * s.emotional_stability +
      1.0 * s.emotional_awareness +
      0.8 * s.cognitive_rationality +
      1.0 * (100 - s.rumination_risk) +
      1.0 * s.resilience +
      1.0 * s.routine_consistency +
      1.0 * s.reflection_habit +
      0.8 * s.self_understanding;

  const maxWeighted =
      1.2*100 + 1.0*100 + 0.8*100 + 1.0*100 + 1.0*100 + 1.0*100 + 1.0*100 + 0.8*100;
  return Math.round((weighted / maxWeighted) * 100);
}

function confidenceScore(answers: Record<string, any>, scores: Record<string, number>): number {
  // coverage
  const totalFields = 18;
  const answered = Object.values(answers).filter(v => v !== undefined && String(v).trim() !== "").length;
  let conf = (answered / totalFields) * 70; // up to 70 points

  // text richness
  const longTexts = ["goodDayDescription", "successDefinition", "selfImprovementFocus"]
    .map(k => (answers[k] || "") as string)
    .filter(t => t.trim().length >= 120).length;
  conf += Math.min(2, longTexts) * 10; // +10 each up to +20

  // consistency heuristic
  // if "Very consistent" routine but "Rarely" reflection → small penalty
  const routine = (answers.consistency || "").toLowerCase();
  const reflect = (answers.reflectionFrequency || "").toLowerCase();
  if ((routine.includes("consistent") && reflect.includes("rarely"))) {
    conf -= 5;
  }
  return Math.max(30, Math.min(100, Math.round(conf)));
}

// ---------- Public mutations/queries/actions ----------
export const saveBaselineAnswers = mutation({
  args: {
    emotionalFrequency: v.optional(v.string()),
    stressRecovery: v.optional(v.string()),
    typicalMood: v.optional(v.string()),
    emotionalAwareness: v.optional(v.string()),
    goodDayDescription: v.optional(v.string()),
    decisionStyle: v.optional(v.string()),
    overthinking: v.optional(v.string()),
    reactionToSetback: v.optional(v.string()),
    motivationType: v.optional(v.string()),
    focusTrigger: v.optional(v.string()),
    successDefinition: v.optional(v.string()),
    consistency: v.optional(v.string()),
    reflectionFrequency: v.optional(v.string()),
    resetStrategy: v.optional(v.string()),
    socialLevel: v.optional(v.string()),
    rechargeMethod: v.optional(v.string()),
    selfUnderstanding: v.optional(v.string()),
    selfImprovementFocus: v.optional(v.string()),
  },
  returns: v.id("baseline_answers"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const id = await ctx.db.insert("baseline_answers", {
      userId,
      emotionalFrequency: args.emotionalFrequency,
      stressRecovery: args.stressRecovery,
      typicalMood: args.typicalMood,
      emotionalAwareness: args.emotionalAwareness,
      goodDayDescription: args.goodDayDescription,
      decisionStyle: args.decisionStyle,
      overthinking: args.overthinking,
      reactionToSetback: args.reactionToSetback,
      motivationType: args.motivationType,
      focusTrigger: args.focusTrigger,
      successDefinition: args.successDefinition,
      consistency: args.consistency,
      reflectionFrequency: args.reflectionFrequency,
      resetStrategy: args.resetStrategy,
      socialLevel: args.socialLevel,
      rechargeMethod: args.rechargeMethod,
      selfUnderstanding: args.selfUnderstanding,
      selfImprovementFocus: args.selfImprovementFocus,
      createdAt: now,
    });
    return id;
  },
});

export const computePrimaryBaseline = mutation({
  args: {},
  returns: v.object({
    baselineId: v.id("baselines"),
    baseline_index: v.number(),
    confidence: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the latest baseline answers for this user
    const allAnswers = await ctx.db
      .query("baseline_answers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(1);

    if (allAnswers.length === 0) {
      throw new Error("No baseline answers found for user.");
    }

    const userAnswers = allAnswers[0];

    // Calculate all dimension scores
    const emotional_stability = Math.round(
      0.55 * mapEmotionalFrequency(userAnswers.emotionalFrequency) +
      0.30 * mapStressRecovery(userAnswers.stressRecovery) +
      0.15 * mapTypicalMood(userAnswers.typicalMood)
    );

    const awareBase = mapEmotionalAwareness(userAnswers.emotionalAwareness);
    const awareBonus = ((userAnswers.goodDayDescription || "").length > 120) ? 5 : 0;
    const emotional_awareness = Math.min(100, awareBase + awareBonus);

    const cognitive_rationality = mapDecisionStyle(userAnswers.decisionStyle);
    const rumination_risk = mapOverthinking(userAnswers.overthinking);
    const resilience = mapSetbackReaction(userAnswers.reactionToSetback);
    const routine_consistency = mapRoutineConsistency(userAnswers.consistency);
    const reflection_habit = mapReflectionFrequency(userAnswers.reflectionFrequency);
    const reset_skill = estimateResetSkill(userAnswers.resetStrategy);
    const social_pref = mapSocialPref(userAnswers.socialLevel);
    const self_understanding = mapSelfUnderstanding(userAnswers.selfUnderstanding);
    const motivation_vector = motivationVector(userAnswers.motivationType);

    const baseline_index = compositeIndex({
      emotional_stability,
      emotional_awareness,
      cognitive_rationality,
      rumination_risk,
      resilience,
      routine_consistency,
      reflection_habit,
      self_understanding,
    });

    const confidence = confidenceScore(userAnswers as any, {
      emotional_stability,
      emotional_awareness,
      cognitive_rationality,
      rumination_risk,
      resilience,
      routine_consistency,
      reflection_habit,
      reset_skill,
      social_pref,
      self_understanding,
    });

    // Check if baseline version 1 already exists
    const existingBaseline = await ctx.db
      .query("baselines")
      .withIndex("by_userId_and_version", (q) => 
        q.eq("userId", userId).eq("version", 1)
      )
      .unique();

    let baselineId;
    if (existingBaseline) {
      // Update existing baseline
      await ctx.db.patch(existingBaseline._id, {
        scores: {
          emotional_stability,
          emotional_awareness,
          cognitive_rationality,
          rumination_risk,
          resilience,
          routine_consistency,
          reflection_habit,
          reset_skill,
          social_pref,
          self_understanding,
          motivation_vector,
          baseline_index,
          confidence,
        },
        notes: "Primary baseline from self-analysis form (updated).",
        createdAt: Date.now(),
      });
      baselineId = existingBaseline._id;
    } else {
      // Create new baseline
      baselineId = await ctx.db.insert("baselines", {
        userId,
        version: 1,
        scores: {
          emotional_stability,
          emotional_awareness,
          cognitive_rationality,
          rumination_risk,
          resilience,
          routine_consistency,
          reflection_habit,
          reset_skill,
          social_pref,
          self_understanding,
          motivation_vector,
          baseline_index,
          confidence,
        },
        notes: "Primary baseline from self-analysis form.",
        createdAt: Date.now(),
      });
    }

    return { baselineId, baseline_index, confidence };
  },
});

/**
 * Internal: Get latest baseline for a user (for actions)
 */
export const getLatestBaseline = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("baselines"),
      _creationTime: v.number(),
      userId: v.id("users"),
      version: v.number(),
      scores: v.object({
        emotional_stability: v.number(),
        emotional_awareness: v.number(),
        cognitive_rationality: v.number(),
        rumination_risk: v.number(),
        resilience: v.number(),
        routine_consistency: v.number(),
        reflection_habit: v.number(),
        reset_skill: v.number(),
        social_pref: v.number(),
        self_understanding: v.number(),
        motivation_vector: v.object({
          achievement: v.number(),
          growth: v.number(),
          curiosity: v.number(),
          recognition: v.optional(v.number()),
          security: v.optional(v.number()),
        }),
        baseline_index: v.number(),
        confidence: v.number(),
      }),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Get the latest baseline for this user (highest version number)
    const baseline = await ctx.db
      .query("baselines")
      .withIndex("by_userId_and_version", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    return baseline;
  },
});

export const getBaseline = query({
  args: { version: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("baselines"),
      userId: v.id("users"),
      version: v.number(),
      scores: v.object({
        emotional_stability: v.number(),
        emotional_awareness: v.number(),
        cognitive_rationality: v.number(),
        rumination_risk: v.number(),
        resilience: v.number(),
        routine_consistency: v.number(),
        reflection_habit: v.number(),
        reset_skill: v.number(),
        social_pref: v.number(),
        self_understanding: v.number(),
        motivation_vector: v.object({
          achievement: v.number(),
          growth: v.number(),
          curiosity: v.number(),
          recognition: v.optional(v.number()),
          security: v.optional(v.number()),
        }),
        baseline_index: v.number(),
        confidence: v.number(),
      }),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the baseline for this user and version
    const baseline = await ctx.db
      .query("baselines")
      .withIndex("by_userId_and_version", (q) => 
        q.eq("userId", userId).eq("version", args.version)
      )
      .unique();

    return baseline;
  },
});

export const getAllBaselines = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("baselines"),
      userId: v.id("users"),
      version: v.number(),
      scores: v.object({
        emotional_stability: v.number(),
        emotional_awareness: v.number(),
        cognitive_rationality: v.number(),
        rumination_risk: v.number(),
        resilience: v.number(),
        routine_consistency: v.number(),
        reflection_habit: v.number(),
        reset_skill: v.number(),
        social_pref: v.number(),
        self_understanding: v.number(),
        motivation_vector: v.object({
          achievement: v.number(),
          growth: v.number(),
          curiosity: v.number(),
          recognition: v.optional(v.number()),
          security: v.optional(v.number()),
        }),
        baseline_index: v.number(),
        confidence: v.number(),
      }),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      _creationTime: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all baselines for this user, sorted by version
    const baselines = await ctx.db
      .query("baselines")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    return baselines.sort((a, b) => a.version - b.version);
  },
});

/**
 * Get the latest baseline answers for the current user
 */
export const getLatestBaselineAnswers = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("baseline_answers"),
      _creationTime: v.number(),
      userId: v.id("users"),
      emotionalFrequency: v.optional(v.string()),
      stressRecovery: v.optional(v.string()),
      typicalMood: v.optional(v.string()),
      emotionalAwareness: v.optional(v.string()),
      goodDayDescription: v.optional(v.string()),
      decisionStyle: v.optional(v.string()),
      overthinking: v.optional(v.string()),
      reactionToSetback: v.optional(v.string()),
      motivationType: v.optional(v.string()),
      focusTrigger: v.optional(v.string()),
      successDefinition: v.optional(v.string()),
      consistency: v.optional(v.string()),
      reflectionFrequency: v.optional(v.string()),
      resetStrategy: v.optional(v.string()),
      socialLevel: v.optional(v.string()),
      rechargeMethod: v.optional(v.string()),
      selfUnderstanding: v.optional(v.string()),
      selfImprovementFocus: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the most recent baseline answers for this user
    const answers = await ctx.db
      .query("baseline_answers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return answers;
  },
});
