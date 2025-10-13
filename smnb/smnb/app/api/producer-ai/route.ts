/**
 * Producer AI API Route - Computer Use Backend
 * 
 * Server-side endpoint for Producer Computer Use functionality
 * Handles Anthropic API calls securely without exposing credentials to browser
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { COMPUTER_USE_CONFIG } from '../../../../../.agents/anthropic.config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options } = body;

    // Use environment API key - never accept from client for security
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured on server' },
        { status: 500 }
      );
    }

    // Initialize Anthropic client on server side
    const client = new Anthropic({ apiKey });

    if (action === 'computer-use') {
      const {
        prompt,
        displayWidth = 1280,
        displayHeight = 800,
        model = COMPUTER_USE_CONFIG.model,
        maxTokens = COMPUTER_USE_CONFIG.maxTokens,
        messages
      } = options;

      console.log('🤖 SERVER: Processing computer use request');

      // Create the computer use conversation
      const response = await client.beta.messages.create({
        model,
        max_tokens: maxTokens,
        tools: [
          {
            type: 'computer_20250124',
            name: 'computer',
            display_width_px: displayWidth,
            display_height_px: displayHeight,
          }
        ],
        messages: messages || [
          {
            role: 'user',
            content: prompt
          }
        ],
        betas: ['computer-use-2025-01-24']
      });

      console.log('✅ SERVER: Computer use response received');

      return NextResponse.json({
        success: true,
        response: {
          id: response.id,
          type: response.type,
          role: response.role,
          content: response.content,
          model: response.model,
          stop_reason: response.stop_reason,
          usage: response.usage
        }
      });
    } 
    
    else if (action === 'continue-conversation') {
      const {
        messages,
        displayWidth = 1280,
        displayHeight = 800,
        model = COMPUTER_USE_CONFIG.model,
        maxTokens = COMPUTER_USE_CONFIG.maxTokens
      } = options;

      console.log('🔄 SERVER: Continuing computer use conversation');

      // Continue the conversation with tool results
      const response = await client.beta.messages.create({
        model,
        max_tokens: maxTokens,
        tools: [
          {
            type: 'computer_20250124',
            name: 'computer',
            display_width_px: displayWidth,
            display_height_px: displayHeight,
          },
          {
            type: 'text_editor_20250124',
            name: 'str_replace_editor'
          }
        ],
        messages,
        betas: ['computer-use-2025-01-24']
      });

      console.log('✅ SERVER: Conversation continued');

      return NextResponse.json({
        success: true,
        response: {
          id: response.id,
          type: response.type,
          role: response.role,
          content: response.content,
          model: response.model,
          stop_reason: response.stop_reason,
          usage: response.usage
        }
      });
    }
    
    else {
      return NextResponse.json(
        { error: 'Invalid action. Use "computer-use" or "continue-conversation"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ SERVER: Producer AI error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
