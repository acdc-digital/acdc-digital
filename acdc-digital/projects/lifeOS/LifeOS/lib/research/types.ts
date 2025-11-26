// RESEARCH TYPES - Core types for research agent system
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/research/types.ts

export interface ResearchQuery {
  id: string;
  userId: string;
  query: string;
  complexity: 'simple' | 'medium' | 'complex';
  status: 'pending' | 'researching' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
}

export interface ResearchResult {
  id: string;
  queryId: string;
  summary: string;
  keyPoints: string[];
  citations: Citation[];
  confidence: number;
  tokensUsed: number;
  timeElapsed: number;
  createdAt: number;
}

export interface Citation {
  title: string;
  url?: string;
  sourceType: 'web' | 'document' | 'internal' | 'academic' | 'disclosure' | 'news' | 'reference' | 'other';
  snippet?: string;
  confidence: number;
  dateAccessed: number;
}

export interface ResearchTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
  handler: (input: Record<string, unknown>) => Promise<unknown>;
}

export interface SubAgentTask {
  id: string;
  parentQueryId: string;
  task: string;
  objective: string;
  toolsToUse: string[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  results?: Record<string, unknown>;
  tokensUsed: number;
  createdAt: number;
}

export interface ResearchPlan {
  id: string;
  queryId: string;
  approach: string;
  subTasks: string[];
  estimatedComplexity: number;
  estimatedTime: number;
  toolsRequired: string[];
}

export interface ResearchMemory {
  id: string;
  queryId: string;
  key: string;
  value: unknown;
  type: 'plan' | 'findings' | 'context' | 'metadata';
  createdAt: number;
}
