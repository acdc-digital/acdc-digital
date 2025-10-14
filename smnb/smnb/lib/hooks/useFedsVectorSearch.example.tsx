/**
 * FEDS Vector Search Hook Example
 * 
 * Example React hook for using FEDS vector search in the UI.
 * Place in: lib/hooks/useFedsVectorSearch.tsx
 */

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

/**
 * Hook for performing semantic search on FEDS corpus
 */
export function useFedsVectorSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const semanticSearch = useAction(api.feds.embeddings.semanticSearch);

  const search = async (
    query: string,
    options?: {
      category?: string;
      limit?: number;
      minScore?: number;
    }
  ) => {
    setIsSearching(true);
    setError(null);

    try {
      const result = await semanticSearch({
        query,
        category: options?.category,
        verificationStatus: "verified",
        limit: options?.limit || 5,
        minScore: options?.minScore || 0.7,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    search,
    isSearching,
    error,
  };
}

/**
 * Hook for getting FEDS corpus statistics
 */
export function useFedsStats() {
  return useQuery(api.feds.documents.getStats);
}

/**
 * Example: Using vector search in a chat interface
 */
export function useChatWithFedsContext() {
  const { search } = useFedsVectorSearch();

  const enrichMessageWithContext = async (userMessage: string) => {
    // Search for relevant context
    const contextResults = await search(userMessage, {
      limit: 3,
      minScore: 0.75,
    });

    // Format context for the AI
    const contextStr = contextResults.results
      .map((doc) => `[${doc.category}] ${doc.title}: ${doc.summary || doc.content.substring(0, 200)}`)
      .join("\n\n");

    // Return enriched message with context
    return {
      userMessage,
      context: contextStr,
      sources: contextResults.results.map((r) => ({
        id: r.documentId,
        title: r.title,
        category: r.category,
      })),
    };
  };

  return { enrichMessageWithContext };
}
