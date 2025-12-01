# Heatmap Page API Reference

> API endpoints used by the Dashboard/Heatmap view in the Electron renderer

---

## Page Overview

The heatmap page (`/dashboard`) displays:
- Yearly heatmap calendar showing daily log scores
- Daily log forms (bullet and long form)
- Feed panel with AI-generated summaries
- Template management

---

## Convex Functions

### Queries

| Function | Component | Description |
|----------|-----------|-------------|
| `auth.getUserId` | useConvexUser | Get authenticated user ID |
| `userSubscriptions.hasActiveSubscription` | Dashboard | Check subscription status |
| `dailyLogs.listDailyLogs` | Dashboard | List daily logs for year |
| `dailyLogs.getDailyLog` | Dashboard | Get single daily log for score badge |
| `dailyLogs.listScores` | Heatmap | List all scores for heatmap display |
| `feed.getFeedTags` | Dashboard | Get all user tags for filtering |
| `dailyLogTemplates.getUserDailyLogTemplates` | useTemplates | Get user's templates |
| `dailyLogTemplates.getActiveDailyLogTemplate` | useTemplates | Get active template |

### Mutations

| Function | Component | Description |
|----------|-----------|-------------|
| `dailyLogs.dailyLog` | DailyLogForm | Save/update daily log entry |
| `longForm.saveLongFormEntry` | LongForm | Save long form journal entry |
| `feed.addComment` | Feed | Add comment to feed |
| `feed.addTag` | Feed | Add tag to feed entry |
| `feed.removeTag` | Feed | Remove tag from feed entry |
| `feedback.submitFeedback` | Feed | Submit feedback on feed |
| `dailyLogTemplates.saveDailyLogTemplate` | useTemplates | Save a template |
| `dailyLogTemplates.setTemplateActive` | useTemplates | Set template as active |
| `dailyLogTemplates.deleteDailyLogTemplate` | useTemplates | Delete a template |
| `dailyLogTemplates.duplicateDailyLogTemplate` | useTemplates | Duplicate a template |
| `randomizer.saveInstructions` | Settings | Save randomizer instructions |

### Actions

| Function | Component | Description |
|----------|-----------|-------------|
| `score.scoreDailyLog` | DailyLogForm | AI-score a daily log |
| `feed.generateFeedForDailyLog` | DailyLogForm, Feed | Generate AI feed summary |
| `forecast.generateForecast` | DailyLogForm | Generate AI forecast |
| `randomizer.generateRandomLog` | DailyLogForm | Generate random log entry |
| `stripe.simulateSuccessfulCheckout` | Dashboard | Simulate checkout (dev) |

---

## Long Form

> Long form journal entries

### Queries

| Function | Description |
|----------|-------------|
| `longForm.getLongFormEntry` | Get a long form entry |
| `longForm.listLongFormEntries` | List long form entries |
| `longForm.getLongFormEntriesByDateRange` | Get entries by date range |

### Mutations

| Function | Description |
|----------|-------------|
| `longForm.saveLongFormEntry` | Save long form journal entry |
| `longForm.deleteLongFormEntry` | Delete long form entry |

---

## Templates

> User templates management

### Queries

| Function | Description |
|----------|-------------|
| `dailyLogTemplates.getUserDailyLogTemplates` | Get user's templates |
| `dailyLogTemplates.getDailyLogTemplate` | Get template by ID |

### Mutations

| Function | Description |
|----------|-------------|
| `dailyLogTemplates.saveDailyLogTemplate` | Save a template |
| `dailyLogTemplates.deleteDailyLogTemplate` | Delete a template |
