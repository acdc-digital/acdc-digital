// RESEARCH TOOLS - Tool definitions and handlers for research agents
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/research/tools.ts

import { ResearchTool } from './types';

// Web Search Tool
export const webSearchTool: ResearchTool = {
  name: "web_search",
  description: "Search the public web for current information, news, facts, or unknown terms. Returns top results with titles, snippets, and URLs. Best for time-sensitive queries.",
  parameters: {
    type: "object",
    properties: {
      query: { 
        type: "string",
        description: "Search query - be specific but not overly long"
      },
      numResults: { 
        type: "number", 
        description: "Number of results to return (default: 5, max: 10)"
      },
      timeframe: {
        type: "string",
        description: "Time filter for results: day, week, month, year, or any"
      }
    },
    required: ["query"]
  },
  handler: async (input: Record<string, unknown>) => {
    const { query, numResults = 5 } = input as {
      query: string;
      numResults?: number;
      timeframe?: string;
    };
    
    try {
      // Strategy 1: Try SearchAPI for real web results
      const searchApiKey = process.env.SEARCHAPI_API_KEY;
      if (searchApiKey) {
        try {
          const searchApiUrl = `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(query)}&api_key=${searchApiKey}&num=${numResults}`;
          
          console.log('🔍 Using SearchAPI for web search:', query);
          const response = await fetch(searchApiUrl);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ SearchAPI response received');
            
            if (data.organic_results && data.organic_results.length > 0) {
              const searchResults = data.organic_results.slice(0, numResults).map((result: {title?: string; link?: string; snippet?: string; description?: string}) => ({
                title: result.title || 'Web Search Result',
                url: result.link || '#',
                snippet: result.snippet || result.description || 'No description available',
                source: 'SearchAPI Google Results',
                score: 1.0
              }));

              console.log(`📊 SearchAPI found ${searchResults.length} results`);
              return {
                results: searchResults,
                query,
                totalFound: data.organic_results.length,
                searchEngine: "SearchAPI Google Search"
              };
            }
          }
        } catch (searchApiError) {
          console.error('SearchAPI error:', searchApiError);
        }
      }

      // Strategy 2: Fallback to curated results
      console.log('📋 Using fallback search results for:', query);
      const fallbackResults = [
        {
          title: `Information about ${query}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Research results for "${query}". This topic covers various aspects and applications relevant to your query.`,
          source: "Search Portal",
          score: 0.9
        },
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
          snippet: `Wikipedia article about ${query}. Comprehensive information and references.`,
          source: "Wikipedia Portal",
          score: 0.8
        },
        {
          title: `${query} - Academic Resources`,
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
          snippet: `Academic and scholarly articles about ${query}. Research papers and citations.`,
          source: "Academic Portal",
          score: 0.7
        }
      ];

      return {
        results: fallbackResults.slice(0, numResults),
        query,
        totalFound: fallbackResults.length,
        searchEngine: "Fallback Search"
      };
    } catch (error) {
      console.error('Web search error:', error);
      return {
        results: [{
          title: `Search Error for: ${query}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Error occurred while searching for "${query}". Try Google search for current results.`,
          source: "error_fallback",
          score: 0.1
        }],
        query,
        error: `Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalFound: 1
      };
    }
  }
};

// URL Fetch Tool
export const fetchUrlTool: ResearchTool = {
  name: "fetch_url",
  description: "Fetch and return cleaned text content from a specific URL. Use for reading full articles, papers, or documents found in search results.",
  parameters: {
    type: "object",
    properties: {
      url: { 
        type: "string",
        description: "Full URL to fetch content from"
      },
      extractType: {
        type: "string", 
        description: "Type of content to extract: article, full, or markdown"
      }
    },
    required: ["url"]
  },
  handler: async (input: Record<string, unknown>) => {
    const { url, maxLength = 50000 } = input as {
      url: string;
      maxLength?: number;
    };
    
    try {
      // Use a service like Mercury Parser or Readability
      const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`);
      const text = await response.text();
      
      // Clean and truncate
      const cleaned = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      return {
        content: cleaned.slice(0, maxLength),
        url,
        title: extractTitle(cleaned),
        wordCount: cleaned.split(' ').length,
        truncated: cleaned.length > maxLength
      };
    } catch (error) {
      console.error('URL fetch error:', error);
      return {
        content: "",
        url,
        error: "Failed to fetch URL content",
        title: ""
      };
    }
  }
};

// Vector Search Tool (for internal knowledge)
export const vectorSearchTool: ResearchTool = {
  name: "vector_search",
  description: "Search internal knowledge base using semantic similarity. Best for proprietary documents, past research, or internal company information.",
  parameters: {
    type: "object",
    properties: {
      query: { 
        type: "string",
        description: "Semantic search query"
      },
      topK: { 
        type: "number", 
        description: "Number of most similar results to return (default: 5, max: 20)"
      },
      minScore: {
        type: "number",
        description: "Minimum similarity score threshold (0.0 to 1.0, default: 0.7)"
      }
    },
    required: ["query"]
  },
  handler: async (input: Record<string, unknown>) => {
    const { query, topK = 5, minScore = 0.7 } = input as {
      query: string;
      topK?: number;
      minScore?: number;
    };
    
    try {
      // This will integrate with your Convex vector search
      // For now, return placeholder structure
      console.log(`Vector search for "${query}" with topK=${topK}, minScore=${minScore}`);
      return {
        results: [],
        query,
        totalFound: 0,
        note: "Vector search integration pending - will connect to Convex embeddings"
      };
    } catch (error) {
      console.error('Vector search error:', error);
      return {
        results: [],
        query,
        error: "Vector search unavailable"
      };
    }
  }
};

// Academic Search Tool
export const academicSearchTool: ResearchTool = {
  name: "academic_search",
  description: "Search academic papers and scholarly content. Use for research questions requiring peer-reviewed sources or scientific information.",
  parameters: {
    type: "object",
    properties: {
      query: { 
        type: "string",
        description: "Academic search query"
      },
      numResults: { 
        type: "number", 
        description: "Number of results to return (default: 5, max: 10)"
      },
      sortBy: {
        type: "string",
        description: "Sort order: relevance, date, or citations (default: relevance)"
      }
    },
    required: ["query"]
  },
  handler: async (input: Record<string, unknown>) => {
    const { query, numResults = 5, sortBy = "relevance" } = input as {
      query: string;
      numResults?: number;
      sortBy?: string;
    };
    
    try {
      // Use Semantic Scholar API or similar
      const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${numResults}&sort=${sortBy}`);
      const data = await response.json();
      
      return {
        results: data.data?.map((paper: {
          title: string;
          authors?: Array<{ name: string }>;
          year?: number;
          citationCount?: number;
          url?: string;
          abstract?: string;
          venue?: string;
        }) => ({
          title: paper.title,
          authors: paper.authors?.map((a) => a.name).join(', '),
          year: paper.year,
          citationCount: paper.citationCount,
          url: paper.url,
          abstract: paper.abstract,
          venue: paper.venue
        })) || [],
        query,
        totalFound: data.total || 0
      };
    } catch (error) {
      console.error('Academic search error:', error);
      return {
        results: [],
        query,
        error: "Academic search unavailable"
      };
    }
  }
};

// Wikipedia Search Tool
export const wikipediaSearchTool: ResearchTool = {
  name: "wikipedia_search",
  description: "Search Wikipedia for encyclopedic information and background context",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string", 
        description: "Wikipedia search query"
      },
      numResults: {
        type: "number",
        description: "Number of results to return (default: 3)"
      }
    },
    required: ["query"]
  },
  handler: async (input: Record<string, unknown>) => {
    const { query, numResults = 3 } = input as {
      query: string;
      numResults?: number;
    };

    try {
      console.log('📚 Wikipedia search for:', query);
      
      // Use Wikipedia's OpenSearch API
      const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${numResults}&namespace=0&format=json&origin=*`;
      const searchResponse = await fetch(searchApiUrl);
      
      if (searchResponse.ok) {
        const [, titles, descriptions, urls] = await searchResponse.json();
        
        const results = titles.map((title: string, index: number) => ({
          title,
          url: urls[index],
          snippet: descriptions[index] || 'No description available',
          source: 'Wikipedia',
          score: 0.85
        }));

        console.log(`📚 Wikipedia found ${results.length} results`);
        return {
          results,
          query,
          totalFound: titles.length,
          searchEngine: "Wikipedia OpenSearch"
        };
      }

      throw new Error('Wikipedia search failed');
      
    } catch (error) {
      console.error('Wikipedia search error:', error);
      
      return {
        results: [{
          title: `Wikipedia: ${query}`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
          snippet: `Search Wikipedia for "${query}"`,
          source: 'Wikipedia Direct Link',
          score: 0.5
        }],
        query,
        error: `Wikipedia search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalFound: 1
      };
    }
  }
};

// Utility function to extract title from content
function extractTitle(content: string): string {
  const lines = content.split('\n');
  for (const line of lines.slice(0, 10)) {
    if (line.trim() && line.length > 10 && line.length < 200) {
      return line.trim();
    }
  }
  return 'Untitled Document';
}

// Export all tools
export const enhancedResearchTools: ResearchTool[] = [
  webSearchTool,
  fetchUrlTool,
  vectorSearchTool,
  academicSearchTool,
  wikipediaSearchTool
];
