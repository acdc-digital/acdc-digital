/**
 * DEPRECATED: This route is deprecated as of January 2025
 *
 * @deprecated Use `/api/agents/stream` with `grapes-orchestrator` agent instead
 *
 * Migration Guide:
 * ----------------
 * Old approach (deprecated):
 * ```typescript
 * const response = await fetch('/api/computer-use', {
 *   method: 'POST',
 *   body: JSON.stringify({ prompt, shapeCoordinates, screenshot })
 * });
 * ```
 *
 * New approach (Nexus architecture):
 * ```typescript
 * import { useGrapesAgent } from '@/lib/hooks/useGrapesAgent';
 *
 * const { messages, isStreaming, sendMessage } = useGrapesAgent();
 *
 * await sendMessage({
 *   message: prompt,
 *   screenshot,
 *   shapeCoordinates
 * });
 * ```
 *
 * Benefits of new architecture:
 * - Modular agent system (easier testing)
 * - Type-safe tool definitions
 * - Better error handling
 * - Consistent streaming patterns
 * - Reusable across multiple UIs
 *
 * This route will be removed in the next major version.
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google Maps Geocoding/Geometry/Places API tool
const GOOGLE_MAPS_TOOL: Anthropic.Tool = {
  name: "google_maps_api",
  description: "Access Google Maps APIs to calculate geographic areas, get place names, convert coordinates, search for businesses/places, and perform spatial analysis. Use this to analyze user-drawn shapes on the map and find businesses within the area.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["calculate_area", "geocode", "reverse_geocode", "get_place_info", "search_places"],
        description: "The Maps API action to perform",
      },
      coordinates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            lat: { type: "number" },
            lng: { type: "number" },
          },
          required: ["lat", "lng"],
        },
        description: "Array of lat/lng coordinates defining a polygon for area calculation",
      },
      address: {
        type: "string",
        description: "Address to geocode (convert to coordinates)",
      },
      lat: {
        type: "number",
        description: "Latitude for reverse geocoding",
      },
      lng: {
        type: "number",
        description: "Longitude for reverse geocoding or place search center",
      },
      placeType: {
        type: "string",
        description: "Type of place to search for (e.g., 'restaurant', 'cafe', 'store', 'gas_station', 'hospital', 'school', 'bank', 'hotel'). See Google Places types.",
      },
      radius: {
        type: "number",
        description: "Search radius in meters (max 50000). For shape-based searches, use the polygon's bounding radius.",
      },
      keyword: {
        type: "string",
        description: "Keyword to search for in place names and descriptions",
      },
    },
    required: ["action"],
  },
};

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, shapeCoordinates = [], screenshot, useHybrid, conversationHistory = [] } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500 }
      );
    }

    // Create encoder for streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // System message - hybrid mode combines coordinates with vision verification
          const systemMessage = useHybrid && screenshot
            ? `You are analyzing geographic shapes drawn by a user on a Google Maps interface using a HYBRID approach.

You will receive:
1. Calculated coordinates from pixel-to-lat/lng conversion (may have some inaccuracy)
2. A screenshot showing the drawn shape on the map

Your task:
1. FIRST: Use the google_maps_api tool with the provided coordinates to:
   - Calculate the area of the shape
   - Get the geographic location via reverse geocoding
   - Identify what region/city/province the coordinates indicate

2. THEN: Look at the screenshot to verify:
   - Can you see any map labels, city names, or landmarks?
   - Does the visible location match the calculated coordinates?
   - If there's a discrepancy, what does the screenshot actually show?

3. REPORT: Provide the area calculation and location, then mention if the screenshot confirms this or suggests a different location.

Be clear about:
- What the coordinates indicate
- What you can see in the screenshot
- Whether they match or if there's a discrepancy
- Your confidence level in the identification`
            : `You are analyzing geographic shapes drawn by a user on a Google Maps interface.

The user has drawn a shape on a map. You have access to a Google Maps API tool to:
1. Calculate the area of the drawn shape (in km², acres, sq miles, etc.)
2. Identify what geographic region(s) the shape covers
3. Get place names and information about the area
4. **Search for businesses and places** within the area (restaurants, stores, hotels, gas stations, cafes, etc.)

The shape coordinates are provided as an array of lat/lng points defining a polygon.

Your task is to:
- Use the google_maps_api tool to calculate the area
- Provide the area in multiple units (km², acres, sq miles)
- Identify what region/province/territory/city the shape covers
- **When the user asks about businesses/places, use action: "search_places"**
- Provide any relevant geographic information

**For place searches:**
1. Calculate the center point from the polygon coordinates (average lat/lng)
2. Calculate an appropriate radius (half the polygon's bounding box diagonal, max 50000m)
3. Use action: "search_places" with:
   - lat/lng: center point
   - radius: calculated radius
   - placeType: "restaurant", "cafe", "hotel", "store", "gas_station", etc.
   - keyword: optional search term from user query

**Place types available:**
restaurant, cafe, bar, hotel, lodging, store, shopping_mall, gas_station, hospital, pharmacy, bank, atm, school, university, gym, park, museum, movie_theater, library, airport, subway_station, train_station, bus_station, parking

**When presenting results:**
- Show business names, addresses, ratings
- Mention if area is too remote (ZERO_RESULTS)
- Suggest trying a different area or business type
- Remember: coordinate accuracy is ~90%, so results might be offset

The shape coordinates remain constant throughout the conversation, so you can refer to them in follow-up questions.

Be precise and informative in your analysis.`;

          // Build messages array with conversation history
          const messages: Anthropic.MessageParam[] = [];
          
          // Add conversation history if present
          if (conversationHistory.length > 0) {
            conversationHistory.forEach((msg: { role: string; content: string }) => {
              messages.push({
                role: msg.role as "user" | "assistant",
                content: msg.content,
              });
            });
          }
          
          // Add current prompt
          // For hybrid mode: include both coordinates AND screenshot
          // For coordinate-only mode: just include coordinates
          const isFirstMessage = conversationHistory.length === 0;
          
          if (useHybrid && screenshot) {
            // Hybrid analysis: coordinates + vision verification
            const base64Data = screenshot.split(',')[1]; // Remove data:image/png;base64, prefix
            messages.push({
              role: "user",
              content: [
                {
                  type: "text",
                  text: isFirstMessage 
                    ? `${prompt}\n\nCalculated shape coordinates: ${JSON.stringify(shapeCoordinates, null, 2)}`
                    : prompt,
                },
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/png",
                    data: base64Data,
                  },
                },
              ],
            });
          } else {
            // Coordinate-only analysis
            messages.push({
              role: "user",
              content: isFirstMessage 
                ? `${prompt}\n\nShape coordinates: ${JSON.stringify(shapeCoordinates, null, 2)}`
                : prompt,
            });
          }

          let continueLoop = true;
          let iterations = 0;
          const maxIterations = 10; // Prevent infinite loops

          while (continueLoop && iterations < maxIterations) {
            iterations++;

            const response = await anthropic.messages.create({
              model: "claude-3-7-sonnet-20250219",
              max_tokens: 4096,
              tools: [GOOGLE_MAPS_TOOL],
              messages,
              system: systemMessage,
            });

            // Send the response back to client
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: "response",
                  content: response.content,
                  stopReason: response.stop_reason,
                }) + "\n"
              )
            );

            // Check if we should continue
            if (response.stop_reason === "end_turn") {
              continueLoop = false;
              break;
            }

            // If Claude used a tool, we need to handle it
            if (response.stop_reason === "tool_use") {
              const toolUse = response.content.find(
                (block) => block.type === "tool_use"
              ) as Anthropic.ToolUseBlock | undefined;

              if (toolUse && toolUse.name === "google_maps_api") {
                // Execute the Google Maps API call
                const toolInput = toolUse.input as {
                  action: string;
                  coordinates?: Array<{ lat: number; lng: number }>;
                  address?: string;
                  lat?: number;
                  lng?: number;
                };

                let toolResult = "";

                try {
                  // Send tool use notification to client
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        type: "tool_use",
                        toolUse,
                      }) + "\n"
                    )
                  );

                  // Execute the Maps API call
                  toolResult = await executeMapsApiCall(toolInput);

                  // Send tool result to client
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        type: "tool_result",
                        result: toolResult,
                      }) + "\n"
                    )
                  );

                  // Continue conversation with tool result
                  messages.push({
                    role: "assistant",
                    content: response.content,
                  });

                  messages.push({
                    role: "user",
                    content: [
                      {
                        type: "tool_result",
                        tool_use_id: toolUse.id,
                        content: toolResult,
                      },
                    ],
                  });
                } catch (error) {
                  toolResult = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({
                        type: "error",
                        error: toolResult,
                      }) + "\n"
                    )
                  );
                  continueLoop = false;
                }
              } else {
                continueLoop = false;
              }
            } else {
              continueLoop = false;
            }
          }

          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "done" }) + "\n")
          );
          controller.close();
        } catch (error) {
          console.error("Error in stream:", error);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              }) + "\n"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

// Helper function to execute Google Maps API calls
async function executeMapsApiCall(input: {
  action: string;
  coordinates?: Array<{ lat: number; lng: number }>;
  address?: string;
  lat?: number;
  lng?: number;
  placeType?: string;
  radius?: number;
  keyword?: string;
}): Promise<string> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY not configured");
  }

  switch (input.action) {
    case "calculate_area":
      if (!input.coordinates || input.coordinates.length < 3) {
        throw new Error("Need at least 3 coordinates to calculate area");
      }
      return await calculatePolygonArea(input.coordinates, apiKey);

    case "geocode":
      if (!input.address) {
        throw new Error("Address required for geocoding");
      }
      return await geocodeAddress(input.address, apiKey);

    case "reverse_geocode":
      if (input.lat === undefined || input.lng === undefined) {
        throw new Error("Lat/lng required for reverse geocoding");
      }
      return await reverseGeocode(input.lat, input.lng, apiKey);

    case "get_place_info":
      if (input.lat === undefined || input.lng === undefined) {
        throw new Error("Lat/lng required for place info");
      }
      return await getPlaceInfo(input.lat, input.lng, apiKey);

    case "search_places":
      if (input.lat === undefined || input.lng === undefined) {
        throw new Error("Lat/lng required for place search");
      }
      if (!input.radius) {
        throw new Error("Radius required for place search");
      }
      return await searchPlaces(
        input.lat,
        input.lng,
        input.radius,
        apiKey,
        input.placeType,
        input.keyword
      );

    default:
      throw new Error(`Unknown action: ${input.action}`);
  }
}

// Calculate polygon area using spherical geometry
async function calculatePolygonArea(
  coordinates: Array<{ lat: number; lng: number }>,
  apiKey: string
): Promise<string> {
  // Use Google Maps Geometry Library calculation
  // For now, use Shoelace formula for spherical polygon area
  const earthRadius = 6371; // km

  function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  let area = 0;
  const numPoints = coordinates.length;

  if (numPoints < 3) {
    return JSON.stringify({ error: "Need at least 3 points" });
  }

  for (let i = 0; i < numPoints; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % numPoints];

    area +=
      toRadians(p2.lng - p1.lng) *
      (2 + Math.sin(toRadians(p1.lat)) + Math.sin(toRadians(p2.lat)));
  }

  area = (area * earthRadius * earthRadius) / 2;
  area = Math.abs(area);

  // Convert to different units
  const areaKm2 = area;
  const areaAcres = area * 247.105;
  const areaSqMiles = area * 0.386102;
  const areaHectares = area * 100;

  // Also get the center point for place lookup
  const centerLat =
    coordinates.reduce((sum, p) => sum + p.lat, 0) / coordinates.length;
  const centerLng =
    coordinates.reduce((sum, p) => sum + p.lng, 0) / coordinates.length;

  // Try to get place name for the center
  let placeName = "Unknown location";
  try {
    const placeInfo = await reverseGeocode(centerLat, centerLng, apiKey);
    const placeData = JSON.parse(placeInfo);
    if (placeData.results && placeData.results[0]) {
      placeName = placeData.results[0].formatted_address;
    }
  } catch (error) {
    console.error("Error getting place name:", error);
  }

  return JSON.stringify({
    area: {
      km2: areaKm2.toFixed(2),
      acres: areaAcres.toFixed(2),
      sqMiles: areaSqMiles.toFixed(2),
      hectares: areaHectares.toFixed(2),
    },
    center: {
      lat: centerLat,
      lng: centerLng,
    },
    location: placeName,
    coordinates: coordinates,
  });
}

async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<string> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const response = await fetch(url);
  return JSON.stringify(await response.json());
}

async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  const response = await fetch(url);
  return JSON.stringify(await response.json());
}

async function getPlaceInfo(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> {
  // Use reverse geocoding to get place information
  return await reverseGeocode(lat, lng, apiKey);
}

// Search for places using Google Places API (Nearby Search)
async function searchPlaces(
  lat: number,
  lng: number,
  radius: number,
  apiKey: string,
  placeType?: string,
  keyword?: string
): Promise<string> {
  try {
    // Use Places API Nearby Search
    // Note: This uses the legacy Places API. For production, consider migrating to Places API (New)
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: Math.min(radius, 50000).toString(), // Max 50km
      key: apiKey,
    });

    if (placeType) {
      params.append("type", placeType);
    }

    if (keyword) {
      params.append("keyword", keyword);
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }

    if (data.status === "ZERO_RESULTS" || !data.results || data.results.length === 0) {
      return JSON.stringify({
        status: "ZERO_RESULTS",
        message: "No places found in this area",
        searchParams: {
          center: { lat, lng },
          radius,
          type: placeType,
          keyword,
        },
      });
    }

    // Parse and format results (limit to 20 for readability)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const places = data.results.slice(0, 20).map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      types: place.types,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      location: place.geometry.location,
      open_now: place.opening_hours?.open_now,
      place_id: place.place_id,
    }));

    return JSON.stringify({
      status: "OK",
      results_count: places.length,
      total_results: data.results.length,
      searchParams: {
        center: { lat, lng },
        radius,
        type: placeType,
        keyword,
      },
      places,
    }, null, 2);
    
  } catch (error) {
    throw new Error(
      `Places search failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
