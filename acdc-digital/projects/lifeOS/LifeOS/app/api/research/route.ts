// RESEARCH API ROUTE - Next.js API endpoint for research workflow
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/api/research/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { SimpleResearchAgent } from '@/lib/research/simpleAgent';
import { ResearchQuery } from '@/lib/research/types';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { copywriterAgent } from '@/lib/agents/copywriterAgent';
import type { ConvexMutations } from '@/lib/agents/base';
import type { Id } from '@/convex/_generated/dataModel';

interface ResearchRequestBody {
  query: string;
  mode?: string;
  userId?: string;
  isInternalAgent?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Research API: POST request started');

    // Parse request body
    console.log('📦 Research API: Parsing request body');
    const body: ResearchRequestBody = await request.json();
    console.log('📦 Research API: Request body:', body);

    // Validate required fields
    if (!body.query?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check for API key
    console.log('🔑 Research API: Checking API key');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ Research API: ANTHROPIC_API_KEY not found');
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }
    console.log('✅ Research API: API key found');

    // Initialize Convex client
    console.log('💾 Research API: Initializing Convex client');
    const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!CONVEX_URL) {
      console.error('❌ Research API: NEXT_PUBLIC_CONVEX_URL not found');
      return NextResponse.json(
        { success: false, error: 'Convex URL not configured' },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(CONVEX_URL);
    console.log('✅ Research API: Convex client initialized');

    // Create research query object
    console.log('📝 Research API: Creating research query object');
    const researchQuery: ResearchQuery = {
      id: `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId || 'anonymous',
      query: body.query.trim(),
      complexity: 'medium',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    console.log('✅ Research API: Research query created:', researchQuery);

    // Initialize simple research agent
    console.log('🤖 Research API: Initializing SimpleResearchAgent');
    const simpleAgent = new SimpleResearchAgent(apiKey);
    console.log('✅ Research API: SimpleResearchAgent initialized');

    // Generate a descriptive title
    console.log(`📝 Research API: Generating title for query: "${researchQuery.query}"`);
    const generatedTitle = researchQuery.query.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    console.log(`✅ Research API: Generated title: "${generatedTitle}"`);

    // Create research session in database
    console.log('💾 Research API: Creating research session in database');
    await convex.mutation(api.research.createResearchSession, {
      sessionId: researchQuery.id,
      originalQuery: researchQuery.query,
      generatedTitle,
      complexity: researchQuery.complexity,
      userId: researchQuery.userId,
    });

    console.log(`✅ Research API: Created research session ${researchQuery.id} in database`);

    // Update status to researching
    await convex.mutation(api.research.updateResearchSession, {
      sessionId: researchQuery.id,
      status: 'researching',
    });

    // Perform research
    const result = await simpleAgent.conductResearch(researchQuery);

    let enhancedCanvas = result.summary;

    // Enhanced copywriter agent integration with session context
    if (!body.isInternalAgent) {
      try {
        console.log('🤖 Invoking copywriter agent for canvas creation...');
        console.log('🔍 Agent check - copywriterAgent exists:', !!copywriterAgent);
        
        // Check for recent related research sessions to enable intelligent follow-up detection
        const recentSessions = await convex.query(api.research.getRecentResearchSessions, {
          userId: researchQuery.userId,
          limit: 3,
          excludeSessionId: researchQuery.id
        });
        
        // Smart follow-up detection based on timing and question patterns
        let mostRecentCanvas: string | null = null;
        let shouldEnhance = false;
        
        if (recentSessions && recentSessions.length > 0) {
          const mostRecentSession = recentSessions[0];
          const timeSinceLastQuery = researchQuery.createdAt - mostRecentSession.createdAt;
          const isRecentQuery = timeSinceLastQuery < 10 * 60 * 1000; // Within 10 minutes
          const isShortQuestion = researchQuery.query.split(' ').length <= 8; // Short questions likely follow-ups
          const hasQuestionWords = /\b(what|how|where|when|why|which|should|do|does|can|could|would|will|safety|concerns)\b/i.test(researchQuery.query);
          
          // Enhanced follow-up detection logic
          if (isRecentQuery && (isShortQuestion || hasQuestionWords) && mostRecentSession.canvas) {
            mostRecentCanvas = mostRecentSession.canvas;
            shouldEnhance = true;
            console.log('🔄 Detected potential follow-up question - will enhance existing canvas');
          }
        }
        
        // Choose tool based on intelligent context detection
        const toolName = shouldEnhance ? 'enhance-canvas' : 'create-canvas';
        const canvasTool = copywriterAgent.getTool(toolName);
        
        console.log('🔧 Tool selection:', { 
          toolName, 
          shouldEnhance, 
          recentSessionsCount: recentSessions?.length || 0,
          hasRecentCanvas: !!mostRecentCanvas 
        });
        console.log('🔧 Available tools:', copywriterAgent.tools?.map(t => t.command));
        
        if (canvasTool) {
          // Prepare input based on tool type
          let agentInput: string;
          
          if (toolName === 'enhance-canvas') {
            // For enhance-canvas: existing_canvas|||new_research|||new_query
            agentInput = `${mostRecentCanvas}|||${result.summary}|||${researchQuery.query}`;
            console.log('📝 Enhancement input preview:', {
              existingCanvasLength: mostRecentCanvas?.length || 0,
              newResearchLength: result.summary.length,
              query: researchQuery.query
            });
          } else {
            // For create-canvas: research_summary|||original_query  
            agentInput = `${result.summary}|||${researchQuery.query}`;
            console.log('📝 Creation input preview:', {
              researchLength: result.summary.length,
              query: researchQuery.query
            });
          }

          // Execute copywriter agent
          console.log('🚀 Executing copywriter agent...');
          const agentResult = await copywriterAgent.execute(
            canvasTool,
            agentInput,
            {} as ConvexMutations,
            {
              sessionId: researchQuery.id as Id<"researchSessions">
            }
          );

          console.log('📊 Agent execution result:', agentResult);

          if (agentResult.success && agentResult.data) {
            // Handle both string and object responses from the copywriter agent
            if (typeof agentResult.data === 'string') {
              enhancedCanvas = agentResult.data;
            } else if (typeof agentResult.data === 'object' && agentResult.data !== null) {
              const dataObject = agentResult.data as { enhancedCanvas?: string };
              enhancedCanvas = dataObject.enhancedCanvas || (agentResult.data as unknown as string);
            } else {
              enhancedCanvas = agentResult.data as unknown as string;
            }
            console.log('✅ Copywriter agent enhanced canvas');
            console.log('🎨 Enhanced canvas preview:', enhancedCanvas.substring(0, 200) + '...');
          } else {
            console.log('Agent result:', agentResult);
          }
        } else {
          console.warn('⚠️ Canvas tool not found:', toolName);
        }
      } catch (error) {
        console.error('❌ Copywriter agent error:', error);
        console.log('📝 Falling back to original summary for canvas');
      }
    } else {
      console.log('🔄 Skipping copywriter agent - internal request detected');
    }

    // Save results to database
    await convex.mutation(api.research.updateResearchSession, {
      sessionId: researchQuery.id,
      status: 'completed',
      summary: result.summary,
      canvas: enhancedCanvas, // Use copywriter-enhanced version
      keyPoints: result.keyPoints,
      citations: result.citations, // Use original citations format
    });

    console.log(`Research completed and saved for session ${researchQuery.id}`);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: researchQuery.id,
        query: researchQuery.query,
        summary: result.summary,
        canvas: enhancedCanvas,
        keyPoints: result.keyPoints,
        citations: result.citations, // Use original citations format
      }
    });

  } catch (error) {
    console.error('❌ Research API: Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
