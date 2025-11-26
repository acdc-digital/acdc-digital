# Places API Test Examples

## Once you enable the API, here's what to expect:

### Test 1: Restaurant Search
**User action**: Draw shape over downtown Winnipeg
**User query**: "Find restaurants in this area"

**Expected Claude behavior**:
1. Calculate center: ~49.9°N, -97.1°W
2. Calculate radius: ~5000m (based on shape size)
3. Call tool:
```json
{
  "action": "search_places",
  "lat": 49.895,
  "lng": -97.138,
  "radius": 5000,
  "placeType": "restaurant"
}
```

**Expected response**:
```
I found several restaurants in downtown Winnipeg:

1. **The Merchant Kitchen** ⭐ 4.5/5 (423 reviews)
   259 Bannatyne Ave, Winnipeg, MB
   
2. **Stella's Café** ⭐ 4.3/5 (891 reviews)
   166 Osborne St, Winnipeg, MB
   
3. **Hermanos** ⭐ 4.6/5 (312 reviews)
   285 Main St, Winnipeg, MB

(showing 3 of 20 results)

Would you like to see more restaurants or search for a specific cuisine?
```

---

### Test 2: Coffee Shop Search
**User query**: "Show me coffee shops nearby"

**Expected tool call**:
```json
{
  "action": "search_places",
  "lat": 49.895,
  "lng": -97.138,
  "radius": 5000,
  "placeType": "cafe",
  "keyword": "coffee"
}
```

**Expected response**:
```
Here are coffee shops in your area:

1. **Parlour Coffee** ⭐ 4.7/5 (567 reviews)
   468 Main St, Winnipeg, MB
   
2. **Thom Bargen Coffee** ⭐ 4.8/5 (445 reviews)
   96 Arthur St, Winnipeg, MB

...
```

---

### Test 3: Hotels Search
**User query**: "Find hotels in this region"

**Expected tool call**:
```json
{
  "action": "search_places",
  "lat": 49.895,
  "lng": -97.138,
  "radius": 5000,
  "placeType": "hotel"
}
```

---

### Test 4: Natural Language Search
**User query**: "Are there any gas stations around here?"

**Expected tool call**:
```json
{
  "action": "search_places",
  "lat": 49.895,
  "lng": -97.138,
  "radius": 5000,
  "placeType": "gas_station"
}
```

---

## What Happens with Current Code

### ✅ Working Parts:
1. Shape drawing → coordinate calculation (90% accurate)
2. Center point + radius calculation (automatic)
3. Tool definition → Claude knows how to use it
4. API implementation → ready to call Google

### ⚠️ Blocked:
1. Google Cloud Console → Places API not enabled
2. API returns → REQUEST_DENIED error

### 🎯 After Enabling API:
Everything flows:
1. User draws shape
2. User asks "Find restaurants"
3. Claude calculates center/radius
4. Claude calls search_places tool
5. Google returns business list
6. User sees results in chat

---

## Current Test Command

Want to test if your API key has Places API enabled?

Run this in your terminal:

```bash
cd /Users/matthewsimon/Projects/acdc-digital/grapes/grapes

# Test if Places API is enabled (replace YOUR_KEY with actual key)
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=49.895,-97.138&radius=5000&type=restaurant&key=YOUR_KEY"
```

**If enabled**: Returns JSON with restaurants
**If not enabled**: Returns `"REQUEST_DENIED"`

---

## Quick Enable Link

https://console.cloud.google.com/apis/library/places-backend.googleapis.com

Click "Enable" → Wait 30 seconds → Test above curl command → Should work!

---

## Next Feature: Results Display

Once data is flowing, we can enhance the UI:

```typescript
// Future: Format results nicely
interface PlaceResult {
  name: string;
  address: string;
  rating: number;
  reviews: number;
  coordinates: { lat: number; lng: number };
  types: string[];
}

// Display as cards with:
// - Star ratings
// - Distance from center
// - Map markers
// - Directions link
// - Reviews summary
```

But first: **Enable the API!** 🎯
