# Deterministic Baseline System

## Overview

The Baseline System is a core feature of Soloist that establishes a user's psychological and behavioral baseline through a comprehensive self-analysis questionnaire. This baseline is computed using **100% deterministic algorithms** with no LLM involvement, ensuring reproducibility, transparency, and the ability to track meaningful changes over time.

## Architecture

### Key Components

1. **Baseline Self-Analysis Form** - Interactive UI component for collecting user responses
2. **Deterministic Scoring Engine** - Pure functions that convert responses into quantified dimensions
3. **Convex Database Schema** - Stores raw answers and computed baselines with versioning
4. **Baseline Computation Functions** - Mutation and query functions for processing and retrieving data

---

## Database Schema

### `baseline_answers`

Stores raw user responses from the self-analysis form.

```typescript
{
  userId: Id<"users">,
  answers: {
    // Emotional Landscape
    emotionalFrequency?: string,
    stressRecovery?: string,
    typicalMood?: string,
    emotionalAwareness?: string,
    goodDayDescription?: string,
    
    // Cognitive Patterns
    decisionStyle?: string,
    overthinking?: string,
    reactionToSetback?: string,
    
    // Motivation & Focus
    motivationType?: string,
    focusTrigger?: string,
    successDefinition?: string,
    
    // Behavioral Rhythms
    consistency?: string,
    reflectionFrequency?: string,
    resetStrategy?: string,
    
    // Social & Self-Perception
    socialLevel?: string,
    rechargeMethod?: string,
    selfUnderstanding?: string,
    selfImprovementFocus?: string,
  },
  createdAt: number
}
```

**Indexes:**
- `by_userId` - Fast lookup of user's answers
- `by_userId_and_createdAt` - Ordered retrieval for history

### `baselines`

Stores computed baseline scores with version tracking.

```typescript
{
  userId: Id<"users">,
  version: number, // 1 = primary baseline, 2 = secondary 4-day, etc.
  scores: {
    // Individual Dimensions (0-100 scale)
    emotional_stability: number,
    emotional_awareness: number,
    cognitive_rationality: number,
    rumination_risk: number, // Higher = worse
    resilience: number,
    routine_consistency: number,
    reflection_habit: number,
    reset_skill: number,
    social_pref: number,
    self_understanding: number,
    
    // Motivation Profile
    motivation_vector: {
      achievement: number,
      growth: number,
      curiosity: number,
      recognition?: number,
      security?: number,
    },
    
    // Composite Metrics
    baseline_index: number, // Overall score (0-100)
    confidence: number, // Reliability score (0-100)
  },
  notes?: string,
  createdAt: number
}
```

**Indexes:**
- `by_userId_and_version` - Efficient version lookup
- `by_userId` - All baselines for a user

---

## Scoring Dimensions

All dimensions are scored on a **0-100 scale**, where higher is generally better (except `rumination_risk`).

### 1. Emotional Stability (0-100)
**Formula:** `0.55 × emotionalFrequency + 0.30 × stressRecovery + 0.15 × typicalMood`

**Mappings:**
- **emotionalFrequency:**
  - "rarely" → 85
  - "sometimes" → 70
  - "often" → 55
  - "constantly" → 40
  - default → 60

- **stressRecovery:**
  - Contains "minute" → 90
  - Contains "hour" → 80
  - Contains "day" (not "several") → 65
  - Contains "several" → 55
  - default → 70

- **typicalMood:**
  - "optimistic" → 85
  - "neutral" → 70
  - "cautious" → 60
  - "varies" → 55
  - default → 65

### 2. Emotional Awareness (0-100)
**Formula:** `mapEmotionalAwareness + bonus`

**Mappings:**
- "very easy" → 90
- "fairly easy" → 75
- "unsure" → 50
- "difficult" / "very difficult" → 35
- default → 65

**Bonus:** +5 if `goodDayDescription` > 120 characters (capped at 100)

### 3. Cognitive Rationality (0-100)
**Mappings:**
- "logic" → 85
- "balanced" → 70
- "instinct" → 55
- default → 68

### 4. Rumination Risk (0-100) ⚠️
*Note: Higher score = more overthinking (worse)*

**Mappings:**
- "never" → 20
- "rarely" → 25
- "sometimes" → 45
- "often" / "frequently" → 70
- "constantly" → 85
- default → 50

### 5. Resilience (0-100)
**Mappings:**
- Contains "analyze" → 85
- Contains "move on" → 80
- Contains "discouraged" → 45
- Contains "blame" → 35
- default → 65

### 6. Routine Consistency (0-100)
**Mappings:**
- "very consistent" / "consistent" → 85
- "somewhat" → 65
- "unpredictable" → 45
- default → 60

### 7. Reflection Habit (0-100)
**Mappings:**
- "daily" → 90
- "weekly" → 70
- "occasionally" → 55
- "rarely" → 40
- default → 60

### 8. Reset Skill (0-100)
**Algorithm:** Tokenizes `resetStrategy` by commas, slashes, "and", "or", and whitespace. Counts unique tokens.

**Mappings:**
- 6+ unique strategies → 90
- 4-5 strategies → 80
- 2-3 strategies → 70
- 1 strategy → 55
- 0 strategies → 55

### 9. Social Preference (0-100)
*Neutral dimension - not value-laden*

**Mappings:**
- "minimal" → 50
- "moderate" → 65
- "frequent" / "very frequent" → 60
- default → 60

### 10. Self Understanding (0-100)
**Mappings:**
- "very well" / "very" → 85
- "fairly well" / "fairly" → 70
- "somewhat" → 60
- "unsure" → 50
- default → 65

### 11. Motivation Vector
**Returns:** Object with normalized weights (0 or 1 for primary choice)

**Mappings:**
- "achievement" → `{ achievement: 1, growth: 0, curiosity: 0 }`
- "growth" → `{ achievement: 0, growth: 1, curiosity: 0 }`
- "curiosity" → `{ achievement: 0, growth: 0, curiosity: 1 }`
- "recognition" → `{ achievement: 0, growth: 0, curiosity: 0, recognition: 1 }`
- "security" → `{ achievement: 0, growth: 0, curiosity: 0, security: 1 }`
- "impact" → `{ achievement: 0, growth: 0, curiosity: 0, recognition: 0.5 }`
- default → Growth profile

---

## Composite Metrics

### Baseline Index (0-100)
**Overall psychological wellness and self-awareness score**

**Formula:**
```
weighted = (
  1.2 × emotional_stability +
  1.0 × emotional_awareness +
  0.8 × cognitive_rationality +
  1.0 × (100 - rumination_risk) +
  1.0 × resilience +
  1.0 × routine_consistency +
  1.0 × reflection_habit +
  0.8 × self_understanding
)

maxWeighted = (
  1.2×100 + 1.0×100 + 0.8×100 + 1.0×100 + 
  1.0×100 + 1.0×100 + 1.0×100 + 0.8×100
)

baseline_index = round((weighted / maxWeighted) × 100)
```

**Weight Rationale:**
- **1.2x** emotional_stability - Most predictive of overall wellbeing
- **1.0x** core dimensions - Standard importance
- **0.8x** cognitive/meta dimensions - Supportive but secondary

### Confidence Score (0-100)
**Reliability of the baseline measurement**

**Components:**

1. **Coverage (up to 70 points):**
   ```
   (answeredFields / 18) × 70
   ```

2. **Text Richness (up to 20 points):**
   - +10 points for each of these fields > 120 chars (max 2):
     - `goodDayDescription`
     - `successDefinition`
     - `selfImprovementFocus`

3. **Consistency Penalty (-5 points):**
   - If `consistency` includes "consistent" AND `reflectionFrequency` includes "rarely"
   - Flags potential response inconsistency

**Range:** 30-100 (minimum floor of 30 even for incomplete responses)

---

## Convex Functions API

### `saveBaselineAnswers`

**Type:** Mutation

**Purpose:** Saves raw form responses to `baseline_answers` table

**Args:**
```typescript
{
  answers: {
    emotionalFrequency?: string,
    stressRecovery?: string,
    // ... all 18 fields
  }
}
```

**Returns:** `Id<"baseline_answers">`

**Authentication:** Required (uses `ctx.auth.getUserIdentity()`)

**Example:**
```typescript
const answerId = await saveBaselineAnswers({
  answers: {
    emotionalFrequency: "sometimes",
    stressRecovery: "a few hours",
    decisionStyle: "balanced",
    // ... more fields
  }
});
```

---

### `computePrimaryBaseline`

**Type:** Mutation

**Purpose:** Computes deterministic baseline scores from latest answers (version 1)

**Args:** None (uses authenticated user)

**Returns:**
```typescript
{
  baselineId: Id<"baselines">,
  baseline_index: number,
  confidence: number
}
```

**Behavior:**
- Fetches latest `baseline_answers` for user
- Computes all 10 dimensions + motivation vector
- Calculates composite baseline_index and confidence
- Creates new baseline (version 1) OR updates existing
- All computations are deterministic (no randomness or LLM calls)

**Error Cases:**
- Throws if not authenticated
- Throws if user not found
- Throws if no baseline answers exist

**Example:**
```typescript
const result = await computePrimaryBaseline();
console.log(`Baseline Index: ${result.baseline_index}`);
console.log(`Confidence: ${result.confidence}%`);
```

---

### `getBaseline`

**Type:** Query

**Purpose:** Retrieves computed baseline by version number

**Args:**
```typescript
{ version: number } // 1 = primary, 2 = secondary, etc.
```

**Returns:** `Baseline | null`

**Example:**
```typescript
const primaryBaseline = useQuery(api.baseline.getBaseline, { version: 1 });
const secondaryBaseline = useQuery(api.baseline.getBaseline, { version: 2 });
```

---

### `getAllBaselines`

**Type:** Query

**Purpose:** Retrieves all baselines for authenticated user, sorted by version

**Args:** None

**Returns:** `Baseline[]`

**Use Case:** Comparing primary baseline vs secondary baseline (4-day observed data)

**Example:**
```typescript
const allBaselines = useQuery(api.baseline.getAllBaselines);
// [{ version: 1, ... }, { version: 2, ... }]
```

---

## Frontend Integration

### Form Component
**Path:** `/renderer/app/dashboard/waypoints/_components/BaselineSelfAnalysisForm.tsx`

**Features:**
- 18 form fields organized into 5 categories
- Radio buttons for categorical responses
- Text inputs and textareas for open-ended responses
- Auto-loads existing `baselineAnalysis` data (legacy table)
- Submit triggers both save and compute operations
- Displays computed Baseline Index and Confidence score
- Button adapts: "Compute Baseline" → "Recompute Baseline"

**User Flow:**
1. User fills out form (can save partially and return later)
2. Clicks "Compute Baseline"
3. Form saves answers → computes deterministic baseline
4. Displays: `Baseline Index: 73 • Confidence: 85%`
5. User can recompute after updating answers

**Example Usage:**
```tsx
import { BaselineSelfAnalysisForm } from "./_components/BaselineSelfAnalysisForm";

export default function WaypointsPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <BaselineSelfAnalysisForm />
        </div>
      </div>
    </div>
  );
}
```

---

## Why This Design?

### 1. **100% Deterministic**
- No LLM variance
- Same answers → same scores, always
- Reproducible for scientific validity

### 2. **Transparent & Auditable**
- Every score can be explained
- Users can understand why they scored X
- Clear mapping tables for all dimensions

### 3. **Versionable**
- Version 1 = Initial self-analysis baseline
- Version 2 = Secondary baseline from 4 days of observed behavior
- Future versions = Long-term tracking

### 4. **Scientifically Valid**
- Weighted dimensions based on psychological research
- Composite index balances multiple factors
- Confidence score flags unreliable measurements

### 5. **Privacy-First**
- All computation happens server-side (Convex)
- No data sent to external LLM APIs for baseline
- User controls their data

---

## Future Enhancements

### Secondary Baseline (Version 2)
After 4 days of logging, compute a **behavioral baseline** from observed data:
- Average daily emotion scores
- Actual reflection frequency (not self-reported)
- Observed stress patterns
- Compare version 1 vs version 2 for insight validation

### Baseline Drift Detection
Track changes in baseline over months/years:
```typescript
const drift = version3.baseline_index - version1.baseline_index;
if (drift > 15) {
  // Significant positive change detected!
}
```

### Personalized Recommendations
Use baseline dimensions to customize features:
- High `rumination_risk` → More mindfulness prompts
- Low `reflection_habit` → Encourage journaling
- High `achievement` motivation → Goal-tracking emphasis

### Comparative Analytics
```typescript
const avgEmotionalStability = 68; // Platform average
const userScore = baseline.scores.emotional_stability;
const percentile = calculatePercentile(userScore, avgEmotionalStability);
```

---

## Code Reference

### Key Files

**Schema:**
- `/convex/schema.ts` - `baseline_answers` and `baselines` tables

**Backend Logic:**
- `/convex/baseline.ts` - All scoring functions and Convex mutations/queries

**Frontend:**
- `/renderer/app/dashboard/waypoints/_components/BaselineSelfAnalysisForm.tsx` - Form UI
- `/renderer/app/dashboard/waypoints/page.tsx` - Page wrapper

**Routing:**
- `/renderer/app/dashboard/_components/sidebar.tsx` - Waypoints navigation
- `/renderer/store/sidebarStore.ts` - View state management

---

## Testing Baseline Computation

### Manual Test Cases

**Case 1: High-Functioning User**
```typescript
{
  emotionalFrequency: "rarely",
  stressRecovery: "a few hours",
  typicalMood: "optimistic",
  emotionalAwareness: "very easy",
  decisionStyle: "balanced",
  overthinking: "rarely",
  reactionToSetback: "analyze what went wrong",
  consistency: "very consistent",
  reflectionFrequency: "daily",
  resetStrategy: "meditation, exercise, journaling, nature walks",
  selfUnderstanding: "very well",
  // ... more fields
}
// Expected: baseline_index ~75-85, confidence ~85-95
```

**Case 2: Struggling User**
```typescript
{
  emotionalFrequency: "constantly",
  stressRecovery: "several days",
  typicalMood: "varies",
  emotionalAwareness: "difficult",
  decisionStyle: "instinct",
  overthinking: "constantly",
  reactionToSetback: "blame myself",
  consistency: "unpredictable",
  reflectionFrequency: "rarely",
  resetStrategy: "sleep",
  selfUnderstanding: "unsure",
  // ... more fields
}
// Expected: baseline_index ~35-50, confidence ~50-70
```

**Case 3: Incomplete Answers**
```typescript
{
  emotionalFrequency: "sometimes",
  stressRecovery: "a day",
  // Only 2 fields answered
}
// Expected: Lower confidence (~30-40), baseline_index uses defaults
```

---

## Troubleshooting

### Issue: Baseline not computing
**Check:**
1. User is authenticated (`ctx.auth.getUserIdentity()` not null)
2. User exists in `users` table
3. `baseline_answers` record exists for user
4. No errors in Convex dashboard logs

### Issue: Confidence score too low
**Causes:**
- User answered < 50% of fields
- No text fields with substantial content
- Internal consistency penalty triggered

**Solution:** Encourage more complete responses

### Issue: Baseline index seems off
**Debug:**
1. Check raw scores in Convex dashboard
2. Verify mapping functions match expected values
3. Review composite index calculation weights
4. Compare against test cases above

---

## Contributing

When modifying the baseline system:

1. **Update this documentation** with any scoring changes
2. **Maintain determinism** - no random or LLM-based scoring
3. **Add test cases** for new dimensions or mappings
4. **Version appropriately** - breaking changes = new version number
5. **Preserve auditability** - keep clear mapping tables

---

## References

- **Convex Docs:** https://docs.convex.dev
- **React Hook Form:** https://react-hook-form.com
- **Psychological Dimensions:** Based on Big Five, emotional intelligence research
- **Scoring Rationale:** Weights derived from wellbeing prediction literature

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0  
**Authors:** Soloist Team
