"use client";

import * as React from "react";
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai/web-preview";
import { MapOverlay } from "@/components/ai/map-overlay";
import { ComputerUsePanel } from "@/components/ai/computer-use-panel";

// Canada map bounds (approximate)
const MAP_BOUNDS = {
  north: 83.1, // Northern tip of Canada
  south: 41.7, // Southern border
  east: -52.6, // Eastern coast
  west: -141.0, // Western border (Alaska border)
};

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
  const [previewUrl, setPreviewUrl] = React.useState(`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=Canada&zoom=4&maptype=roadmap`);

  const handleComputerAction = (action: {
    action: string;
    coordinate?: [number, number];
    text?: string;
  }) => {
    console.log("Computer action:", action);
  };

  const handleAnalyzeShapes = React.useCallback((shapes: Shape[]) => {
    console.log("Analyzing shapes:", shapes);
    
    // Convert pixel coordinates to lat/lng based on map viewport
    // Assuming 1024x768 viewport for the embedded map
    const viewportWidth = 1024;
    const viewportHeight = 768;
    
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
      
      // Convert pixel coordinates to lat/lng
      const latLngPoints = points.map(point => {
        const lng = MAP_BOUNDS.west + (point.x / viewportWidth) * (MAP_BOUNDS.east - MAP_BOUNDS.west);
        const lat = MAP_BOUNDS.north - (point.y / viewportHeight) * (MAP_BOUNDS.north - MAP_BOUNDS.south);
        return { lat, lng };
      });
      
      return {
        type: shape.type,
        color: shape.color,
        coordinates: latLngPoints,
      };
    });
    
    console.log("Shape coordinates:", shapeCoordinates);
    
    // Auto-trigger analysis with coordinates
    const analysisEvent = new CustomEvent('analyzeShapes', {
      detail: { coordinates: shapeCoordinates }
    });
    window.dispatchEvent(analysisEvent);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <h1 className="text-3xl font-bold mb-2">🍇 Grapes Web Preview</h1>
        <p className="text-muted-foreground">
          Interactive iframe preview with navigation controls
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
            <WebPreview
              defaultUrl={previewUrl}
              onUrlChange={setPreviewUrl}
              locked={true}
              className="flex-1"
            >
              <WebPreviewNavigation>
                <WebPreviewUrl />
              </WebPreviewNavigation>
              <WebPreviewBody />
            </WebPreview>
          </MapOverlay>
        </div>
      </div>
    </div>
  );
}
