"use client";

import * as React from "react";
import { MapOverlay } from "@/components/ai/map-overlay";
import { ComputerUsePanel } from "@/components/ai/computer-use-panel";
import { GoogleMap, useMapBounds } from "@/components/ai/google-map";

interface Shape {
  id: string;
  type: "rectangle" | "circle";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export default function PreviewDemoPage() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const bounds = useMapBounds(map);
  const [isMapReady, setIsMapReady] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  
  // Update ready state when map and bounds are available
  React.useEffect(() => {
    if (map && bounds) {
      setIsMapReady(true);
      console.log("🗺️ Map is ready! Bounds:", bounds);
    }
  }, [map, bounds]);

  const handleComputerAction = (action: {
    action: string;
    coordinate?: [number, number];
    text?: string;
  }) => {
    console.log("Computer action:", action);
  };

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map) return;

    setIsSearching(true);
    try {
      // Use Google Geocoding API
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchQuery });
      
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14); // Zoom in closer when searching for an address
        console.log('📍 Navigated to:', searchQuery, location.toJSON());
      } else {
        console.warn('⚠️ No results found for:', searchQuery);
        alert('Location not found. Please try a different search.');
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyzeShapes = React.useCallback((shapes: Shape[], canvasWidth: number, canvasHeight: number, screenshot?: string) => {
    console.log("=== SHAPE ANALYSIS DEBUG ===");
    console.log("Analyzing shapes:", shapes);
    console.log("Canvas dimensions:", canvasWidth, canvasHeight);
    console.log("Screenshot provided:", screenshot ? "Yes" : "No");
    console.log("Map instance available:", map !== null);
    console.log("Bounds available:", bounds !== null);
    
    // Always use coordinate-based analysis first (even if screenshot provided)
    if (!bounds) {
      console.error("❌ Map bounds not available yet. Wait for map to load.");
      alert("Map is still loading. Please wait a moment and try again.");
      return;
    }
    
    console.log("✅ Using HYBRID analysis (coordinates + vision verification)");
    console.log("Current map bounds:", bounds);
    console.log("Canvas aspect ratio:", canvasWidth / canvasHeight);
    console.log("Bounds aspect ratio:", (bounds.east - bounds.west) / (bounds.north - bounds.south));
    
    // Validate bounds are reasonable
    if (bounds.north === bounds.south || bounds.east === bounds.west) {
      console.error("❌ Invalid bounds - map may not be fully initialized");
      alert("Map bounds are invalid. Please wait a moment and try again.");
      return;
    }
    
    // Convert pixel coordinates to lat/lng based on actual canvas size and current map bounds
    const viewportWidth = canvasWidth;
    const viewportHeight = canvasHeight;
    
    const shapeCoordinates = shapes.map(shape => {
      // Convert shape bounds to polygon coordinates
      const points: Array<{x: number, y: number}> = [];
      
      if (shape.type === "rectangle") {
        // Rectangle: 4 corners
        points.push(
          { x: shape.startX, y: shape.startY },
          { x: shape.endX, y: shape.startY },
          { x: shape.endX, y: shape.endY },
          { x: shape.startX, y: shape.endY }
        );
      } else if (shape.type === "circle") {
        // Circle: approximate with 16 points
        const centerX = (shape.startX + shape.endX) / 2;
        const centerY = (shape.startY + shape.endY) / 2;
        const width = shape.endX - shape.startX;
        const height = shape.endY - shape.startY;
        const radius = Math.sqrt(width * width + height * height) / 2;
        
        for (let i = 0; i < 16; i++) {
          const angle = (i / 16) * 2 * Math.PI;
          points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          });
        }
      }
      
      // Convert pixel coordinates to lat/lng using simple linear interpolation with current map bounds
      const latLngPoints = points.map(point => {
        const lng = bounds.west + (point.x / viewportWidth) * (bounds.east - bounds.west);
        const lat = bounds.north - (point.y / viewportHeight) * (bounds.north - bounds.south);
        
        // Debug logging
        if (points.indexOf(point) === 0) {
          console.log('First point pixel:', point);
          console.log('Viewport size:', viewportWidth, 'x', viewportHeight);
          console.log('X ratio:', point.x / viewportWidth);
          console.log('Y ratio:', point.y / viewportHeight);
          console.log('Calculated lat/lng:', lat, lng);
          console.log('Map bounds:', bounds);
        }
        
        return { lat, lng };
      });
      
      return {
        type: shape.type,
        color: shape.color,
        coordinates: latLngPoints,
      };
    });
    
    console.log("Shape coordinates:", shapeCoordinates);
    
    // Auto-trigger analysis with BOTH coordinates and screenshot
    const analysisEvent = new CustomEvent('analyzeShapes', {
      detail: {
        coordinates: shapeCoordinates,
        screenshot: screenshot, // Include screenshot for vision verification
        useHybrid: !!screenshot // Flag to indicate hybrid mode
      }
    });
    window.dispatchEvent(analysisEvent);
  }, [bounds, map]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">🍇 Grapes Web Preview</h1>
          
          {/* Address Search */}
          <form onSubmit={handleAddressSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or place..."
              className="px-3 py-2 border rounded-md w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!isMapReady || isSearching}
            />
            <button
              type="submit"
              disabled={!isMapReady || isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '🔍' : '🔎'} Search
            </button>
          </form>
        </div>
        
        <p className="text-muted-foreground text-sm">
          Interactive map preview with shape analysis · Default scale: 10km (zoom in only)
          {!isMapReady && <span className="ml-2 text-yellow-500">⏳ Loading map...</span>}
          {isMapReady && <span className="ml-2 text-green-500">✅ Map ready</span>}
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Computer Use Panel */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          <ComputerUsePanel onActionExecute={handleComputerAction} />
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col p-6">
          <MapOverlay className="flex-1" onAnalyzeShapes={handleAnalyzeShapes}>
            <GoogleMap
              apiKey={googleMapsApiKey}
              center={{ lat: 56.13, lng: -106.35 }}
              zoom={9}
              minZoom={9}
              onMapReady={setMap}
              className="w-full h-full rounded-lg shadow-lg"
            />
          </MapOverlay>
        </div>
      </div>
    </div>
  );
}
