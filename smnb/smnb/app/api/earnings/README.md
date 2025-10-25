# Earnings Reports API

Fetch earnings reports for NASDAQ-100 companies using the Finlight.me API.

## Endpoint

```
GET /api/earnings
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tickers` | string | No | Comma-separated list of ticker symbols (e.g., `AAPL,MSFT,GOOGL`). Defaults to all NASDAQ-100 tickers. |

## Response Format

```json
{
  "success": true,
  "count": 3,
  "earnings": [
    {
      "company": "Microsoft Corp.",
      "ticker": "MSFT",
      "earningsDate": "Oct 29, 2025",
      "conferenceCallTime": "2:30 PM PT",
      "earningsReleaseTime": "After Market Close",
      "source": "Bloomberg"
    },
    {
      "company": "Apple Inc.",
      "ticker": "AAPL",
      "earningsDate": "November 1, 2025",
      "conferenceCallTime": "5:00 PM ET",
      "earningsReleaseTime": "4:30 PM ET",
      "source": "Reuters"
    },
    {
      "company": "Tesla Inc.",
      "ticker": "TSLA",
      "earningsDate": "October 30, 2025",
      "conferenceCallTime": null,
      "earningsReleaseTime": "Before Market Open",
      "source": "CNBC"
    }
  ],
  "timestamp": "2025-10-25T12:00:00.000Z"
}
```

## Field Descriptions

- **company**: Full company name
- **ticker**: Stock ticker symbol
- **earningsDate**: Date of earnings announcement (various formats detected)
- **conferenceCallTime**: Time of earnings conference call (`null` if not found or uses `-` in UI)
- **earningsReleaseTime**: Time when earnings are published (`null` if not found or uses `-` in UI)
- **source**: News source where information was found

## Examples

### Fetch all NASDAQ-100 earnings

```bash
curl http://localhost:3000/api/earnings
```

### Fetch specific tickers

```bash
curl "http://localhost:3000/api/earnings?tickers=MSFT,AAPL,GOOGL"
```

### Test with a single ticker

```bash
curl "http://localhost:3000/api/earnings?tickers=TSLA"
```

## Implementation Notes

### Finlight.me Query Strategy

The API uses advanced Finlight.me query syntax:

```typescript
query: `ticker:${ticker} AND (earnings OR "quarterly report" OR "earnings call" OR "earnings release")`
```

This ensures we only get earnings-related articles for each ticker.

### Information Extraction

The API extracts:

1. **Earnings Date**: Searches for date patterns in multiple formats
   - "October 29, 2025"
   - "Oct 29, 2024"
   - "10/29/2024"
   - "2024-10-29"

2. **Conference Call Time**: Looks for time mentions near "call" or "conference"
   - "2:30 PM PT"
   - "5:00 p.m. Eastern"
   - Supports ET, PT, CT, MT timezones

3. **Release Time**: Detects:
   - Specific times: "4:30 PM ET"
   - General timing: "Before Market Open", "After Market Close"
   - Inferred from phrases like "released after the bell"

### Rate Limiting

- 50ms delay between ticker requests to respect API limits
- Processes tickers sequentially

### NASDAQ-100 Tickers

Currently includes 20 major tickers (can be expanded to full 100):

- AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA, AVGO, COST, NFLX
- AMD, PEP, ADBE, CSCO, CMCSA, INTC, QCOM, TXN, INTU, AMGN

## Integration with Calendar UI

The response format is designed to be directly used as calendar events:

```typescript
// Calendar event mapping
{
  date: earnings.earningsDate,
  title: `${earnings.ticker} Earnings`,
  details: [
    `Company: ${earnings.company}`,
    `Call: ${earnings.conferenceCallTime || '-'}`,
    `Release: ${earnings.earningsReleaseTime || '-'}`
  ]
}
```

## Error Handling

Returns 500 status with error details if:
- FINLIGHT_API_KEY not configured
- Finlight API request fails
- Network issues occur

## Next Steps

1. ✅ Test the API endpoint
2. Integrate with Calendar UI component
3. Add caching layer (optional)
4. Expand to full NASDAQ-100 ticker list
5. Add date range filtering
