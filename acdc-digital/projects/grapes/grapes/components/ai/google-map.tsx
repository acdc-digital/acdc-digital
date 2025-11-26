"use client";

import * as React from "react";

interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  minZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  className?: string;
}

// Declare global interface for Google Maps callback and types
declare global {
  interface Window {
    initGoogleMap?: () => void;
    google: typeof google;
  }

  // Google Maps type declarations
  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: any);
        getBounds(): LatLngBounds | undefined;
        addListener(eventName: string, handler: () => void): any;
        setCenter(latlng: LatLng | { lat: number; lng: number }): void;
        setZoom(zoom: number): void;
      }
      class Geocoder {
        geocode(request: { address: string }): Promise<{ results: any[] }>;
      }
      class LatLngBounds {
        getNorthEast(): LatLng;
        getSouthWest(): LatLng;
      }
      class LatLng {
        lat(): number;
        lng(): number;
        toJSON(): { lat: number; lng: number };
      }
      namespace geometry {
        function computeArea(path: LatLng[]): number;
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

export function GoogleMap({
  apiKey,
  center = { lat: 56.13, lng: -106.35 },
  zoom = 9,
  minZoom,
  onMapReady,
  className = "",
}: GoogleMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      console.error('Invalid Google Maps API key');
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;

    window.initGoogleMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      delete window.initGoogleMap;
    };
  }, [apiKey]);

  React.useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      minZoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;
    onMapReady?.(map);
  }, [isLoaded, center, zoom, minZoom, onMapReady]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

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

    // Update bounds initially
    google.maps.event.addListenerOnce(map, 'idle', updateBounds);

    // Update bounds when map moves or zooms
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
