# Places API Feature

## Overview
The Grapes package now includes Google Places API integration, allowing Claude to search for businesses and points of interest within drawn shapes on the map.

## Features

### Search Capabilities
- **Nearby Search**: Find businesses, restaurants, stores, and other places within a specified radius
- **Type Filtering**: Search by place type (restaurant, cafe, hotel, hospital, etc.)
- **Keyword Search**: Find places by keyword in name or description
- **Automatic Radius Calculation**: Claude calculates optimal search radius from polygon bounds

### Supported Place Types
- `restaurant` - Restaurants and eateries
- `cafe` - Coffee shops and cafes
- `store` - Retail stores
- `gas_station` - Gas stations
- `hospital` - Hospitals and medical centers
- `school` - Schools and educational institutions
- `bank` - Banks and financial institutions
- `hotel` - Hotels and accommodations
- `bar` - Bars and nightlife
- `gym` - Fitness centers
- `park` - Parks and recreation areas
- `pharmacy` - Pharmacies and drugstores
- `supermarket` - Grocery stores
- And many more...

See [Google Places Types](https://developers.google.com/maps/documentation/places/web-service/supported_types) for the full list.

## How It Works

### 1. Draw a Shape
User draws a rectangle or circle on the map to define the search area.

### 2. Ask Claude to Find Places
Example prompts:
- "What restaurants are in this area?"
- "Find all coffee shops within this shape"
- "Show me gas stations in this region"
- "List hotels and their ratings in this area"
- "Find grocery stores near here"

### 3. Claude Analyzes and Searches
Claude:
1. Calculates the center point of the shape
2. Determines the appropriate search radius
3. Calls the Places API with relevant filters
4. Returns formatted results with ratings, addresses, and details

## API Response Format

```json
{
  "status": "OK",
  "results_count": 15,
  "total_results": 47,
  "searchParams": {
    "center": { "lat": 45.5017, "lng": -73.5673 },
    "radius": 5000,
    "type": "restaurant",
    "keyword": null
  },
  "places": [
    {
      "name": "Restaurant Name",
      "address": "123 Main St, Montreal, QC",
      "types": ["restaurant", "food", "point_of_interest"],
      "rating": 4.5,
      "user_ratings_total": 234,
      "price_level": 2,
      "location": {
        "lat": 45.5020,
        "lng": -73.5680
      },
      "open_now": true,
      "place_id": "ChIJd8BlQ2BZwokRAFUEcm_qrcA"
    }
  ]
}
```

## Example Queries

### Basic Search
**User**: Draw a shape over downtown Toronto  
**User**: "What restaurants are in this area?"

**Claude Response**:
```
I found 20 restaurants within the selected area of downtown Toronto 
(approximately 2.5 km² centered at 43.6532°N, 79.3832°W).

Top-rated restaurants include:
1. Canoe Restaurant & Bar (4.6★, 1,234 reviews) - Fine dining
2. The Keg Steakhouse (4.4★, 890 reviews) - Steakhouse
3. Pai Northern Thai Kitchen (4.5★, 2,100 reviews) - Thai
...
```

### Filtered Search
**User**: Draw a circle around a neighborhood  
**User**: "Find coffee shops with high ratings"

**Claude Response**:
```
I found 12 coffee shops in the selected area (radius: 1.2 km).

Highest-rated cafes:
1. Moonbean Coffee (4.7★, 567 reviews) - Currently open
2. Dark Horse Espresso (4.6★, 890 reviews) - Currently open
3. Sam James Coffee Bar (4.5★, 432 reviews) - Closed
...
```

### Combined Analysis
**User**: Draw a shape  
**User**: "Calculate the area and tell me what stores are available"

**Claude Response**:
```
Geographic Analysis:
- Area: 3.45 km² (852 acres)
- Location: Yorkville, Toronto, Ontario
- Coordinates: Center at 43.6708°N, 79.3934°W

Business Analysis:
Found 45 stores in this area, including:
- 12 clothing stores
- 8 specialty shops
- 6 grocery stores
- 5 pharmacies
- 14 other retail locations

Notable stores:
1. Whole Foods Market (4.3★) - Grocery
2. Holt Renfrew (4.2★) - Department store
3. Chapters Indigo (4.1★) - Bookstore
...
```

## Setup Requirements

### 1. Enable Places API
In Google Cloud Console, enable:
- **Places API** (legacy) for nearby search
- Or **Places API (New)** for advanced features

### 2. API Key Configuration
Your API key needs access to:
- ✅ Maps Embed API
- ✅ Geocoding API
- ✅ Geometry API
- ✅ **Places API** ← New requirement

### 3. Usage Limits
- **Nearby Search**: $32 per 1,000 requests
- **Max radius**: 50,000 meters (50 km)
- **Results limit**: 20 places per search (60 total with pagination)

## Technical Implementation

### Tool Definition
```typescript
{
  name: "google_maps_api",
  actions: [
    "calculate_area",
    "geocode",
    "reverse_geocode",
    "get_place_info",
    "search_places"  // ← New action
  ]
}
```

### Search Parameters
```typescript
{
  action: "search_places",
  lat: 45.5017,          // Center latitude
  lng: -73.5673,         // Center longitude
  radius: 5000,          // Search radius in meters (max 50000)
  placeType: "restaurant", // Optional: filter by type
  keyword: "italian"     // Optional: keyword search
}
```

### API Endpoint
```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
  ?location={lat},{lng}
  &radius={meters}
  &type={placeType}
  &keyword={keyword}
  &key={API_KEY}
```

## Best Practices

### 1. Radius Calculation
For optimal results, Claude should:
- Calculate bounding box of polygon
- Determine diagonal distance
- Use half the diagonal as radius
- Cap at 50km (API limit)

### 2. Result Filtering
- Limit to 20 results for readability
- Sort by rating or distance
- Filter out low-rated or closed places
- Group by category when many results

### 3. Error Handling
Common scenarios:
- **ZERO_RESULTS**: Area too remote or specific type not available
- **INVALID_REQUEST**: Missing required parameters
- **OVER_QUERY_LIMIT**: API quota exceeded
- **REQUEST_DENIED**: API key not authorized for Places API

## Cost Considerations

### Per Request Pricing (as of 2024)
- **Nearby Search**: $32 / 1,000 requests
- **Find Place**: $17 / 1,000 requests
- **Place Details**: $17 / 1,000 requests

### Optimization Tips
1. **Cache results** for recently searched areas
2. **Combine queries** when possible
3. **Use appropriate radius** - smaller is cheaper
4. **Limit result count** - fewer details = lower cost

## Future Enhancements

### Planned Features
- [ ] Place Details API integration (photos, reviews, hours)
- [ ] Text Search for more flexible queries
- [ ] Place Autocomplete for suggestions
- [ ] Saved place lists per session
- [ ] Custom place filtering and ranking
- [ ] Export results to CSV/JSON
- [ ] Visual markers on map for found places

### Migration to Places API (New)
Consider upgrading to the new Places API for:
- Better performance
- More detailed information
- Enhanced search capabilities
- Modern authentication

## Troubleshooting

### "Places API error: REQUEST_DENIED"
**Solution**: Enable Places API in Google Cloud Console
```
https://console.cloud.google.com/apis/library/places-backend.googleapis.com
```

### "No places found in this area"
**Causes**:
- Area too remote
- Place type too specific
- Radius too small
- Keyword too restrictive

**Solution**: Try broader search criteria or larger radius

### "API quota exceeded"
**Solution**:
- Check usage in Cloud Console
- Increase quota limits
- Implement caching
- Optimize search parameters

## Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Place Types Reference](https://developers.google.com/maps/documentation/places/web-service/supported_types)
- [API Pricing](https://mapsplatform.google.com/pricing/)
- [Places API (New) Migration Guide](https://developers.google.com/maps/documentation/places/web-service/op-overview)

## License
Same as parent project (Grapes package).
