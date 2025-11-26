// GRAPES ORCHESTRATOR AGENT - Nexus Implementation
// Main orchestrator for map shape analysis with screenshot + API tools

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { BaseNexusAgent } from './BaseNexusAgent';
import type { AgentRequest, AgentChunk, Tool, ExecutionContext } from './types';
import { ANTHROPIC_MODELS } from '../../../../../.agents/anthropic.config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * GrapesOrchestratorAgent - Main analysis agent for Grapes
 * 
 * Workflow:
 * 1. User drops shape on map and clicks "Analyze"
 * 2. Agent receives screenshot + shape coordinates
 * 3. Uses computer_use tool to capture and analyze screenshot
 * 4. Uses Google Maps API tools for area calculation, geocoding, place search
 * 5. Streams results back to UI in real-time
 */
export class GrapesOrchestratorAgent extends BaseNexusAgent {
  readonly id = 'grapes-orchestrator';
  readonly name = 'Grapes Map Analyzer';
  readonly description = 'AI-powered geographic analysis with screenshot capture and Google Maps integration';
  readonly isPremium = false;
  readonly version = '1.0.0';

  protected getCapabilities(): string[] {
    return [
      'streaming',
      'tools',
      'computer-use-screenshot',
      'google-maps-api',
      'area-calculation',
      'geocoding',
      'place-search',
      'vision-verification'
    ];
  }

  protected defineTools(): Tool[] {
    return [
      // Tool 1: Computer Use - Capture Screenshot
      {
        type: 'anthropic_tool',
        identifier: 'capture_screenshot',
        requiresPremium: false,
        schema: {
          name: 'capture_screenshot',
          description: 'Capture a screenshot of the current map view. Use this ONCE at the start to see what is on the map before analyzing coordinates.',
          input_schema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        handler: this.handleCaptureScreenshot.bind(this),
      },

      // Tool 2: Google Maps - Calculate Area
      {
        type: 'anthropic_tool',
        identifier: 'calculate_area',
        requiresPremium: false,
        schema: {
          name: 'calculate_area',
          description: 'Calculate the geographic area of the drawn shape in multiple units (km², acres, sq miles). Use coordinates from the shape data.',
          input_schema: {
            type: 'object',
            properties: {
              coordinates: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' }
                  },
                  required: ['lat', 'lng']
                },
                description: 'Array of lat/lng coordinates defining the polygon'
              }
            },
            required: ['coordinates']
          }
        },
        handler: this.handleCalculateArea.bind(this),
      },

      // Tool 2: Google Maps - Reverse Geocode
      {
        type: 'anthropic_tool',
        identifier: 'reverse_geocode',
        requiresPremium: false,
        schema: {
          name: 'reverse_geocode',
          description: 'Convert lat/lng coordinates to human-readable address and location names. Use to identify what region/city/province the shape covers.',
          input_schema: {
            type: 'object',
            properties: {
              lat: {
                type: 'number',
                description: 'Latitude coordinate'
              },
              lng: {
                type: 'number',
                description: 'Longitude coordinate'
              }
            },
            required: ['lat', 'lng']
          }
        },
        handler: this.handleReverseGeocode.bind(this),
      },

      // Tool 4: Google Maps - Search Places
      {
        type: 'anthropic_tool',
        identifier: 'search_places',
        requiresPremium: false,
        schema: {
          name: 'search_places',
          description: 'Search for businesses and places within or near the drawn shape. Supports various place types (restaurants, hotels, gas_stations, etc). Use center point of shape and calculated radius.',
          input_schema: {
            type: 'object',
            properties: {
              lat: {
                type: 'number',
                description: 'Center latitude for search'
              },
              lng: {
                type: 'number',
                description: 'Center longitude for search'
              },
              radius: {
                type: 'number',
                description: 'Search radius in meters (max 50000)'
              },
              placeType: {
                type: 'string',
                description: 'Type of place to search for (e.g., restaurant, cafe, store, gas_station, hospital, school, bank, hotel)'
              },
              keyword: {
                type: 'string',
                description: 'Optional keyword to filter results'
              }
            },
            required: ['lat', 'lng', 'radius', 'placeType']
          }
        },
        handler: this.handleSearchPlaces.bind(this),
      },
    ];
  }

  /**
   * Main streaming method - orchestrates the analysis workflow
   */
  async *stream(request: AgentRequest): AsyncIterable<AgentChunk> {
    try {
      const { input, context } = request;
      const message = typeof input === 'string' ? input : JSON.stringify(input);

      console.log('[GrapesOrchestrator] Starting analysis stream');
      console.log('[GrapesOrchestrator] Context:', {
        hasScreenshot: !!context?.screenshot,
        hasCoordinates: !!context?.shapeCoordinates,
        shapeCount: Array.isArray(context?.shapeCoordinates) ? context.shapeCoordinates.length : 0
      });

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context);

      // Build initial message
      // Note: Screenshot is NOT included in initial message
      // Agent will call capture_screenshot tool, then we'll add it to the tool result
      // Include shape coordinates so agent can use coordinate-based analysis
      let userMessage = message;
      
      // Re-enable coordinates for hybrid analysis (coordinates + visual verification)
      if (context?.shapeCoordinates && Array.isArray(context.shapeCoordinates) && context.shapeCoordinates.length > 0) {
        userMessage += `\n\nShape coordinates (lat/lng): ${JSON.stringify(context.shapeCoordinates)}`;
      }
      
      const messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: userMessage
        }
      ];      // Convert tools to Anthropic format
      const tools: Anthropic.Tool[] = this.getTools().map(tool => ({
        name: tool.schema.name,
        description: tool.schema.description,
        input_schema: tool.schema.input_schema
      }));

      // Stream from Claude with tools
      let continueLoop = true;
      let turnCount = 0;
      const maxTurns = 5;

      while (continueLoop && turnCount < maxTurns) {
        turnCount++;
        console.log(`[GrapesOrchestrator] Turn ${turnCount}/${maxTurns}`);
        console.log(`[GrapesOrchestrator] Messages count: ${messages.length}`);
        console.log(`[GrapesOrchestrator] First message type:`, typeof messages[0]?.content, Array.isArray(messages[0]?.content) ? 'array' : 'string');
        
        // DEBUG: Log all messages to diagnose empty content
        console.log('[GrapesOrchestrator] Messages structure:');
        messages.forEach((msg, i) => {
          const contentLength = Array.isArray(msg.content) ? msg.content.length : msg.content.length;
          console.log(`  [${i}] role=${msg.role}, content=${Array.isArray(msg.content) ? `array[${contentLength}]` : `string[${contentLength}]`}`);
        });

        const stream = await anthropic.messages.create({
          model: ANTHROPIC_MODELS.SONNET_LATEST,
          max_tokens: 4096,
          system: systemPrompt,
          messages,
          tools,
          stream: true,
        });

        let currentToolUse: { id: string; name: string; input: unknown } | null = null;
        const toolResults: ToolResultBlockParam[] = [];
        const assistantToolUses: Anthropic.ToolUseBlock[] = [];
        const assistantTextBlocks: Array<{type: 'text'; text: string}> = [];
        let currentTextContent = '';
        let captureScreenshotCalled = false;

        for await (const event of stream) {
          // Handle different event types
          if (event.type === 'content_block_start') {
            if (event.content_block.type === 'tool_use') {
              // Start of tool use
              currentToolUse = {
                id: event.content_block.id,
                name: event.content_block.name,
                input: ''  // Initialize as empty string for JSON accumulation
              };
            } else if (event.content_block.type === 'text') {
              // Start of text block - initialize accumulator
              currentTextContent = '';
            }
          } else if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              // Stream text content to user
              yield this.createContentChunk(event.delta.text);
              // Also accumulate for assistant message
              currentTextContent += event.delta.text;
            } else if (event.delta.type === 'input_json_delta' && currentToolUse) {
              // Accumulate tool input
              const inputStr = typeof currentToolUse.input === 'string' ? currentToolUse.input : '';
              currentToolUse.input = inputStr + event.delta.partial_json;
            }
          } else if (event.type === 'content_block_stop') {
            if (currentToolUse) {
              // Tool use complete, execute it
              try {
                const toolInput = typeof currentToolUse.input === 'string' && currentToolUse.input
                  ? JSON.parse(currentToolUse.input)
                  : (currentToolUse.input || {});

                console.log(`[GrapesOrchestrator] Executing tool: ${currentToolUse.name}`, toolInput);

                const tool = this.getTool(currentToolUse.name);
                if (!tool) {
                  throw new Error(`Tool not found: ${currentToolUse.name}`);
                }

                const result = await tool.handler(toolInput, context);

                // Track if capture_screenshot was called
                if (currentToolUse.name === 'capture_screenshot') {
                  captureScreenshotCalled = true;
                }

                // Store the tool_use block for assistant message
                assistantToolUses.push({
                  type: 'tool_use',
                  id: currentToolUse.id,
                  name: currentToolUse.name,
                  input: toolInput
                });

                // Yield tool call chunk
                yield this.createToolCallChunk(currentToolUse.name, toolInput, result);

                // Store result for next turn
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: currentToolUse.id,
                  content: JSON.stringify(result)
                });

              } catch (error) {
                console.error(`[GrapesOrchestrator] Tool execution error:`, error);
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: currentToolUse.id,
                  content: `Error: ${errorMsg}`,
                  is_error: true
                });
              }

              currentToolUse = null;
            }
            
            // If we just finished a text block, store it
            if (currentTextContent) {
              assistantTextBlocks.push({
                type: 'text',
                text: currentTextContent
              });
              currentTextContent = '';
            }
          } else if (event.type === 'message_stop') {
            // Check if we need another turn (if there were tool calls)
            if (toolResults.length > 0) {
              // DEBUG: Log what we're about to add to messages
              console.log('[GrapesOrchestrator] Building assistant message:');
              console.log('  - assistantTextBlocks:', assistantTextBlocks.length);
              console.log('  - assistantToolUses:', assistantToolUses.length);
              console.log('  - toolResults:', toolResults.length);
              
              // CRITICAL: Add assistant message with content blocks first
              // This is required by Anthropic API - tool_result must have corresponding tool_use
              // Assistant message must contain both text blocks and tool_use blocks
              const assistantContent: Array<{type: 'text'; text: string} | Anthropic.ToolUseBlock> = [
                ...assistantTextBlocks,
                ...assistantToolUses
              ];
              
              console.log('  - assistantContent length:', assistantContent.length);
              
              messages.push({
                role: 'assistant',
                content: assistantContent as Anthropic.ContentBlock[]
              });
              
              // If screenshot capture was called, add the screenshot image to the message
              if (captureScreenshotCalled && context?.screenshot) {
                // Strip data URL prefix
                const base64Data = context.screenshot.includes(',')
                  ? context.screenshot.split(',')[1]
                  : context.screenshot;
                
                console.log('[GrapesOrchestrator] Adding screenshot to message');
                console.log('[GrapesOrchestrator] Screenshot data length:', base64Data.length);
                console.log('[GrapesOrchestrator] First 100 chars:', base64Data.substring(0, 100));
                
                // DEBUG: Save screenshot to file for inspection
                if (process.env.NODE_ENV === 'development') {
                  try {
                    const fs = await import('fs');
                    const path = await import('path');
                    const debugDir = path.join(process.cwd(), 'debug');
                    if (!fs.existsSync(debugDir)) {
                      fs.mkdirSync(debugDir, { recursive: true });
                    }
                    const timestamp = Date.now();
                    const filePath = path.join(debugDir, `screenshot-${timestamp}.png`);
                    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                    console.log('[GrapesOrchestrator] Screenshot saved to:', filePath);
                  } catch (err) {
                    console.error('[GrapesOrchestrator] Failed to save screenshot:', err);
                  }
                }
                
                // Add tool results + screenshot as user message
                // The screenshot goes AFTER tool results so Claude sees the tool success first,
                // then can view the image
                messages.push({
                  role: 'user',
                  content: [
                    ...toolResults,
                    {
                      type: 'image',
                      source: {
                        type: 'base64',
                        media_type: 'image/png',
                        data: base64Data
                      }
                    },
                    {
                      type: 'text',
                      text: 'Screenshot captured successfully. Note: The screenshot shows the shape overlay, but Google Maps tiles cannot be captured due to security restrictions. Please proceed with coordinate-based analysis using calculate_area and reverse_geocode tools.'
                    }
                  ]
                });
                
                // Reset flag
                captureScreenshotCalled = false;
              } else {
                // Just tool results (no screenshot)
                // CRITICAL: Spread the array to create a copy, otherwise when we clear
                // the toolResults array below, it will also clear the message content!
                messages.push({
                  role: 'user',
                  content: [...toolResults]
                });
              }
              
              // Clear arrays for next turn
              toolResults.length = 0;
              assistantToolUses.length = 0;
              assistantTextBlocks.length = 0;
              
              // Continue loop for next turn
            } else {
              // No tools called, we're done
              continueLoop = false;
            }
          }
        }

        // If we had tool results, clear them for next iteration
        toolResults.length = 0;
      }

      // Send completion
      yield this.createCompleteChunk({
        turns: turnCount,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('[GrapesOrchestrator] Stream error:', error);
      yield this.createErrorChunk(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Build system prompt based on context
   */
  private buildSystemPrompt(context?: ExecutionContext): string {
    const hasScreenshot = !!context?.screenshot;
    const hasCoordinates = !!context?.shapeCoordinates;

    let prompt = `You are analyzing geographic shapes drawn by a user on a Google Maps interface.

Available tools:
1. capture_screenshot - Capture a screenshot showing the shape outline (note: Google Maps tiles cannot be captured due to security restrictions, but shape overlay will be visible)
2. calculate_area - Calculate the geographic area of the shape using coordinates
3. reverse_geocode - Convert coordinates to location names
4. search_places - Find businesses/places within the area

`;

    if (hasScreenshot && hasCoordinates) {
      prompt += `WORKFLOW (Hybrid Mode - Coordinates + Shape Visualization):
1. FIRST: Call capture_screenshot ONCE to see the shape outline
2. IMMEDIATELY: Use calculate_area with the provided coordinates to calculate the area
3. Use reverse_geocode with the center coordinates to identify the location
4. Provide a comprehensive analysis including:
   - Precise area measurements (km², acres, sq miles)
   - Location identification (city, region, country)
   - Geographic context
5. If user asks about businesses, use search_places with appropriate query

IMPORTANT: The coordinates provided are accurate. Use them for calculations. The screenshot shows the shape overlay but not the underlying map tiles.
`;
    } else if (hasCoordinates) {
      prompt += `WORKFLOW (Coordinates Only):
1. Use calculate_area with the provided coordinates
2. Use reverse_geocode to identify the location
3. If user asks about businesses, use search_places
`;
    }

    prompt += `
Be conversational and helpful. Present information clearly with appropriate units and context.`;

    return prompt;
  }

  /**
   * Tool Handler: Capture Screenshot
   * Returns the screenshot as base64 data so it can be added to next message
   */
  private async handleCaptureScreenshot(
    _input: unknown,
    context?: ExecutionContext
  ): Promise<unknown> {
    console.log('[GrapesOrchestrator] Handling screenshot capture');

    if (!context?.screenshot) {
      return {
        success: false,
        error: 'No screenshot available in context. The screenshot must be provided by the frontend.'
      };
    }

    // Return the screenshot data
    // The system will add this as an image in the next turn
    return {
      success: true,
      message: 'Screenshot captured successfully',
      screenshot: context.screenshot  // Include the base64 data
    };
  }

  /**
   * Tool Handler: Calculate Area
   */
  private async handleCalculateArea(
    input: unknown,
    _context?: ExecutionContext
  ): Promise<unknown> {
    const params = input as { coordinates: Array<{ lat: number; lng: number }> };
    console.log('[GrapesOrchestrator] Calculating area for', params.coordinates.length, 'points');

    if (!params.coordinates || params.coordinates.length < 3) {
      return {
        success: false,
        error: 'Need at least 3 coordinates to calculate area'
      };
    }

    // Calculate area using spherical geometry
    const areaInSquareMeters = this.calculatePolygonArea(params.coordinates);
    const areaInKm2 = areaInSquareMeters / 1_000_000;
    const areaInAcres = areaInSquareMeters * 0.000247105;
    const areaInSqMiles = areaInSquareMeters * 0.000000386102;

    return {
      success: true,
      area: {
        squareMeters: Math.round(areaInSquareMeters),
        squareKilometers: areaInKm2.toFixed(2),
        acres: areaInAcres.toFixed(2),
        squareMiles: areaInSqMiles.toFixed(4)
      }
    };
  }

  /**
   * Tool Handler: Reverse Geocode
   */
  private async handleReverseGeocode(
    input: unknown,
    _context?: ExecutionContext
  ): Promise<unknown> {
    const params = input as { lat: number; lng: number };
    console.log('[GrapesOrchestrator] Reverse geocoding:', params);

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return {
        success: false,
        error: 'Google Maps API key not configured'
      };
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return {
          success: true,
          location: data.results[0].formatted_address,
          details: data.results[0].address_components
        };
      }

      return {
        success: false,
        error: `Geocoding failed: ${data.status}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geocoding failed'
      };
    }
  }

  /**
   * Tool Handler: Search Places
   */
  private async handleSearchPlaces(
    input: unknown,
    _context?: ExecutionContext
  ): Promise<unknown> {
    const params = input as {
      lat: number;
      lng: number;
      radius: number;
      placeType: string;
      keyword?: string;
    };
    console.log('[GrapesOrchestrator] Searching places:', params);

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return {
        success: false,
        error: 'Google Maps API key not configured'
      };
    }

    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${params.lat},${params.lng}&radius=${params.radius}&type=${params.placeType}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      if (params.keyword) {
        url += `&keyword=${encodeURIComponent(params.keyword)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const places = data.results.slice(0, 10).map((place: any) => ({
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types
        }));

        return {
          success: true,
          count: places.length,
          places
        };
      }

      return {
        success: false,
        error: `Place search failed: ${data.status}`,
        status: data.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Place search failed'
      };
    }
  }

  /**
   * Calculate polygon area using spherical geometry
   */
  private calculatePolygonArea(coordinates: Array<{ lat: number; lng: number }>): number {
    const EARTH_RADIUS = 6371000; // meters

    if (coordinates.length < 3) return 0;

    let area = 0;
    const coords = [...coordinates, coordinates[0]]; // Close the polygon

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];

      const lat1 = (p1.lat * Math.PI) / 180;
      const lat2 = (p2.lat * Math.PI) / 180;
      const lng1 = (p1.lng * Math.PI) / 180;
      const lng2 = (p2.lng * Math.PI) / 180;

      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2);
    return area;
  }
}
