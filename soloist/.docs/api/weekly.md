# Weekly Forecast Page API Reference

> API endpoints used by the Soloist/Weekly dashboard view (7-day emotional forecast)

---

## Page Overview

The weekly forecast page (`/dashboard/soloist`) displays:
- 7-day emotional forecast grid (3 past + today + 3 future)
- Selected day details with score, trend, and recommendations
- Weekly pattern chart visualization
- AI-generated key insights

---

## Convex Functions

### Queries

| Function | Component | Description |
|----------|-----------|-------------|
| `auth.getUserId` | useConvexUser | Get authenticated user ID |
| `forecast.getSevenDayForecast` | SoloistPage | Get 7-day forecast data for user |

### Actions

| Function | Component | Description |
|----------|-----------|-------------|
| `forecast.generateForecast` | SoloistPage | Generate AI forecast for date range |
