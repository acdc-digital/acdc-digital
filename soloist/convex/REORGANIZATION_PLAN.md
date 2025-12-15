# Convex Function Reorganization Plan

## Overview

This document outlines the complete reorganization of the Soloist Convex API functions from a flat structure to a hierarchical structure that mirrors the application's UI architecture.

## New Directory Structure

```
convex/
├── _generated/                      # Auto-generated (DO NOT MOVE)
├── renderer/                        # Desktop app (Electron) functions
│   ├── base/                        # Baseline psychological profile
│   │   ├── baseline.ts              # Core baseline scoring/computation
│   │   ├── baselineChat.ts          # Chat history & messages
│   │   └── baselineChatActions.ts   # AI chat generation
│   │
│   ├── canvas/                      # Tldraw whiteboard (PLACEHOLDER)
│   │   └── .gitkeep                 # Reserved for future canvas persistence
│   │
│   ├── heatmap/                     # Daily logging & calendar
│   │   ├── dailyLogs.ts             # Log CRUD operations
│   │   ├── dailyLogTemplates.ts     # Template management
│   │   ├── feed.ts                  # AI feed summaries
│   │   ├── longForm.ts              # Journal entries
│   │   ├── score.ts                 # AI scoring
│   │   ├── templates.ts             # Custom question templates
│   │   └── randomizer.ts            # Random log generation
│   │
│   └── soloist/                     # AI forecasting & insights
│       ├── forecast.ts              # Forecast queries & generation
│       ├── generator.ts             # Core AI forecast/consultation
│       └── historicalForecast.ts    # Retrospective analysis
│
├── website/                         # Marketing website functions
│   ├── admin/                       # Admin-only functions
│   │   ├── admin.ts                 # Role management
│   │   └── anthropic.ts             # AI usage tracking/analytics
│   │
│   └── public/                      # Public-facing functions
│       ├── newsletter.ts            # Newsletter signup
│       ├── learnMore.ts             # Email capture
│       └── waitlist.ts              # Feature waitlist
│
├── shared/                          # Cross-cutting concerns
│   ├── lib/                         # Helper utilities
│   │   ├── requireAdmin.ts          # Auth helpers
│   │   └── prompts.ts               # AI prompts & config
│   │
│   ├── users/                       # User management
│   │   ├── users.ts                 # User CRUD
│   │   ├── userAttributes.ts        # User preferences
│   │   └── userSubscriptions.ts     # Subscription status
│   │
│   ├── payments/                    # Stripe integration
│   │   ├── payments.ts              # Payment records
│   │   ├── stripe.ts                # Stripe webhook handler
│   │   └── webhooks.ts              # Webhook processing
│   │
│   ├── feedback/                    # User feedback
│   │   └── feedback.ts              # Feedback collection
│   │
│   └── ai/                          # AI shared utilities
│       └── anthropic.ts             # Usage tracking (shared)
│
├── auth.ts                          # Auth config (root level)
├── auth.config.ts                   # Auth providers
├── http.ts                          # HTTP router (root level)
├── schema.ts                        # Database schema (root level)
└── tsconfig.json                    # TypeScript config
```

## File Mapping (Old → New)

### Renderer/Base (Baseline Section)
| Old Path | New Path |
|----------|----------|
| `baseline.ts` | `renderer/base/baseline.ts` |
| `baselineChat.ts` | `renderer/base/baselineChat.ts` |
| `baselineChatActions.ts` | `renderer/base/baselineChatActions.ts` |

### Renderer/Canvas (Placeholder)
| Old Path | New Path |
|----------|----------|
| N/A | `renderer/canvas/.gitkeep` |

### Renderer/Heatmap (Daily Logging)
| Old Path | New Path |
|----------|----------|
| `dailyLogs.ts` | `renderer/heatmap/dailyLogs.ts` |
| `dailyLogTemplates.ts` | `renderer/heatmap/dailyLogTemplates.ts` |
| `feed.ts` | `renderer/heatmap/feed.ts` |
| `longForm.ts` | `renderer/heatmap/longForm.ts` |
| `score.ts` | `renderer/heatmap/score.ts` |
| `templates.ts` | `renderer/heatmap/templates.ts` |
| `randomizer.ts` | `renderer/heatmap/randomizer.ts` |

### Renderer/Soloist (Forecasting)
| Old Path | New Path |
|----------|----------|
| `forecast.ts` | `renderer/soloist/forecast.ts` |
| `generator.ts` | `renderer/soloist/generator.ts` |
| `historicalForecast.ts` | `renderer/soloist/historicalForecast.ts` |

### Website/Admin
| Old Path | New Path |
|----------|----------|
| `admin.ts` | `website/admin/admin.ts` |
| `anthropic.ts` | `website/admin/anthropic.ts` |

### Website/Public
| Old Path | New Path |
|----------|----------|
| `newsletter.ts` | `website/public/newsletter.ts` |
| `learnMore.ts` | `website/public/learnMore.ts` |
| `waitlist.ts` | `website/public/waitlist.ts` |

### Shared/Lib
| Old Path | New Path |
|----------|----------|
| `lib/requireAdmin.ts` | `shared/lib/requireAdmin.ts` |
| `prompts.ts` | `shared/lib/prompts.ts` |

### Shared/Users
| Old Path | New Path |
|----------|----------|
| `users.ts` | `shared/users/users.ts` |
| `userAttributes.ts` | `shared/users/userAttributes.ts` |
| `userSubscriptions.ts` | `shared/users/userSubscriptions.ts` |

### Shared/Payments
| Old Path | New Path |
|----------|----------|
| `payments.ts` | `shared/payments/payments.ts` |
| `stripe.ts` | `shared/payments/stripe.ts` |
| `webhooks.ts` | `shared/payments/webhooks.ts` |

### Shared/Feedback
| Old Path | New Path |
|----------|----------|
| `feedback.ts` | `shared/feedback/feedback.ts` |

### Root Level (Unchanged)
| File | Reason |
|------|--------|
| `auth.ts` | Convex Auth requires root |
| `auth.config.ts` | Convex Auth requires root |
| `http.ts` | HTTP router must be at root |
| `schema.ts` | Schema must be at root |
| `tsconfig.json` | Config must be at root |

## Files to Delete (Legacy/Debug)

These files contain debug utilities that should be removed:
- `checkRateLimits.ts`
- `deleteRateLimits.ts`
- `clearDatabase.ts`
- `cleanupAuth.ts`
- `debugSubscription.ts`
- `debugUsers.ts`
- `manualSubscription.ts`
- `testing.ts`

## Import Path Updates

### API Reference Changes

After reorganization, function references will change:

```typescript
// OLD
api.baseline.saveBaselineAnswers
api.dailyLogs.getDailyLog
api.forecast.generateForecast

// NEW
api.renderer.base.baseline.saveBaselineAnswers
api.renderer.heatmap.dailyLogs.getDailyLog
api.renderer.soloist.forecast.generateForecast
```

### Internal Reference Changes

```typescript
// OLD
internal.anthropic.trackUsage
internal.users.getUserByAuthId
internal.payments.create

// NEW
internal.shared.ai.anthropic.trackUsage
internal.shared.users.users.getUserByAuthId
internal.shared.payments.payments.create
```

## Cross-Reference Updates Required

### Files with Internal Dependencies

1. **baselineChatActions.ts** imports:
   - `internal.baselineChat.getBaselineAnswers` → `internal.renderer.base.baselineChat.getBaselineAnswers`
   - `internal.baseline.getLatestBaseline` → `internal.renderer.base.baseline.getLatestBaseline`
   - `api.baselineChat.addChatMessage` → `api.renderer.base.baselineChat.addChatMessage`

2. **feed.ts** imports:
   - `api.dailyLogs.getDailyLog` → `api.renderer.heatmap.dailyLogs.getDailyLog`
   - `internal.anthropic.trackUsage` → `internal.website.admin.anthropic.trackUsage`

3. **score.ts** imports:
   - `api.dailyLogs.getDailyLog` → `api.renderer.heatmap.dailyLogs.getDailyLog`
   - `api.feed.generateFeedForDailyLog` → `api.renderer.heatmap.feed.generateFeedForDailyLog`
   - `internal.anthropic.trackUsage` → `internal.website.admin.anthropic.trackUsage`

4. **forecast.ts** imports:
   - `internal.forecast.*` → `internal.renderer.soloist.forecast.*`
   - `internal.generator.*` → `internal.renderer.soloist.generator.*`

5. **generator.ts** imports:
   - `internal.anthropic.trackUsage` → `internal.website.admin.anthropic.trackUsage`

6. **historicalForecast.ts** imports:
   - `internal.generator.*` → `internal.renderer.soloist.generator.*`
   - `internal.forecast.*` → `internal.renderer.soloist.forecast.*`

7. **stripe.ts** imports:
   - `internal.payments.*` → `internal.shared.payments.payments.*`
   - `internal.userSubscriptions.*` → `internal.shared.users.userSubscriptions.*`
   - `internal.users.*` → `internal.shared.users.users.*`

8. **webhooks.ts** imports:
   - `internal.payments.*` → `internal.shared.payments.payments.*`
   - `internal.userSubscriptions.*` → `internal.shared.users.userSubscriptions.*`

9. **http.ts** imports:
   - `internal.payments.*` → `internal.shared.payments.payments.*`
   - `internal.stripe.*` → `internal.shared.payments.stripe.*`
   - `internal.users.*` → `internal.shared.users.users.*`

## Frontend Import Updates

### Renderer App (`/renderer/`)

All files importing from `convex/_generated/api` need updates:

```typescript
// OLD
import { api } from "@/convex/_generated/api";
useQuery(api.dailyLogs.getDailyLog, ...)
useMutation(api.score.updateLogScore)

// NEW
useQuery(api.renderer.heatmap.dailyLogs.getDailyLog, ...)
useMutation(api.renderer.heatmap.score.updateLogScore)
```

### Website App (`/website/`)

```typescript
// OLD
useQuery(api.users.currentUser)
useMutation(api.newsletter.addEmail)

// NEW
useQuery(api.shared.users.users.currentUser)
useMutation(api.website.public.newsletter.addEmail)
```

## Implementation Order

1. **Create new directories** ✅ (Done)
2. **Copy files to new locations** with updated imports
3. **Update http.ts** with new internal references
4. **Run `npx convex dev`** to regenerate `_generated/api.ts`
5. **Update renderer app imports** (search & replace)
6. **Update website app imports** (search & replace)
7. **Verify all builds pass**
8. **Delete old files** from root
9. **Delete legacy/debug files**
10. **Final verification**

## Rollback Plan

If issues arise:
1. Git revert all changes
2. Run `npx convex dev` to regenerate API
3. Old structure is immediately restored

---

**Status**: Ready for implementation
**Estimated Time**: 2-3 hours
**Risk Level**: Medium (many import changes, but atomic)
