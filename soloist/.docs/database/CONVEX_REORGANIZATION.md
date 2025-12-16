# Convex Function Reorganization

## Overview

The Soloist Convex API functions have been reorganized from a flat structure to a hierarchical structure that mirrors the application's UI architecture.

**Status**: ✅ Implemented  
**Completed**: December 2024

## Directory Structure

```
convex/
├── _generated/                      # Auto-generated (DO NOT MODIFY)
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
│   └── feedback/                    # User feedback
│       └── feedback.ts              # Feedback collection
│
├── auth.ts                          # Auth config (root level)
├── auth.config.ts                   # Auth providers
├── http.ts                          # HTTP router (root level)
├── schema.ts                        # Database schema (root level)
└── tsconfig.json                    # TypeScript config
```

## API Reference Patterns

### Renderer Functions

```typescript
// Baseline
api.renderer.base.baseline.saveBaselineAnswers
api.renderer.base.baselineChat.getChatHistory
api.renderer.base.baselineChatActions.generateChatResponse

// Heatmap
api.renderer.heatmap.dailyLogs.getDailyLog
api.renderer.heatmap.feed.generateFeedForDailyLog
api.renderer.heatmap.score.updateLogScore
api.renderer.heatmap.templates.getUserTemplates

// Soloist
api.renderer.soloist.forecast.getForecasts
api.renderer.soloist.generator.generateForecast
api.renderer.soloist.historicalForecast.analyzeHistorical
```

### Website Functions

```typescript
// Admin
api.website.admin.admin.setUserRole
api.website.admin.anthropic.getUsageStats

// Public
api.website.public.newsletter.addEmail
api.website.public.learnMore.submitInterest
api.website.public.waitlist.joinWaitlist
```

### Shared Functions

```typescript
// Users
api.shared.users.users.currentUser
api.shared.users.userAttributes.getUserAttributes
api.shared.users.userSubscriptions.getSubscriptionStatus

// Payments
api.shared.payments.payments.getPaymentHistory
api.shared.payments.stripe.handleWebhook

// Feedback
api.shared.feedback.feedback.submitFeedback
```

## Root-Level Files

These files must remain at the root of `/convex/`:

| File | Reason |
|------|--------|
| `auth.ts` | Convex Auth requires root location |
| `auth.config.ts` | Convex Auth requires root location |
| `http.ts` | HTTP router must be at root |
| `schema.ts` | Database schema must be at root |
| `tsconfig.json` | TypeScript config must be at root |

## Deleted Files

The following debug/legacy files were removed:

- `checkRateLimits.ts`
- `deleteRateLimits.ts`
- `clearDatabase.ts`
- `cleanupAuth.ts`
- `debugSubscription.ts`
- `debugUsers.ts`
- `manualSubscription.ts`
- `testing.ts`

## Usage Examples

### Frontend (Renderer App)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Query daily logs
const log = useQuery(api.renderer.heatmap.dailyLogs.getDailyLog, { date });

// Generate forecast
const generateForecast = useMutation(api.renderer.soloist.forecast.generateForecast);
```

### Frontend (Website App)

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Get current user
const user = useQuery(api.shared.users.users.currentUser);

// Newsletter signup
const addEmail = useMutation(api.website.public.newsletter.addEmail);
```

### Internal References

```typescript
// In Convex functions
await ctx.runMutation(internal.shared.users.users.updateUser, { ... });
await ctx.runAction(internal.renderer.soloist.generator.generateForecast, { ... });
```
