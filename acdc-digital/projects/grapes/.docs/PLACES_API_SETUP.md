# Google Places API Setup Guide

## Current Status
- ✅ Code is implemented and ready
- ✅ `search_places` action exists in the tool
- ⚠️ Need to enable Places API in Google Cloud Console

## Quick Setup Steps

### 1. Enable Places API
Go to: https://console.cloud.google.com/apis/library

Search for and enable **both**:
- **Places API** (legacy - currently used)
- **Places API (New)** (recommended for future)

### 2. Verify API Key Permissions
Your current API key needs these permissions:
- ✅ Maps JavaScript API (already working)
- ✅ Geocoding API (already working)
- ⚠️ Places API (needs to be enabled)

### 3. Test the Feature

Once enabled, try these queries:

**Example 1: Find restaurants**
```
Draw a shape over downtown Winnipeg, then ask:
"Find restaurants in this area"
```

**Example 2: Find hotels**
```
Draw a shape over any city, then ask:
"Show me hotels in this region"
```

**Example 3: Find coffee shops**
```
Draw a shape and ask:
"Find coffee shops nearby"
```

## How It Works

1. **User draws shape** → System calculates center point + radius
2. **Claude uses google_maps_api tool** with `action: "search_places"`
3. **API returns** business list with names, addresses, ratings
4. **User sees results** in chat interface

## API Call Parameters

The system automatically converts your drawn shape to:
- **center**: `{ lat, lng }` - calculated from polygon center
- **radius**: meters (calculated from polygon size)
- **type**: restaurant, cafe, hotel, store, gas_station, etc.
- **keyword**: optional search term

## Business Data Returned

Each result includes:
- ✅ Name
- ✅ Address
- ✅ Rating (1-5 stars)
- ✅ Number of reviews
- ✅ Place types
- ✅ Coordinates
- ✅ Opening hours (if available)
- ✅ Price level (if available)

## Cost Estimate

Google Places API pricing:
- **Nearby Search**: $32 per 1000 requests
- **Each request**: returns up to 20 results
- **Your usage**: Likely 1-10 requests/day in testing

Example: 100 searches = $3.20

## Alternative: Text Search

If you want more flexible queries, we can also add:
```typescript
action: "text_search_places"
query: "best pizza restaurants in downtown"
```

This uses natural language instead of coordinates.

## Next Steps

1. ✅ Enable Places API in Cloud Console (2 minutes)
2. ✅ Test with "Find restaurants in this area"
3. ✅ See real business data appear in chat
4. 🎯 Build UI to display results nicely (cards, maps, etc.)

## Troubleshooting

**Error: "REQUEST_DENIED"**
- Solution: Enable Places API in console

**Error: "OVER_QUERY_LIMIT"**
- Solution: Check billing is enabled

**Error: "ZERO_RESULTS"**
- Solution: Area might be too remote, try larger city

**Results seem wrong**
- Remember: Coordinates are ~90% accurate (40-100km offset)
- Solution: Draw larger shapes, use vision for precise targeting
