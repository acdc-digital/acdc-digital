# Weekly Forecast Page - Data Flow Documentation

> Technical documentation for the Soloist 7-Day Emotional Forecast feature

---

## Overview

The Weekly Forecast page (`/dashboard/soloist`) provides users with a comprehensive 7-day emotional forecast view, combining historical log data with AI-generated predictions. This document explains the complete data architecture and flow.

---

## API Functions Used (from Convex)

| Function | Type | Purpose |
|----------|------|---------|
| `auth.getUserId` | Query | Get authenticated user ID |
| `forecast.getSevenDayForecast` | Query | Main data fetcher - returns 7-day structure |
| `forecast.generateForecast` | Action | Triggers AI forecast generation |

---

## Data Sources & Processing

### 1. Daily Logs (Past 3 Days + Today)

| Property | Description |
|----------|-------------|
| **Source** | `logs` table in Convex database |
| **Fetched by** | `getSevenDayForecast` internally calls `getLogsForUserInRange` |
| **Raw Fields** | `date`, `score` (emotionScore), `answers` (user's daily log data) |

**Processing Pipeline:**

The query transforms raw logs into a display format with computed fields:

| Computed Field | Source Function | Output Example |
|----------------|-----------------|----------------|
| `description` | `getDescriptionFromScore()` | "Good Day", "Challenging Day" |
| `trend` | `calculateTrend()` | "up", "down", "stable" |
| `recommendation` | `generateRecommendation()` | "Continue your current activities..." |

---

### 2. Forecasts (Next 3 Days)

| Property | Description |
|----------|-------------|
| **Source** | `forecast` table in Convex database |
| **Fetched by** | `getSevenDayForecast` queries the `forecast` table directly |
| **Fields** | `emotionScore`, `description`, `trend`, `details`, `recommendation`, `confidence` |

**Fallback Behavior:**

If no forecast exists for a future date:
```
{
  emotionScore: 0,
  description: "Forecast Needed",
  trend: "stable",
  details: "Forecast data will be generated soon.",
  recommendation: "Click 'Generate Forecast' to see prediction.",
  confidence: 0
}
```

---

### 3. Forecast Generation Process

**Trigger:** User clicks "Generate Forecast" button

**Action:** `generateForecast`

```
┌─────────────────────────────────────────────────────────────────┐
│                    Forecast Generation Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Fetch logs for past 4 days                             │
│     │                                                            │
│     ▼                                                            │
│  Step 2: Validate all 4 days have logs                          │
│     │    (returns error if missing)                              │
│     ▼                                                            │
│  Step 3: Call internal.generator.generateForecastWithAI         │
│     │    with pastLogs data                                      │
│     ▼                                                            │
│  Step 4: AI generates predictions for next 3 days               │
│     │                                                            │
│     ▼                                                            │
│  Step 5: Save forecasts to forecast table                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Requirements:**
- User must have logged at least 4 consecutive days
- Forecasts are generated for the next 3 days from today

---

### 4. Detailed Summary & Recommendations

| Day Type | Data Source | Processing |
|----------|-------------|------------|
| **Past Days** | Client-side computation | Helper functions derive from score |
| **Future Days** | Database | AI-generated data stored in `forecast` table |

**Helper Functions for Past Days:**

| Function | Input | Output |
|----------|-------|--------|
| `getDescriptionFromScore(score)` | Numeric score (0-100) | Text description ("Good Day", etc.) |
| `generateRecommendation(log)` | Log object with score | Personalized recommendation string |

**Score-to-Description Mapping:**

| Score Range | Description |
|-------------|-------------|
| 90-100 | Exceptional Day |
| 80-89 | Excellent Day |
| 70-79 | Very Good Day |
| 60-69 | Good Day |
| 50-59 | Balanced Day |
| 40-49 | Mild Challenges |
| 30-39 | Challenging Day |
| 20-29 | Difficult Day |
| 10-19 | Very Challenging |
| 0-9 | Extremely Difficult |

---

### 5. Weekly Chart Visualization

| Property | Description |
|----------|-------------|
| **Source** | `processedForecastData` (combined logs + forecasts) |
| **Component** | `WeeklyPatterns.tsx` |
| **Data Format** | Array of `{ date, day, emotionScore, isFuture }` |

**Chart Display:**

| Line | Color | Style | Data |
|------|-------|-------|------|
| Actual | Indigo (#6366f1) | Solid | Past days (from logs) |
| Forecast | Amber (#f59e0b) | Dashed | Future days (from forecasts) |

---

### 6. Key Insights

| Property | Current Status |
|----------|----------------|
| **Implementation** | **MOCK DATA** |
| **Source** | Hardcoded `mockInsights` array |
| **Dynamic Generation** | Not yet implemented |

**Current Mock Insights:**
```javascript
const mockInsights = [
  "Your emotional state tends to peak midweek (Wednesday) and on weekends",
  "Thursday consistently shows lower emotional scores - consider additional self-care",
  "Evening periods generally show higher wellbeing than mornings",
  "Your recovery pattern is strong, with quick rebounds after challenging days"
];
```

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    getSevenDayForecast Query                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   logs table     │         │  forecast table  │             │
│  │  (past 3 + today)│         │  (next 3 days)   │             │
│  └────────┬─────────┘         └────────┬─────────┘             │
│           │                            │                        │
│           ▼                            ▼                        │
│  ┌────────────────────────────────────────────────┐            │
│  │           Transform & Merge                     │            │
│  │  • Add display fields (day, shortDay, etc.)    │            │
│  │  • Calculate trends (from score differences)    │            │
│  │  • Generate descriptions (from score)           │            │
│  │  • Generate recommendations (from score)        │            │
│  └────────────────────────────────────────────────┘            │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           ▼
              ┌────────────────────────┐
              │   7-Day Array Output   │
              │ [{date, emotionScore,  │
              │   description, trend,  │
              │   details, etc.}]      │
              └────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ 7-Day    │      │ Selected │      │ Weekly   │
  │ Grid UI  │      │ Day Panel│      │ Chart    │
  └──────────┘      └──────────┘      └──────────┘
```

---

## Key Architectural Points

| Point | Description |
|-------|-------------|
| **Minimal API Calls** | Only 2 main API calls: `getSevenDayForecast` (query) and `generateForecast` (action) |
| **Client-Side Computation** | Descriptions, trends, and recommendations for past days are computed from scores using helper functions, not fetched from AI |
| **AI Usage** | AI is only invoked when generating future forecasts via `generateForecast` → `generateForecastWithAI` |
| **Mock Insights** | Key Insights section uses hardcoded mock data - not dynamically generated |
| **Presentational Chart** | `WeeklyPatterns` component is purely presentational - it visualizes data passed as props |

---

## File References

| Component/Function | File Path |
|--------------------|-----------|
| Main Page | `renderer/app/dashboard/soloist/page.tsx` |
| Weekly Chart | `renderer/app/dashboard/soloist/_components/WeeklyPatterns.tsx` |
| Forecast Queries/Actions | `convex/forecast.ts` |
| AI Generator | `convex/generator.ts` |

---

## Future Improvements

- [ ] Dynamic key insights generation using AI analysis of user patterns
- [ ] Caching layer for forecast data
- [ ] Forecast accuracy tracking and feedback loop
- [ ] Extended forecast range (7+ days)
