# Google Maps Embed Guide

## Why Google Maps Works

Unlike regular google.com URLs, Google Maps has a **dedicated embed API** specifically designed for iframe embedding. The embed URLs use `google.com/maps/embed` which allows iframe display.

❌ **Won't work:** `https://www.google.com/maps/place/...` (regular map URL)  
✅ **Will work:** `https://www.google.com/maps/embed?pb=...` (embed URL)

## How to Get Google Maps Embed URL

### Method 1: Via Google Maps Website (Easiest)

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for any location (address, business, landmark, etc.)
3. Click the **"Share"** button in the left sidebar
4. Select the **"Embed a map"** tab
5. (Optional) Choose your map size: Small, Medium, Large, or Custom
6. Click **"COPY HTML"**
7. Extract the URL from the `src` attribute of the iframe

**Example HTML you'll get:**
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3..." 
        width="600" height="450" style="border:0;" 
        allowfullscreen="" loading="lazy">
</iframe>
```

**Extract this part:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3...
```

### Method 2: Google Maps Embed API (Programmatic)

For dynamic locations, use the Google Maps Embed API with an API key.

**Base URL format:**
```
https://www.google.com/maps/embed/v1/MODE?key=YOUR_API_KEY&PARAMETERS
```

**Modes:**

1. **Place Mode** - Show a specific location
```
https://www.google.com/maps/embed/v1/place
  ?key=YOUR_API_KEY
  &q=Space+Needle,Seattle+WA
```

2. **Directions Mode** - Show route between two points
```
https://www.google.com/maps/embed/v1/directions
  ?key=YOUR_API_KEY
  &origin=Seattle,WA
  &destination=San+Francisco,CA
```

3. **Search Mode** - Show search results
```
https://www.google.com/maps/embed/v1/search
  ?key=YOUR_API_KEY
  &q=pizza+near+Times+Square
```

4. **View Mode** - Show map at coordinates
```
https://www.google.com/maps/embed/v1/view
  ?key=YOUR_API_KEY
  &center=37.7749,-122.4194
  &zoom=12
```

5. **Street View Mode** - Show street view
```
https://www.google.com/maps/embed/v1/streetview
  ?key=YOUR_API_KEY
  &location=46.414382,10.013988
  &heading=210
  &pitch=10
  &fov=35
```

### Getting an API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Maps Embed API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. (Recommended) Restrict your key:
   - Application restrictions: HTTP referrers
   - Add your domain: `yourdomain.com/*`
   - API restrictions: Maps Embed API only

## Example URLs for Testing

### Major Cities

**San Francisco:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.50764017375438!3d37.75781502011672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1696348800000!5m2!1sen!2sus
```

**New York City:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976375541105!3d40.697663747145754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1696348900000!5m2!1sen!2sus
```

**London:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158857.72810084923!2d-0.24168053701457716!3d51.52877184069722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1696349000000!5m2!1sen!2sus
```

**Tokyo:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d207936.08103481693!2d139.5388028!3d35.6761919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x605d1b87f02e57e7%3A0x2e01618b22571b89!2sTokyo%2C%20Japan!5e0!3m2!1sen!2sus!4v1696349100000!5m2!1sen!2sus
```

### Famous Landmarks

**Eiffel Tower:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9914406081493!2d2.2922926156743895!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sus!4v1696349200000!5m2!1sen!2sus
```

**Grand Canyon:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d415849.29950179456!2d-112.35736895!3d36.05695735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80cc0654bd9d8523%3A0xc3c7f1db2b90509!2sGrand%20Canyon%20National%20Park!5e0!3m2!1sen!2sus!4v1696349300000!5m2!1sen!2sus
```

## Usage in Web Preview

### Basic Usage

```tsx
<WebPreview 
  defaultUrl="https://www.google.com/maps/embed?pb=!1m18!1m12..."
  className="h-[600px]"
>
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody />
</WebPreview>
```

### Dynamic Maps Based on User Input

```tsx
"use client";

import { useState } from "react";
import { WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody } from "@/components/ai/web-preview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MapSearch() {
  const [location, setLocation] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleSearch = () => {
    // Using Google Maps Embed API
    const encodedLocation = encodeURIComponent(location);
    const url = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodedLocation}`;
    setMapUrl(url);
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Enter location (e.g., Times Square, NYC)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <WebPreview defaultUrl={mapUrl} className="flex-1">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    </div>
  );
}
```

### AI-Generated Travel Itinerary with Maps

```tsx
async function generateItinerary(prompt: string) {
  // AI generates a travel plan
  const itinerary = await ai.generateItinerary(prompt);
  
  // Extract locations
  const locations = itinerary.locations.join("|");
  
  // Create multi-point map
  const mapUrl = `https://www.google.com/maps/embed/v1/directions
    ?key=${API_KEY}
    &origin=${encodeURIComponent(itinerary.locations[0])}
    &destination=${encodeURIComponent(itinerary.locations[itinerary.locations.length - 1])}
    &waypoints=${encodeURIComponent(locations)}`;
  
  return mapUrl;
}
```

## URL Parameters Explained

The long `pb` parameter in embed URLs contains encoded map data:
- `!1m18` - Map type/version
- `!1m12!1m3` - Coordinate data structure
- `!1d...` - Longitude/latitude values
- `!2m3!1f0!2f0!3f0` - Rotation/tilt settings
- `!3m2!1i1024!2i768` - Map dimensions
- `!4f13.1` - Zoom level
- `!3m3!1m2` - Place data
- `!5e0` - Map type (roadmap/satellite)
- `!3m2!1sen!2sus` - Language/region

**Don't try to construct these manually** - they're complex and encoded. Always get them from Google Maps or use the API.

## Customization Options

### Map Types
Add to embed URL:
- `&maptype=roadmap` - Standard map (default)
- `&maptype=satellite` - Satellite imagery
- `&maptype=hybrid` - Satellite with labels
- `&maptype=terrain` - Topographical

### Zoom Level
- `&zoom=10` - City level
- `&zoom=15` - Neighborhood level
- `&zoom=20` - Building level

### Language
- `&language=es` - Spanish
- `&language=fr` - French
- `&language=ja` - Japanese

## Troubleshooting

### "Map failed to load" error
- Check if API key is valid and enabled
- Verify API key restrictions match your domain
- Ensure Maps Embed API is enabled in Google Cloud Console

### Map shows but is grayed out
- API key may be restricted to different domain
- Check browser console for specific error messages
- Verify billing is enabled on Google Cloud project

### Map loads but location is wrong
- URL encoding issue - make sure to `encodeURIComponent()`
- Try getting fresh embed URL from Google Maps website
- Check latitude/longitude values are correct

## Best Practices

1. **Always use embed URLs** - Regular map URLs won't work in iframes
2. **Restrict API keys** - Use HTTP referrer restrictions for security
3. **Cache embed codes** - Don't regenerate for same locations
4. **Handle errors gracefully** - Show fallback UI if map fails to load
5. **Consider mobile** - Maps can be resource-intensive on phones
6. **Monitor quota** - Google Maps has usage limits (check pricing)

## Cost Considerations

**Google Maps Embed API pricing (as of 2024):**
- Free tier: $200 credit per month (≈28,000 map loads)
- After free tier: $7 per 1,000 loads
- No cost for static embed URLs (from Share button)

**Tip:** Use the Share button method for static locations (it's free!) and API only for dynamic/programmatic needs.

## Resources

- [Google Maps Embed API Documentation](https://developers.google.com/maps/documentation/embed)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps Embed API Pricing](https://developers.google.com/maps/documentation/embed/usage-and-billing)
