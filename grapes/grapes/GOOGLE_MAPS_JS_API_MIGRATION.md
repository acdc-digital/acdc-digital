# Google Maps JavaScript API Migration

**Date**: October 2, 2025  
**Issue**: Coordinate mapping was inaccurate when user zoomed or panned the map  
**Solution**: Migrated from Google Maps Embed API (iframe) to JavaScript API with dynamic bounds detection

## Problem Statement

The original implementation used the Google Maps Embed API with an iframe and hardcoded `MAP_BOUNDS` constant:
```typescript
const MAP_BOUNDS = {
  north: 69.5,
  south: 41.5,
  east: -83.85,
  west: -120.85,
};
```

This worked well **only** when the map was at the default zoom level (4) and center (56.13, -106.35). When users zoomed in on Winnipeg or panned to other locations, the coordinate conversion became completely inaccurate because the pixel-to-lat/lng calculation still used the original hardcoded bounds.

## Solution Architecture

### 1. New GoogleMap Component (`components/ai/google-map.tsx`)

Created a custom React component that:
- Loads Google Maps JavaScript API directly (no external dependencies)
- Exposes the map instance via `onMapReady` callback
- Provides `useMapBounds` hook for real-time bounds tracking
- Includes TypeScript declarations for Google Maps types

**Key Features**:
```typescript
<GoogleMap
  apiKey={googleMapsApiKey}
  center={{ lat: 56.13, lng: -106.35 }}
  zoom={4}
  onMapReady={setMap}  // Exposes map instance
  className="w-full h-full rounded-lg shadow-lg"
/>

const bounds = useMapBounds(map); // Tracks bounds in real-time
```

**Bounds Update Logic**:
- Listens to `bounds_changed` and `idle` map events
- Automatically updates bounds state when user pans/zooms
- Returns bounds in format: `{ north, south, east, west }`

### 2. Updated Demo Page (`app/demo/page.tsx`)

**Before**:
```typescript
// Hardcoded bounds
const MAP_BOUNDS = { north: 69.5, south: 41.5, east: -83.85, west: -120.85 };

// Iframe embed
<WebPreview defaultUrl={embedUrl} locked={true}>
  <WebPreviewBody />
</WebPreview>
```

**After**:
```typescript
// Dynamic bounds from current viewport
const [map, setMap] = React.useState<google.maps.Map | null>(null);
const bounds = useMapBounds(map);

// Native map component
<GoogleMap
  apiKey={googleMapsApiKey}
  center={{ lat: 56.13, lng: -106.35 }}
  zoom={4}
  onMapReady={setMap}
/>
```

### 3. Dynamic Coordinate Conversion

**Updated `handleAnalyzeShapes` function**:
```typescript
const handleAnalyzeShapes = React.useCallback((shapes, canvasWidth, canvasHeight) => {
  if (!bounds) {
    console.error("Map bounds not available yet. Wait for map to load.");
    return;
  }
  
  // Use current map bounds instead of hardcoded values
  const lng = bounds.west + (point.x / viewportWidth) * (bounds.east - bounds.west);
  const lat = bounds.north - (point.y / viewportHeight) * (bounds.north - bounds.south);
}, [bounds]); // Dependency on bounds ensures updates when map changes
```

## Technical Implementation Details

### Google Maps API Loading

The component loads the API dynamically using a script tag:
```typescript
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=initGoogleMap`;
script.async = true;
script.defer = true;

window.initGoogleMap = () => {
  setIsLoaded(true);
};

document.head.appendChild(script);
```

**Libraries loaded**:
- `geometry`: For area calculations
- `places`: For business search (Places API)

### Bounds Tracking Hook

The `useMapBounds` hook uses Google Maps event listeners:
```typescript
export function useMapBounds(map: google.maps.Map | null) {
  const [bounds, setBounds] = React.useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  React.useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const mapBounds = map.getBounds();
      if (mapBounds) {
        const ne = mapBounds.getNorthEast();
        const sw = mapBounds.getSouthWest();
        setBounds({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        });
      }
    };

    // Initial bounds
    google.maps.event.addListenerOnce(map, 'idle', updateBounds);

    // Update on changes
    const listeners = [
      map.addListener("bounds_changed", updateBounds),
      map.addListener("idle", updateBounds),
    ];

    return () => {
      listeners.forEach((listener) => listener.remove());
    };
  }, [map]);

  return bounds;
}
```

### TypeScript Type Declarations

Since we're not using `@types/google.maps` package (due to pnpm version conflicts), we added minimal type declarations directly in the component:

```typescript
declare global {
  interface Window {
    initGoogleMap?: () => void;
    google: typeof google;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: any);
        getBounds(): LatLngBounds | undefined;
        addListener(eventName: string, handler: () => void): any;
      }
      class LatLngBounds {
        getNorthEast(): LatLng;
        getSouthWest(): LatLng;
      }
      class LatLng {
        lat(): number;
        lng(): number;
      }
      enum MapTypeId {
        ROADMAP = 'roadmap',
      }
      namespace event {
        function addListenerOnce(instance: any, eventName: string, handler: () => void): any;
      }
    }
  }
}
```

## Benefits

✅ **Accurate at any zoom level**: Bounds automatically update when user zooms in/out  
✅ **Accurate at any location**: Bounds update when user pans the map  
✅ **No manual calibration needed**: No more tweaking hardcoded bounds constants  
✅ **Better UX**: Users can explore the map freely before drawing shapes  
✅ **More control**: Full programmatic access to map features  

## Testing Checklist

- [ ] Test at default zoom (4) and center (56.13, -106.35) - should maintain previous accuracy
- [ ] Zoom into Winnipeg (zoom ~10), draw shape - should identify correct location
- [ ] Pan to Vancouver, draw shape at any zoom - should identify correct location
- [ ] Pan to Toronto, draw shape at any zoom - should identify correct location
- [ ] Pan to Halifax, draw shape at any zoom - should identify correct location
- [ ] Test extreme zoom in (zoom 15+) - street-level accuracy
- [ ] Test extreme zoom out (zoom 2) - should still work for large regions

## Debug Console Logs

The implementation includes extensive logging to verify accuracy:
```
Current map bounds: {north: 50.2, south: 49.5, east: -96.5, west: -98.0}
Canvas aspect ratio: 1.325
Bounds aspect ratio: 1.333
First point pixel: {x: 450, y: 300}
Calculated lat/lng: 49.87 -97.25
```

Compare calculated coordinates with Google Maps to verify accuracy.

## Future Enhancements

1. **Add crosshairs** - Show center point of map with coordinates
2. **Coordinate display** - Real-time lat/lng display as mouse moves
3. **Bounds indicator** - Visual overlay showing current viewport bounds
4. **Zoom lock option** - Allow users to lock zoom level before drawing
5. **Multi-resolution support** - Adjust shape precision based on zoom level

## Dependencies

- **Google Maps JavaScript API**: Loaded via CDN (no npm package required)
- **API Key**: Must have `Maps JavaScript API` enabled in Google Cloud Console
- **Required APIs**: Geometry API, Places API (for business search)

## Migration Notes

- Removed `WebPreview`, `WebPreviewNavigation`, `WebPreviewUrl`, `WebPreviewBody` components
- Removed hardcoded `MAP_BOUNDS` constant
- No longer using iframe embed URL
- Map now directly rendered as div with Google Maps instance
- Canvas overlay (MapOverlay) still works the same way
