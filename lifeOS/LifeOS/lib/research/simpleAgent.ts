// SIMPLE RESEARCH AGENT - Direct, reliable research without complex multi-agent architecture
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/research/simpleAgent.ts

import { ResearchQuery, ResearchResult } from './types';
import { ClaudeClient } from './claudeClient';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export class SimpleResearchAgent {
  private claudeClient: ClaudeClient;
  private searchApiKey: string | undefined;

  constructor(claudeApiKey: string) {
    this.claudeClient = new ClaudeClient(claudeApiKey);
    this.searchApiKey = process.env.SEARCHAPI_API_KEY;
  }

  async conductResearch(query: ResearchQuery): Promise<ResearchResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Simple research for: "${query.query}"`);

      // Step 1: Get web search results
      const searchResults = await this.performWebSearch(query.query);
      console.log(`📊 Found ${searchResults.length} search results`);

      // Step 2: Use Claude to analyze and synthesize the results
      const analysis = await this.analyzeResults(query.query, searchResults);
      
      const timeElapsed = Date.now() - startTime;
      
      return {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        queryId: query.id,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        citations: searchResults.map((result) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          sourceType: 'web' as const,
          confidence: 0.8,
          dateAccessed: Date.now()
        })),
        confidence: searchResults.length > 0 ? 0.85 : 0.4,
        tokensUsed: analysis.tokensUsed || 0,
        timeElapsed,
        createdAt: Date.now()
      };

    } catch (error) {
      console.error('Simple research error:', error);
      
      // Return a basic fallback response
      return {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        queryId: query.id,
        summary: `I encountered technical difficulties while researching "${query.query}". This appears to be a temporary issue with the research service. Please try again in a few minutes, or consider searching for this information manually using search engines or authoritative sources in your field.`,
        keyPoints: [
          'Technical difficulties encountered during research',
          'Manual search recommended as alternative',
          'Service should be restored shortly'
        ],
        citations: [{
          title: 'Research Service Status',
          sourceType: 'internal' as const,
          snippet: 'Temporary technical difficulties - manual research recommended',
          confidence: 0.6,
          dateAccessed: Date.now()
        }],
        confidence: 0.3,
        tokensUsed: 0,
        timeElapsed: Date.now() - startTime,
        createdAt: Date.now()
      };
    }
  }

  private async performWebSearch(query: string): Promise<SearchResult[]> {
    if (!this.searchApiKey) {
      console.log('⚠️ No SearchAPI key available');
      return [];
    }

    try {
      const searchUrl = `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${this.searchApiKey}&num=8`;
      
      console.log('🌐 Performing web search...');
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        console.log(`❌ Search API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.organic_results || data.organic_results.length === 0) {
        console.log('📭 No search results found');
        return [];
      }

      const results = data.organic_results.slice(0, 8).map((result: {
        title?: string;
        link?: string;
        snippet?: string;
        description?: string;
      }) => ({
        title: result.title || 'Untitled',
        url: result.link || '',
        snippet: result.snippet || result.description || 'No description available'
      })).filter((result: SearchResult) => result.url && result.title);

      console.log(`✅ Retrieved ${results.length} valid search results`);
      return results;

    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  private async analyzeResults(query: string, searchResults: SearchResult[]): Promise<{
    summary: string;
    keyPoints: string[];
    tokensUsed?: number;
  }> {
    if (searchResults.length === 0) {
      return {
        summary: `I wasn't able to find current web search results for "${query}". This could be due to temporary search service issues or very specific search terms. I recommend trying a broader search query or checking authoritative sources directly.`,
        keyPoints: [
          'No current search results available',
          'Try broader search terms',
          'Check authoritative sources directly'
        ]
      };
    }

    const systemPrompt = `You are a research analyst. Analyze the provided search results and create a comprehensive summary for the user's query.

IMPORTANT: Respond with clear, well-structured information. Do NOT use JSON formatting or code blocks.`;

    const userPrompt = `Query: "${query}"

Search Results:
${searchResults.map((result, index) => 
  `${index + 1}. ${result.title}\n   ${result.snippet}\n   Source: ${result.url}\n`
).join('\n')}

Please provide:

1. A comprehensive summary (2-3 paragraphs) that directly answers the user's query using the search results
2. 4-6 key points or takeaways
3. Any important considerations or limitations

Format your response as natural text, not as JSON or code.`;

    try {
      console.log('🤖 Analyzing results with Claude...');
      const response = await this.claudeClient.chat(systemPrompt, userPrompt, {
        maxTokens: 2000,
        temperature: 0.2
      });

      // Parse the response to extract summary and key points
      const content = response.content;
      const keyPointsMatch = content.match(/(?:key points?|takeaways?)[:\s]*\n?((?:\s*[-•]\s*.+\n?)+)/i);
      
      let keyPoints: string[] = [];
      if (keyPointsMatch) {
        keyPoints = keyPointsMatch[1]
          .split('\n')
          .map(point => point.replace(/^\s*[-•]\s*/, '').trim())
          .filter(point => point.length > 0)
          .slice(0, 6);
      }

      // If no key points found, generate some from the summary
      if (keyPoints.length === 0) {
        const sentences = content.split('.').map(s => s.trim()).filter(s => s.length > 20);
        keyPoints = sentences.slice(0, 4).map(s => s.replace(/^\d+\.?\s*/, ''));
      }

      return {
        summary: content,
        keyPoints,
        tokensUsed: response.tokensUsed
      };

    } catch (error) {
      console.error('Claude analysis error:', error);
      
      // Fallback: create summary from search results directly
      const summary = `Based on the search results for "${query}":\n\n` +
        searchResults.slice(0, 3).map(result => 
          `${result.title}: ${result.snippet}`
        ).join('\n\n') +
        `\n\nFor more detailed information, please refer to the source links provided.`;

      const keyPoints = searchResults.slice(0, 4).map(result => 
        result.title.length < 100 ? result.title : result.snippet.substring(0, 80) + '...'
      );

      return { summary, keyPoints };
    }
  }
}
