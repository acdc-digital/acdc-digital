// CLAUDE API ROUTE WITH MCP INTEGRATION
// /Users/matthewsimon/Projects/SMNB/smnb/app/api/claude/route.ts

/**
 * Claude API Route with Native MCP Connector
 * 
 * Server-side API endpoint for Claude LLM requests with MCP tool integration
 * Uses Claude's native MCP connector for direct database access
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SESSION_MANAGER_CONFIG } from '../../../../../.agents/anthropic.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, prompt, options, messages, enableMCP = true } = body;

    // API key stored securely in environment variable only
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ SERVER: ANTHROPIC_API_KEY not configured in environment');
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured on server. Please contact support.' },
        { status: 500 }
      );
    }
    
    console.log('🔑 SERVER: Using environment API key');

    // MCP server configuration
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
    const useMCP = enableMCP && process.env.ENABLE_MCP !== 'false';

    // Create Anthropic client with environment API key and MCP beta header
    const anthropicConfig = {
      apiKey,
      ...(useMCP && {
        defaultHeaders: {
          'anthropic-beta': 'mcp-client-2025-04-04'
        }
      })
    };

    if (useMCP) {
      console.log('🔌 Enabling MCP connector for database access');
    }

    const anthropic = new Anthropic(anthropicConfig);

    if (action === 'chat' || action === 'generate') {
      // Prepare request configuration
      const requestConfig = {
        model: options?.model || SESSION_MANAGER_CONFIG.model,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        messages: messages || [
          {
            role: 'user' as const,
            content: prompt
          }
        ],
        ...(options?.systemPrompt && { system: options.systemPrompt }),
        ...(useMCP && {
          mcp_servers: [
            {
              name: 'smnb-news-studio',
              url: mcpServerUrl,
              description: 'SMNB Session Manager database access for analytics and metrics'
            }
          ]
        })
      };

      console.log('📤 Sending request to Claude with config:', JSON.stringify({
        ...requestConfig,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: requestConfig.messages.map((m: any) => ({ role: m.role, content: m.content.substring(0, 100) + '...' }))
      }, null, 2));

      const response = await anthropic.messages.create(requestConfig);

      console.log('📥 Claude response:', {
        type: response.type,
        role: response.role,
        model: response.model,
        stop_reason: response.stop_reason,
        content_blocks: response.content.length,
        usage: response.usage
      });

      const content = response.content[0];
      if (content.type === 'text') {
        console.log('✅ Returning text response:', content.text.substring(0, 200) + '...');
        return NextResponse.json({
          success: true,
          text: content.text.trim(),
          usage: response.usage,
          model: response.model,
          mcp_enabled: useMCP
        });
      } else {
        throw new Error('Unexpected response format from Claude');
      }

    } else if (action === 'stream') {
      // Prepare streaming request configuration
      const requestConfig = {
        model: options?.model || 'claude-3-5-haiku-20241022',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        messages: messages || [
          {
            role: 'user' as const,
            content: prompt
          }
        ],
        stream: true,
        ...(options?.systemPrompt && { system: options.systemPrompt }),
        ...(useMCP && {
          mcp_servers: [
            {
              name: 'smnb-news-studio',
              url: mcpServerUrl,
              description: 'SMNB Session Manager database access for analytics and metrics'
            }
          ]
        })
      };

      // Create a streaming response with timeout protection
      const STREAM_TIMEOUT_MS = 30000; // 30 second timeout
      let streamTimeout: NodeJS.Timeout;
      
      const stream = new ReadableStream({
        async start(controller) {
          console.log('📡 SERVER: Starting Claude stream...');
          
          // Set up timeout to prevent hanging streams
          streamTimeout = setTimeout(() => {
            console.error('⏰ SERVER: Stream timeout after 30s - forcing completion');
            try {
              const timeoutData = JSON.stringify({
                type: 'error',
                error: 'Stream timeout - response took too long'
              });
              controller.enqueue(new TextEncoder().encode(`data: ${timeoutData}\n\n`));
              controller.close();
            } catch (e) {
              console.error('Error closing timed-out stream:', e);
            }
          }, STREAM_TIMEOUT_MS);
          
          try {
            const response = await anthropic.messages.stream(requestConfig);
            console.log('📡 SERVER: Claude stream created, processing chunks...');

            let chunkCount = 0;
            let totalChars = 0;
            
            // Handle streaming response
            for await (const chunk of response) {
              chunkCount++;
              
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                totalChars += chunk.delta.text.length;
                const data = JSON.stringify({
                  type: 'chunk',
                  text: chunk.delta.text
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                
                if (chunkCount % 20 === 0) {
                  console.log(`📡 SERVER: Streamed ${chunkCount} chunks, ${totalChars} chars...`);
                }
              } else if (chunk.type === 'message_stop') {
                console.log(`✅ SERVER: Claude stream completed - ${chunkCount} chunks, ${totalChars} chars`);
                clearTimeout(streamTimeout);
                const data = JSON.stringify({
                  type: 'complete',
                  mcp_enabled: useMCP,
                  stats: { chunks: chunkCount, chars: totalChars }
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                break;
              }
            }
            console.log('✅ SERVER: Stream processing finished successfully');
          } catch (error) {
            console.error('❌ SERVER: Stream error:', error);
            
            // Check if it's a rate limit error (429)
            if (error instanceof Error && error.message.includes('429')) {
              console.warn('⚠️ SERVER: Rate limit hit (429) - checking headers...');
              // The error should contain rate limit info if available
            }
            
            clearTimeout(streamTimeout);
            const errorData = JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown streaming error'
            });
            controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          } finally {
            console.log('🏁 SERVER: Closing stream controller');
            clearTimeout(streamTimeout);
            try {
              controller.close();
            } catch (e) {
              console.log('Stream already closed');
            }
          }
        },
        cancel() {
          console.log('❌ SERVER: Stream cancelled by client');
          clearTimeout(streamTimeout);
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } else if (action === 'analyze') {
      const analysisPrompt = `
Analyze the following social media content and provide a JSON response:

Content: "${prompt}"

Please analyze and return a JSON object with:
- sentiment: "positive" | "negative" | "neutral"
- topics: array of up to 3 relevant topics from: Technology, Politics, Economy, Health, Environment, Sports, Entertainment, Science, Business, Education, or General News
- summary: brief one-sentence summary (max 80 characters)
- urgency: "low" | "medium" | "high" based on language and content
- relevance: number between 0 and 1 indicating how newsworthy this is

Return only valid JSON, no additional text.
      `.trim();

      const response = await anthropic.messages.create({
        model: SESSION_MANAGER_CONFIG.model,
        max_tokens: 150,
        temperature: 0.3,
        system: 'You are a content analysis assistant. Always respond with valid JSON only.',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const analysis = JSON.parse(content.text.trim());
          return NextResponse.json({
            success: true,
            analysis
          });
        } catch (parseError) {
          console.error('Failed to parse Claude analysis:', parseError);
          return NextResponse.json(
            { error: 'Invalid JSON response from Claude' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Unexpected response format from Claude' },
        { status: 500 }
      );

    } else if (action === 'count-tokens') {
      // Token counting endpoint
      const { model, system, messages, tools, thinking } = body;
      
      const countRequest = {
        model: model || SESSION_MANAGER_CONFIG.model,
        messages: messages || [],
        ...(system && { system }),
        ...(tools && { tools }),
        ...(thinking && { thinking })
      };

      const response = await anthropic.messages.countTokens(countRequest);
      
      return NextResponse.json({
        input_tokens: response.input_tokens
      });

    } else if (action === 'test') {
      // Simple connection test
      const response = await anthropic.messages.create({
        model: SESSION_MANAGER_CONFIG.model,
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: 'Say "Connection successful" if you can read this.'
          }
        ]
      });

      const content = response.content[0];
      const success = content.type === 'text' && 
                     content.text.toLowerCase().includes('connection successful');

      return NextResponse.json({
        success,
        message: success ? 'Connection test passed' : 'Connection test unclear'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Claude API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
