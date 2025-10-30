# Demo Services

This folder contains browser-based services that replace Convex backend functions in demo mode.

## Overview

The demo app runs entirely in the browser with no backend required. These services provide the same functionality as the production Convex functions, but work locally with no persistence beyond the browser session.

## Services

### `generateLog.ts`

Generates realistic daily log entries for demonstration purposes.

**Key Features:**
- Fully client-side (no API calls)
- Generates correlated data (e.g., poor sleep → lower mood)
- Realistic variation based on day of week and date
- Different patterns for weekends vs. weekdays
- Monday blues, Friday energy, etc.

**Usage:**
```typescript
import { generateDailyLog, validateGeneratedData } from '@/services/generateLog';

// Generate data for a specific date
const data = await generateDailyLog('2025-10-29');

// Validate against template fields
const validated = validateGeneratedData(data, templateFields);
```

**Data Generated:**
- `overallMood`: 1-10 (correlated with other factors)
- `workSatisfaction`: 1-10 (lower on weekends)
- `personalLifeSatisfaction`: 1-10 (higher on weekends)
- `balanceRating`: 1-10 (average of work/personal)
- `sleep`: 4-10 hours (affects mood)
- `exercise`: boolean (more likely on weekends)
- `highlights`: Contextual positive note
- `challenges`: Realistic difficulties (or "none" on good days)
- `tomorrowGoal`: Day-appropriate goal

**Generation Logic:**
- Uses date patterns for realistic variation
- Weekends have different patterns than weekdays
- Monday = lower motivation, harder to focus
- Friday = wrap-up energy, looking forward to weekend
- Sleep quality affects all other metrics
- Exercise correlates with higher mood
- All metrics stay within realistic ranges

## Data Persistence

**Important:** All generated data is ephemeral and exists only during the current browser session. When the user refreshes the page:
- Generated logs are cleared
- Form resets to defaults
- No data is saved to localStorage
- Calendar shows only pre-seeded demo data

This is intentional for the demo environment to keep each session fresh and independent.

## Comparison with Production

| Feature | Production (Convex) | Demo (Browser Service) |
|---------|-------------------|----------------------|
| Backend | Convex actions | Browser functions |
| AI Model | Claude API | Algorithmic generation |
| Persistence | Database | Session only |
| Cost | API calls | Free |
| Realism | Very high | High |
| Speed | ~2-3 seconds | ~0.8 seconds |
| Customization | User instructions | Date-based patterns |

## Future Services

Additional services to be added:
- `scoreLog.ts` - Client-side scoring algorithm
- `generateFeed.ts` - Feed entry generation
- `generateForecast.ts` - Simple forecasting logic

## Development Notes

When adding new services:
1. Keep logic simple and fast (no external API calls)
2. Make data realistic but predictable
3. Include TypeScript interfaces for type safety
4. Add validation helpers for form integration
5. Document the generation algorithm
6. Consider date-based variation for realism
