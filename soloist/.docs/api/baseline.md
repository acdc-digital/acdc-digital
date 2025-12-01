# Baseline Page API Reference

> API endpoints used by the Waypoints/Baseline view (intake form and chat panel)

---

## Page Overview

The baseline page (`/dashboard/waypoints`) displays:
- Self-analysis intake form with personality questions
- AI chat panel for discussing baseline analysis

---

## Convex Functions

### Queries

| Function | Component | Description |
|----------|-----------|-------------|
| `auth.getUserId` | useConvexUser | Get authenticated user ID |
| `users.viewer` | WaypointsPage, BaselineSelfAnalysisForm | Get current user |
| `baseline.getLatestBaselineAnswers` | WaypointsPage, BaselineSelfAnalysisForm | Get latest baseline answers |
| `baseline.getBaseline` | BaselineSelfAnalysisForm | Get computed baseline (version) |

### Mutations

| Function | Component | Description |
|----------|-----------|-------------|
| `baseline.saveBaselineAnswers` | BaselineSelfAnalysisForm | Save baseline survey answers |
| `baseline.computePrimaryBaseline` | BaselineSelfAnalysisForm | Compute primary baseline from answers |

### Actions

| Function | Component | Description |
|----------|-----------|-------------|
| `baselineChatActions.generateBaselineAnalysis` | BaselineSelfAnalysisForm | Generate AI baseline analysis |
| `baselineChatActions.chatWithAnalysis` | BaselineChatPanel | Chat with AI about analysis |
