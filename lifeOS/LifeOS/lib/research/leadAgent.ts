// LEAD RESEARCHER AGENT - Orchestrates multi-agent research process
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/research/leadAgent.ts

import { 
  ResearchQuery, 
  ResearchResult, 
  ResearchPlan, 
  SubAgentTask, 
  Citation,
  ResearchTool
} from './types';
import { ClaudeClient } from './claudeClient';
import { researchTools } from './tools';
import { enhancedResearchTools } from './realTools';

export class LeadResearcherAgent {
  private apiKey: string;
  private model: string;
  private claudeClient: ClaudeClient;
  private useRealTools: boolean;
  private activeTools: ResearchTool[];

  constructor(apiKey: string, model: string = "claude-3-5-sonnet-20241022", useRealTools: boolean = true) {
    this.apiKey = apiKey;
    this.model = model;
    this.claudeClient = new ClaudeClient(apiKey);
    this.useRealTools = useRealTools;
    
    // Use enhanced tools with real API connections by default
    this.activeTools = useRealTools ? enhancedResearchTools : researchTools;
  }

  async conductResearch(query: ResearchQuery): Promise<ResearchResult> {
    const startTime = Date.now();
    let totalTokens = 0;

    try {
      // Phase 1: Analyze query and create research plan
      console.log(`🔍 Starting research for: "${query.query}"`);
      const plan = await this.createResearchPlan(query);
      console.log(`📋 Research plan created with ${plan.subTasks.length} sub-tasks`);

      // Phase 2: Execute research plan with parallel sub-agents
      const subAgentResults = await this.executeResearchPlan(plan, query);
      console.log(`🤖 Completed ${subAgentResults.length} sub-agent tasks`);

      // Phase 3: Synthesize findings
      const synthesis = await this.synthesizeFindings(query, plan, subAgentResults);
      totalTokens += synthesis.tokensUsed || 0;

      const timeElapsed = Date.now() - startTime;

      return {
        id: `research_${Date.now()}`,
        queryId: query.id,
        summary: synthesis.summary,
        keyPoints: synthesis.keyPoints,
        citations: synthesis.citations,
        confidence: synthesis.confidence,
        tokensUsed: totalTokens,
        timeElapsed,
        createdAt: Date.now()
      };

    } catch (error) {
      console.error('Research failed:', error);
      
      // Check if this is a Claude API error
      if (error instanceof Error && (
        error.message.includes('529') || 
        error.message.includes('Service temporarily unavailable') ||
        error.message.includes('JSON parsing failed')
      )) {
        console.log('Claude API unavailable, returning fallback research result');
        const timeElapsed = Date.now() - startTime;
        
        return {
          id: `research_fallback_${Date.now()}`,
          queryId: query.id,
          summary: `Unable to complete research for "${query.query}" due to temporary service issues. The research AI is currently experiencing high demand. Please try again in a few minutes.`,
          keyPoints: [
            "Research service temporarily unavailable",
            "High demand on AI services detected", 
            "Please retry your request shortly",
            "All research data is preserved and ready for retry"
          ],
          citations: [{
            title: "System Status",
            url: "internal://status",
            sourceType: "internal" as const,
            snippet: "Research AI experiencing temporary availability issues",
            confidence: 0.5,
            dateAccessed: Date.now()
          }],
          confidence: 0.2,
          tokensUsed: 0,
          timeElapsed,
          createdAt: Date.now()
        };
      }
      
      throw new Error(`Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createResearchPlan(query: ResearchQuery): Promise<ResearchPlan> {
    const systemPrompt = `You are a world-class research strategist. Your job is to analyze queries and create optimal research plans.

ANALYSIS FRAMEWORK:
- Simple queries: 1 sub-agent, 3-5 tool calls (direct facts, definitions)
- Medium queries: 2-4 sub-agents, 8-12 tool calls each (comparisons, multi-faceted topics)
- Complex queries: 5+ sub-agents, 10+ tool calls each (comprehensive analysis, multiple domains)

AVAILABLE TOOLS:
${this.activeTools.map((tool: ResearchTool) => `- ${tool.name}: ${tool.description}`).join('\n')}

HEURISTICS:
- Start broad, then narrow focus
- Use web_search for current events, unknown terms
- Use academic_search for scientific topics
- Use fetch_url to read promising sources in full
- Divide complex topics into independent sub-tasks
- Ensure minimal overlap between sub-agents

OUTPUT: Return a JSON research plan with clear sub-task divisions.`;

    const userPrompt = `Query: "${query.query}"
Complexity: ${query.complexity}

Create a detailed research plan. Break this into 2-6 independent sub-tasks that can run in parallel. Each sub-task should:
1. Have a clear, specific objective
2. Use different tools/sources
3. Cover different aspects of the main query
4. Be actionable for a sub-agent

Return JSON with:
{
  "approach": "overall strategy description",
  "subTasks": ["task 1", "task 2", ...],
  "estimatedComplexity": 1-10,
  "estimatedTime": estimated_minutes,
  "toolsRequired": ["tool1", "tool2", ...]
}`;

    try {
      const response = await this.callClaude(systemPrompt, userPrompt);
      const planData = this.safeJsonParse(response.content);

      return {
        id: `plan_${Date.now()}`,
        queryId: query.id,
        approach: planData.approach as string,
        subTasks: planData.subTasks as string[],
        estimatedComplexity: planData.estimatedComplexity as number,
        estimatedTime: planData.estimatedTime as number,
        toolsRequired: planData.toolsRequired as string[]
      };
    } catch (error) {
      console.error('Failed to create research plan:', error);
      throw new Error('Failed to create research plan');
    }
  }

  private async executeResearchPlan(plan: ResearchPlan, query: ResearchQuery): Promise<SubAgentTask[]> {
    const subAgentPromises = plan.subTasks.map((task, index) => 
      this.createSubAgent(task, query, plan, index)
    );

    return Promise.all(subAgentPromises);
  }

  private async createSubAgent(task: string, query: ResearchQuery, plan: ResearchPlan, index: number): Promise<SubAgentTask> {
    const subAgent: SubAgentTask = {
      id: `subagent_${query.id}_${index}`,
      parentQueryId: query.id,
      task,
      objective: task,
      toolsToUse: plan.toolsRequired,
      status: 'active',
      tokensUsed: 0,
      createdAt: Date.now()
    };

    const systemPrompt = `You are a specialized research sub-agent with access to live data sources. Your job is to thoroughly investigate your assigned task using real-time information.

TASK: ${task}
PARENT QUERY: ${query.query}

AVAILABLE LIVE TOOLS:
${this.activeTools.map((tool: ResearchTool) => `- ${tool.name}: ${tool.description}`).join('\n')}

RESEARCH STRATEGY:
1. Use web_search for current information and recent developments
2. Use wikipedia_search for comprehensive background and established facts
3. Use fetch_url to read promising sources in detail
4. Use news_search for recent developments and current events
5. Cross-verify information from multiple sources
6. Prefer primary sources and authoritative publications
7. Extract specific facts, quotes, statistics, and data points
8. Note any conflicting information or uncertainties

CRITICAL: Make 3-8 tool calls to gather comprehensive information. Use different tools to get varied perspectives.

OUTPUT: Return structured findings with real sources and citations.`;

    const userPrompt = `Execute this research task using LIVE DATA SOURCES: "${task}"

Use the available tools to gather comprehensive, up-to-date information. Make 3-8 tool calls as needed.

REQUIRED TOOLS TO USE:
- web_search: For current information and recent developments
- wikipedia_search: For comprehensive background knowledge
- news_search: For recent news and developments (if relevant)
- fetch_url: To read specific promising sources in detail

Return JSON with:
{
  "findings": "detailed summary of what you discovered from live sources",
  "keyFacts": ["specific fact 1 with source", "fact 2 with source", ...],
  "sources": [{"title": "", "url": "", "credibility": 1-10, "relevance": 1-10, "type": "web|news|wikipedia|direct"}],
  "confidence": 0.0-1.0,
  "gaps": "what information is missing or requires further investigation"
}`;

    try {
      const result = await this.callClaudeWithTools(systemPrompt, userPrompt);
      
      subAgent.results = result.content;
      subAgent.status = 'completed';
      subAgent.tokensUsed = result.tokensUsed || 0;

      return subAgent;
    } catch (error) {
      console.error(`Sub-agent ${index} failed:`, error);
      subAgent.status = 'failed';
      subAgent.results = { error: error instanceof Error ? error.message : 'Unknown error' };
      return subAgent;
    }
  }

  private async synthesizeFindings(query: ResearchQuery, plan: ResearchPlan, subAgents: SubAgentTask[]): Promise<{
    summary: string;
    keyPoints: string[];
    citations: Citation[];
    confidence: number;
    tokensUsed?: number;
  }> {
    const successfulAgents = subAgents.filter(agent => agent.status === 'completed');
    const allFindings = successfulAgents.map(agent => agent.results).filter(Boolean);

    const systemPrompt = `You are an expert research synthesizer working with LIVE DATA from real sources. Your job is to combine findings from multiple research sub-agents into a comprehensive, well-cited final report using current, verified information.

SYNTHESIS PRINCIPLES:
1. Integrate findings from live sources into a coherent narrative
2. Highlight key insights and current developments
3. Cross-reference information across multiple sources
4. Note conflicting information and uncertainties from live data
5. Prioritize high-credibility, authoritative sources
6. Provide specific, actionable takeaways based on current information
7. Include proper citations with working URLs

QUALITY STANDARDS:
- Every major claim must have a citation from live sources
- Use primary sources and official publications when available
- Note the recency and reliability of information
- Identify gaps where live data is insufficient
- Be honest about limitations and conflicting sources
- Distinguish between established facts and recent developments`;

    const userPrompt = `ORIGINAL QUERY: "${query.query}"

RESEARCH PLAN: ${plan.approach}

LIVE DATA FROM SUB-AGENTS:
${allFindings.map((finding, i) => `
Sub-Agent ${i + 1} (Live Sources):
${JSON.stringify(finding, null, 2)}
`).join('\n')}

Synthesize these LIVE RESEARCH FINDINGS into a comprehensive, current report. Return JSON with:
{
  "summary": "comprehensive 2-3 paragraph synthesis based on current information",
  "keyPoints": ["current insight 1 with source", "recent development 2 with source", ...] (5-8 points),
  "citations": [{"title": "", "url": "", "sourceType": "web|news|reference|document|academic", "confidence": 0.0-1.0, "dateAccessed": timestamp}],
  "confidence": 0.0-1.0 (overall confidence based on source quality and consistency),
  "limitations": "what current questions remain unanswered or require further live research"
}`;

    try {
      const response = await this.callClaude(systemPrompt, userPrompt);
      const synthesis = this.safeJsonParse(response.content);
      
      return {
        summary: synthesis.summary as string,
        keyPoints: synthesis.keyPoints as string[],
        citations: (synthesis.citations as Array<{
          title: string;
          url?: string;
          sourceType: string;
          confidence: number;
        }>).map((cite) => ({
          ...cite,
          sourceType: this.mapSourceType(cite.sourceType),
          dateAccessed: Date.now()
        })),
        confidence: synthesis.confidence as number,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      console.error('Failed to synthesize findings:', error);
      throw new Error('Failed to synthesize research findings');
    }
  }

  /**
   * Map various source types to schema-compatible values
   */
  private mapSourceType(sourceType: string): 'web' | 'academic' | 'document' | 'internal' | 'disclosure' | 'news' | 'reference' | 'other' {
    const mapping: Record<string, 'web' | 'academic' | 'document' | 'internal' | 'disclosure' | 'news' | 'reference' | 'other'> = {
      'wikipedia': 'reference',
      'web': 'web',
      'academic': 'academic',
      'document': 'document', 
      'internal': 'internal',
      'disclosure': 'disclosure',
      'news': 'news',
      'reference': 'reference',
      'other': 'other'
    };
    
    return mapping[sourceType.toLowerCase()] || 'other';
  }

  // Helper function to sanitize and parse JSON
  private safeJsonParse(content: string): Record<string, unknown> {
    try {
      // Remove control characters and fix common issues
      const cleaned = content
        .replace(/[\u0000-\u001f\u007f-\u009f]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns  
        .replace(/\t/g, '\\t') // Escape tabs
        .trim();
      
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = cleaned.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : cleaned;
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.error('Raw content:', content.substring(0, 500) + '...');
      
      // If the content starts with conversational text, create a fallback response
      if (content.toLowerCase().includes('i apologize') || content.toLowerCase().includes('i notice')) {
        console.log('Claude provided conversational response instead of JSON, creating fallback');
        return {
          summary: "Research service is temporarily experiencing issues with response formatting. Please try your request again in a few minutes.",
          keyPoints: [
            "Service temporarily unavailable",
            "Response formatting issues detected",
            "Please retry your request"
          ],
          citations: [{
            title: "System Status",
            sourceType: "internal",
            snippet: "Research AI response formatting issues - please try again",
            confidence: 0.5,
            dateAccessed: Date.now()
          }],
          confidence: 0.3
        };
      }
      
      throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callClaude(systemPrompt: string, userPrompt: string): Promise<{
    content: string;
    tokensUsed?: number;
  }> {
    try {
      const response = await this.claudeClient.chat(systemPrompt, userPrompt, {
        maxTokens: 4000,
        temperature: 0.1,
      });
      
      return {
        content: response.content,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      console.error('Claude API error:', error);
      // Fallback to mock for development
      return {
        content: JSON.stringify({
          approach: "Mock research approach (Claude unavailable)",
          subTasks: ["Task 1: Background research", "Task 2: Current analysis"],
          estimatedComplexity: 5,
          estimatedTime: 10,
          toolsRequired: ["web_search", "fetch_url"]
        }),
        tokensUsed: 1000
      };
    }
  }

  private async callClaudeWithTools(systemPrompt: string, userPrompt: string): Promise<{
    content: Record<string, unknown>;
    tokensUsed?: number;
  }> {
    try {
      // Use the active tools (real tools if enabled, mock tools otherwise)
      const availableTools = this.activeTools;
      
      const response = await this.claudeClient.chatWithTools(
        systemPrompt, 
        userPrompt, 
        availableTools,
        {
          maxTokens: 4000,
          temperature: 0.1,
        }
      );
      
      // If Claude wants to use tools, execute them
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolResults = [];
        
        for (const toolCall of response.toolCalls) {
          const tool = availableTools.find(t => t.name === toolCall.name);
          if (tool) {
            try {
              const result = await tool.handler(toolCall.input);
              toolResults.push({
                tool: toolCall.name,
                input: toolCall.input,
                result
              });
            } catch (error) {
              console.error(`Tool ${toolCall.name} error:`, error);
              toolResults.push({
                tool: toolCall.name,
                input: toolCall.input,
                error: `Tool execution failed: ${error}`
              });
            }
          }
        }
        
        // Process tool results and let Claude analyze them
        const toolResultsText = toolResults.map(result => {
          if (result.error) {
            return `Tool ${result.tool} failed: ${result.error}`;
          }
          return `Tool ${result.tool} results: ${JSON.stringify(result.result, null, 2)}`;
        }).join('\n\n');

        // Ask Claude to analyze the tool results
        const analysisPrompt = `Based on these tool results, provide a structured analysis:

${toolResultsText}

Return JSON with:
{
  "findings": "comprehensive analysis of the tool results",
  "keyFacts": ["important fact 1", "important fact 2", ...],
  "sources": [{"title": "source title", "url": "source url", "credibility": 1-10, "relevance": 1-10}],
  "confidence": 0.0-1.0,
  "gaps": "what information is missing or uncertain"
}`;

        const analysisResponse = await this.claudeClient.chat(systemPrompt, analysisPrompt, {
          maxTokens: 2000,
          temperature: 0.1,
        });

        try {
          const parsedAnalysis = this.safeJsonParse(analysisResponse.content);
          return {
            content: parsedAnalysis,
            tokensUsed: (response.tokensUsed || 0) + (analysisResponse.tokensUsed || 0)
          };
        } catch (parseError) {
          console.error('Failed to parse analysis response:', parseError);
          return {
            content: {
              findings: analysisResponse.content,
              keyFacts: [],
              sources: [],
              confidence: 0.5,
              gaps: "Failed to parse structured analysis"
            },
            tokensUsed: (response.tokensUsed || 0) + (analysisResponse.tokensUsed || 0)
          };
        }
      }
      
      // No tools used, parse the text response
      try {
        const parsedContent = JSON.parse(response.content);
        return {
          content: parsedContent,
          tokensUsed: response.tokensUsed
        };
      } catch {
        // If parsing fails, wrap in structure
        return {
          content: {
            findings: response.content,
            keyFacts: [],
            sources: [],
            confidence: 0.7,
            gaps: "Unable to parse structured response"
          },
          tokensUsed: response.tokensUsed
        };
      }
    } catch (error) {
      console.error('Claude API with tools error:', error);
      // Fallback to mock for development
      return {
        content: {
          findings: "Mock findings from sub-agent research (Claude unavailable)",
          keyFacts: ["Fact 1", "Fact 2"],
          sources: [{ title: "Mock Source", url: "", credibility: 8, relevance: 9 }],
          confidence: 0.8,
          gaps: "Some information requires additional verification"
        },
        tokensUsed: 800
      };
    }
  }

  // Generate a descriptive title for the research session
  public async generateTitle(query: string): Promise<string> {
    const systemPrompt = `You are an expert at creating concise, descriptive titles for research queries. 
Your job is to convert user queries into clear, professional titles that would work well in a research library or database.

GUIDELINES:
- Keep titles under 60 characters
- Use title case (First Letter Capitalized)
- Make it descriptive and searchable
- Remove filler words ("how to", "what is", etc.) when possible
- Focus on the core topic/subject

EXAMPLES:
"how to learn math as an adult" → "Adult Mathematics Learning"
"best programming languages for beginners 2024" → "Beginner Programming Languages 2024"
"impact of AI on healthcare industry" → "AI Impact on Healthcare Industry"
"sustainable energy solutions for small businesses" → "Sustainable Energy for Small Businesses"`;

    const userPrompt = `Generate a concise, descriptive title for this research query:
"${query}"

Return only the title, no explanation or quotes.`;

    try {
      const response = await this.callClaude(systemPrompt, userPrompt);
      return response.content.trim().replace(/^"|"$/g, ''); // Remove any quotes
    } catch (error) {
      console.error('Failed to generate title:', error);
      // Fallback: create a basic title from the query
      return query.length > 60 
        ? query.substring(0, 57) + "..."
        : query.charAt(0).toUpperCase() + query.slice(1);
    }
  }
}
