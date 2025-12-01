# Sandbox Page API Reference

> API endpoints used by the Testing/Sandbox view (forecast accuracy testing environment)

---

## Page Overview

The sandbox page (`/dashboard/testing`) displays:
- 7-day forecast testing grid with date range selection
- Selected day details with AI consultation
- Weekly pattern chart with historical forecast overlay
- AI-generated key insights
- Feedback submission for forecast accuracy

---

## Convex Functions

### Queries

| Function | Component | Description |
|----------|-----------|-------------|
| `auth.getUserId` | useConvexUser | Get authenticated user ID |
| `testing.getTestSevenDayForecast` | TestingPage | Get 7-day forecast with historical data |
| `dailyLogs.getLogsByDateRange` | TestingPage | Get historical logs for date range |
| `forecast.getForecastFeedback` | TestingPage | Get feedback for forecast dates |

### Mutations

| Function | Component | Description |
|----------|-----------|-------------|
| `forecast.submitForecastFeedback` | TestingPage | Submit thumbs up/down feedback |

### Actions

| Function | Component | Description |
|----------|-----------|-------------|
| `forecast.generateForecast` | TestingPage | Generate AI forecast for date range |
| `generator.generateDailyConsultation` | Consult | Generate AI consultation for selected day |
| `generator.generateWeeklyInsights` | Insights | Generate AI weekly insights |
| `historicalForecast.generateAndStoreIndividualForecast` | TestingPage | Generate and store individual historical forecast |
