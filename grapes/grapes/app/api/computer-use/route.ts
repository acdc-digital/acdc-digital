import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google Maps Geocoding/Geometry API tool
const GOOGLE_MAPS_TOOL: Anthropic.Tool = {
  name: "google_maps_api",
  description: "Access Google Maps APIs to calculate geographic areas, get place names, convert coordinates, and perform spatial analysis. Use this to analyze user-drawn shapes on the map.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["calculate_area", "geocode", "reverse_geocode", "get_place_info"],
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
        description: "Longitude for reverse geocoding",
      },
    },
    required: ["action"],
  },
};

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, shapeCoordinates = [] } = await req.json();

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
          // System message explaining the shape analysis context
          const systemMessage = `You are analyzing geographic shapes drawn by a user on a Google Maps interface.

The user has drawn a shape on a map of Canada. You have access to a Google Maps API tool to:
1. Calculate the area of the drawn shape (in km², acres, sq miles, etc.)
2. Identify what geographic region(s) the shape covers
3. Get place names and information about the area

The shape coordinates are provided as an array of lat/lng points defining a polygon.

Your task is to:
- Use the google_maps_api tool to calculate the area
- Provide the area in multiple units (km², acres, sq miles)
- Identify what region/province/territory/city the shape covers
- Provide any relevant geographic information

Be precise and informative in your analysis.`;

          const messages: Anthropic.MessageParam[] = [
            {
              role: "user",
              content: `${prompt}\n\nShape coordinates: ${JSON.stringify(shapeCoordinates, null, 2)}`,
            },
          ];

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
