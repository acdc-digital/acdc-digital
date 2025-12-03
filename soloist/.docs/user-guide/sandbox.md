# Sandbox / Testing Page - Data Flow Documentation

> Technical documentation for the Soloist Testing Sandbox feature (Forecast Accuracy Testing Environment)

---

## Overview

The Sandbox page (`/dashboard/testing`) provides a forecast accuracy testing environment where users can:
- Select historical date ranges to analyze past forecast performance
- Compare actual logged emotions vs AI predictions
- Generate AI consultations for selected days
- View dynamic weekly insights
- Submit feedback on forecast accuracy

This differs from the main Weekly Forecast page by allowing **retrospective analysis** of historical periods.

---

## API Functions Used (from Convex)

### Queries

| Function | Component | Description |
|----------|-----------|-------------|
| `auth.getUserId` | useConvexUser | Get authenticated user ID |
| `testing.getTestSevenDayForecast` | TestingPage | Main data fetcher - returns 7-day structure with historical forecasts |
| `dailyLogs.getLogsByDateRange` | TestingPage, Consult | Get historical logs for selected date range |
| `forecast.getForecastFeedback` | TestingPage | Get thumbs up/down feedback for forecast dates |

### Mutations

| Function | Component | Description |
|----------|-----------|-------------|
| `forecast.submitForecastFeedback` | TestingPage | Submit thumbs up/down feedback on forecast accuracy |

### Actions

| Function | Component | Description |
|----------|-----------|-------------|
| `forecast.generateForecast` | TestingPage | Generate AI forecast for selected date range |
| `generator.generateDailyConsultation` | Consult | Generate AI consultation for a selected day |
| `generator.generateWeeklyInsights` | Insights | Generate AI weekly insights based on 7-day data |

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TestingPage (page.tsx)                       │
│                    Main orchestrator component                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Navigation    │  │    Consult      │  │    Insights     │ │
│  │  navCalendar    │  │ AI consultation │  │  AI insights    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    WeeklyPatterns                           ││
│  │              Line chart visualization                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Component | File Path | Purpose |
|-----------|-----------|---------|
| TestingPage | `_components/../page.tsx` | Main page orchestrator |
| Navigation | `_components/Navigation.tsx` | Date range selector with calendar |
| NavCalendar | `_components/navCalendar.tsx` | Calendar popup component |
| Consult | `_components/Consult.tsx` | AI daily consultation display |
| Insights | `_components/Insights.tsx` | AI weekly insights display |
| WeeklyPatterns | `_components/WeeklyPatterns.tsx` | Chart visualization |

---

## Data Sources & Processing

### 1. Main Query: `getTestSevenDayForecast`

The primary data fetcher that returns a structured 7-day view.

**Input Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | User's Convex ID |
| `startDate` | string | Start of 4-day historical range (YYYY-MM-DD) |
| `endDate` | string | End of 4-day historical range (YYYY-MM-DD) |

**Output Structure:**

```typescript
{
  sevenDayData: ForecastDay[];      // 7-day array (4 past + 3 future)
  historicalForecasts: {            // Past forecasts for chart overlay
    date: string;
    emotionScore: number | null;
  }[];
}
```

**Data Construction Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│              getTestSevenDayForecast Query                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Fetch logs in date range                               │
│     └── Query "logs" table with userId + date filters           │
│                                                                 │
│  Step 2: Fetch historical forecasts for past period             │
│     └── Query "forecast" table for dates in selected range      │
│         (forecasts that were made BEFORE these dates)           │
│                                                                 │
│  Step 3: Build 4 past days                                      │
│     └── Map dates → scores from logs                            │
│     └── Include answers for Consult component                   │
│                                                                 │
│  Step 4: Build 3 future forecast days                           │
│     └── Query "forecast" table for each future date             │
│     └── Return placeholder if no forecast exists                │
│                                                                 │
│  Step 5: Prepare historicalForecasts array for chart            │
│     └── Maps past dates to their historical forecast scores     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Navigation Component

Handles date range selection with automatic 4-day range calculation.

**Key Features:**

| Feature | Description |
|---------|-------------|
| Date Selection | User selects a start date; end date is auto-calculated (+3 days) |
| Range Display | Shows historical (4 days) and forecast (3 days) periods |
| Generate Button | Triggers `forecast.generateForecast` action |
| State Persistence | Uses localStorage to track generated forecasts per range |

**Range Calculation:**

```
User selects: April 10
                  │
                  ▼
Historical Range: April 10 → April 13 (4 days)
                  │
                  ▼
Forecast Range:   April 14 → April 16 (3 days)
```

---

### 3. Consult Component (AI Daily Consultation)

Generates AI-powered insights for a selected day using the full 7-day context.

**Data Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Consult Component                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Input: selectedDay + sevenDayData                              │
│     │                                                           │
│     ▼                                                           │
│  Check Cache (Zustand store: dailyDetailsCache)                 │
│     │                                                           │
│     ├── HIT: Display cached consultation                        │
│     │                                                           │
│     └── MISS: Call generateDailyConsultation action             │
│              │                                                  │
│              ▼                                                  │
│         Format 7-day context for AI                             │
│              │                                                  │
│              ▼                                                  │
│         Claude API (DAILY_CONSULTATION_PROMPT)                  │
│              │                                                  │
│              ▼                                                  │
│         Store result in cache + display                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**AI Action Parameters:**

| Parameter | Description |
|-----------|-------------|
| `selectedDayData` | Date, dayName, emotionScore, notes, isFuture flag |
| `sevenDayContextData` | Array of all 7 days with scores and notes |

**Special Handling:**

| Scenario | Behavior |
|----------|----------|
| Future day selected | Uses forecast description/details as context |
| Past day without logs | Shows "No logs found" error message |
| Past day with logs | Formats answers into readable context string |

---

### 4. Insights Component (AI Weekly Insights)

Generates dynamic insights based on the full 7-day period.

**Data Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Insights Component                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Input: sevenDayData + selectedDateRange                        │
│     │                                                           │
│     ▼                                                           │
│  Generate cache key from date range                             │
│     │                                                           │
│     ▼                                                           │
│  Check Cache (Zustand store: weeklyInsightsCache)               │
│     │                                                           │
│     ├── HIT: Display cached insights                            │
│     │                                                           │
│     └── MISS: Call generateWeeklyInsights action                │
│              │                                                  │
│              ▼                                                  │
│         Format 7-day context for AI                             │
│              │                                                  │
│              ▼                                                  │
│         Claude API (WEEKLY_INSIGHTS_PROMPT)                     │
│              │                                                  │
│              ▼                                                  │
│         Parse JSON response → insights array                    │
│              │                                                  │
│              ▼                                                  │
│         Store in cache + display                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**AI Response Format:**

```json
{
  "insights": [
    "Your emotional state peaked on Wednesday with a score of 78",
    "Thursday showed a significant dip - consider additional self-care",
    "Weekend forecasts suggest improving mood trajectory",
    "Recovery pattern is strong with quick rebounds after challenging days"
  ]
}
```

---

### 5. WeeklyPatterns Chart

Visualizes the 7-day data with multiple data series.

**Chart Data Series:**

| Line | Color | Style | Data Source |
|------|-------|-------|-------------|
| Actual | Indigo (#6366f1) | Solid | Past days (from logs) |
| Forecast | Amber (#f59e0b) | Dashed | Future days (from forecasts) |
| Historical Forecast | Purple | Dotted | Past forecasts for comparison |

**Props Interface:**

```typescript
interface WeeklyPatternsProps {
  data: ForecastDay[];                    // 7-day main data
  historicalForecastData?: {              // Optional overlay data
    date: string;
    emotionScore: number | null;
  }[];
}
```

---

### 6. Feedback System

Allows users to rate forecast accuracy with thumbs up/down.

**Data Flow:**

```
User clicks thumbs up/down
        │
        ▼
submitForecastFeedback mutation
        │
        ▼
Upsert to "forecastFeedback" table
        │
        ▼
Update local feedbackState
        │
        ▼
UI reflects selection (green/red icon)
```

**Storage Schema:**

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id<"users"> | User who submitted feedback |
| `forecastDate` | string | Date of the forecast (YYYY-MM-DD) |
| `feedback` | "up" \| "down" | User's accuracy rating |
| `createdAt` | number | Timestamp of creation |
| `updatedAt` | number | Timestamp of last update |

---

## State Management (Zustand Store)

The Testing page uses a dedicated Zustand store (`Testingstore.ts`) for state management.

**Store Structure:**

| State | Type | Purpose |
|-------|------|---------|
| `selectedDateRange` | `{ start: Date \| null, end: Date \| null }` | Selected historical period |
| `isGeneratingForecast` | boolean | Loading state for forecast generation |
| `forecastGenerated` | boolean | Whether forecast exists for current range |
| `dailyDetailsCache` | `{ [date: string]: string }` | Cache for AI consultations |
| `weeklyInsightsCache` | `{ [rangeKey: string]: string[] }` | Cache for AI insights |

**Actions:**

| Action | Purpose |
|--------|---------|
| `setSelectedDateRange` | Update date range selection |
| `setIsGeneratingForecast` | Toggle loading state |
| `setForecastGenerated` | Mark forecast as generated |
| `setDailyDetail` | Cache a daily consultation |
| `setWeeklyInsights` | Cache weekly insights |
| `clearDailyDetailsCache` | Clear consultation cache |
| `clearWeeklyInsightsCache` | Clear insights cache |
| `resetState` | Reset all state to defaults |

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Select Date Range    2. Generate Forecast    3. Select Day  │
└──────────┬───────────────────────┬───────────────────┬──────────┘
           │                       │                   │
           ▼                       ▼                   ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Navigation    │    │ generateForecast│    │  Consult/       │
│   Component     │    │    Action       │    │  Insights       │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONVEX DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐  ┌─────────────┐  ┌──────────────────┐            │
│  │  logs   │  │  forecast   │  │ forecastFeedback │            │
│  │ (past)  │  │  (future)   │  │   (ratings)      │            │
│  └────┬────┘  └──────┬──────┘  └────────┬─────────┘            │
│       │              │                   │                      │
│       └──────────────┴───────────────────┘                      │
│                      │                                          │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │ getTestSevenDayForecast │
         │        Query            │
         └───────────┬─────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │         sevenDayData               │
    │  + historicalForecasts             │
    └────────────────┬───────────────────┘
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
┌─────────┐   ┌───────────┐   ┌───────────┐
│ 7-Day   │   │ Selected  │   │  Weekly   │
│  Grid   │   │ Day Panel │   │  Chart    │
└─────────┘   └───────────┘   └───────────┘
```

---

## Key Differences from Weekly Forecast Page

| Feature | Weekly Page | Sandbox/Testing Page |
|---------|-------------|---------------------|
| Date Selection | Fixed (today-centered) | User-selectable historical range |
| Purpose | Current forecast view | Retrospective accuracy analysis |
| Historical Forecasts | Not shown | Overlaid on chart for comparison |
| Insights | Mock data | Dynamic AI-generated |
| Consultation | Not available | Full AI consultation per day |
| Feedback | Limited | Full thumbs up/down system |
| Caching | Basic | Zustand store with range-based keys |

---

## AI Integration Summary

| Feature | Action | Prompt | Model Config |
|---------|--------|--------|--------------|
| Forecast Generation | `generateForecastWithAI` | `FORECASTING_PROMPT` | `AI_CONFIG.FORECASTING` |
| Daily Consultation | `generateDailyConsultation` | `DAILY_CONSULTATION_PROMPT` | `AI_CONFIG.CONSULTATION` |
| Weekly Insights | `generateWeeklyInsights` | `WEEKLY_INSIGHTS_PROMPT` | `AI_CONFIG.INSIGHTS` |

**All AI actions:**
- Use Claude (Anthropic) API
- Track token usage via `anthropic.trackUsage` mutation
- Include fallback handling for API failures

---

## File References

| Component/Function | File Path |
|--------------------|-----------|
| Main Page | `renderer/app/dashboard/testing/page.tsx` |
| Navigation | `renderer/app/dashboard/testing/_components/Navigation.tsx` |
| Calendar | `renderer/app/dashboard/testing/_components/navCalendar.tsx` |
| Consult | `renderer/app/dashboard/testing/_components/Consult.tsx` |
| Insights | `renderer/app/dashboard/testing/_components/Insights.tsx` |
| Weekly Chart | `renderer/app/dashboard/testing/_components/WeeklyPatterns.tsx` |
| Testing Queries | `convex/testing.ts` |
| AI Generator | `convex/generator.ts` |
| Zustand Store | `renderer/store/Testingstore.ts` |

---

## Future Improvements

- [ ] Forecast accuracy metrics dashboard
- [ ] Historical trend analysis across multiple weeks
- [ ] Export functionality for testing data
- [ ] A/B testing different AI prompt configurations
- [ ] Aggregated feedback analytics
