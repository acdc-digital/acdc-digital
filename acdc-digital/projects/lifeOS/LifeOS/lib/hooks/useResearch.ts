// RESEARCH HOOKS - Custom hooks for research data operations
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/hooks/useResearch.ts

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface ResearchSessionData {
  _id: string;
  sessionId: string;
  originalQuery: string;
  generatedTitle: string;
  complexity: "simple" | "medium" | "complex";
  status: "pending" | "researching" | "completed" | "failed";
  summary?: string;
  keyPoints?: string[];
  citations?: Array<{
    title: string;
    url?: string;
    sourceType: "web" | "academic" | "document" | "internal" | "disclosure" | "news" | "reference" | "other";
    snippet?: string;
    confidence: number;
    dateAccessed: number;
  }>;
  confidence?: number;
  tokensUsed?: number;
  timeElapsed?: number;
  researchPlan?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export function useResearch(userId?: string) {
  // Queries
  const researchSessions = useQuery(api.research.getUserResearchSessions, {
    userId,
    status: "all", // Show all sessions, not just completed ones
    limit: 20,
  });

  const researchStats = useQuery(api.research.getUserResearchStats, {
    userId,
  });

  // Mutations
  const createSession = useMutation(api.research.createResearchSession);
  const updateSession = useMutation(api.research.updateResearchSession);
  const deleteSession = useMutation(api.research.deleteResearchSession);

  // Helper functions
  const createResearchSession = async (data: {
    sessionId: string;
    originalQuery: string;
    generatedTitle: string;
    complexity: "simple" | "medium" | "complex";
    userId?: string;
  }) => {
    try {
      return await createSession(data);
    } catch (error) {
      console.error("Failed to create research session:", error);
      throw error;
    }
  };

  const updateResearchSession = async (sessionId: string, updates: {
    status?: "pending" | "researching" | "completed" | "failed";
    summary?: string;
    keyPoints?: string[];
    citations?: Array<{
      title: string;
      url?: string;
      sourceType: "web" | "academic" | "document" | "internal" | "disclosure" | "news" | "reference" | "other";
      snippet?: string;
      confidence: number;
      dateAccessed: number;
    }>;
    confidence?: number;
    tokensUsed?: number;
    timeElapsed?: number;
    researchPlan?: string;
    error?: string;
  }) => {
    try {
      return await updateSession({ sessionId, ...updates });
    } catch (error) {
      console.error("Failed to update research session:", error);
      throw error;
    }
  };

  const deleteResearchSession = async (sessionId: string, userId?: string) => {
    try {
      return await deleteSession({ sessionId, userId });
    } catch (error) {
      console.error("Failed to delete research session:", error);
      throw error;
    }
  };

  return {
    // Data
    researchSessions,
    researchStats,
    
    // Actions
    createResearchSession,
    updateResearchSession,
    deleteResearchSession,
    
    // Utilities
    isLoading: researchSessions === undefined,
  };
}
