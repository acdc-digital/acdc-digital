"use node";

/**
 * Context Retrieval Action
 *
 * Retrieves relevant context for a query by:
 * 1. Generating query embedding using OpenAI
 * 2. Searching vector store (chat + document embeddings)
 * 3. Returning ranked results by relevance
 */

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";

// Type for search results from searchEmbeddings query
interface SearchResult {
  _id: Id<"embeddings">;
  sessionId: string;
  sourceType?: "chat" | "document";
  messageId?: string;
  documentId?: Id<"documents">;
  chunkIndex?: number;
  text: string;
  vector: number[];
  model: string;
  score: number;
  createdAt: number;
}/**
 * Fetch embedding vector from OpenAI API
 */
async function fetchQueryEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small", // 1536 dimensions for all embeddings
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Retrieve context for a query from vector store
 *
 * Performs hybrid search across:
 * - Chat history embeddings (sourceType: "chat")
 * - Document embeddings (sourceType: "document")
 */
export default action({
  args: {
    sessionId: v.string(),
    query: v.string(),
    // Search configuration
    includeChatHistory: v.optional(v.boolean()), // Include chat embeddings (default: true)
    includeDocuments: v.optional(v.boolean()), // Include document embeddings (default: true)
    globalDocuments: v.optional(v.boolean()), // Search all documents across sessions (default: true)
    topK: v.optional(v.number()), // Results per source type (default: 5)
    minScore: v.optional(v.number()), // Minimum similarity threshold (0-1, default: 0.5)
  },
  handler: async (ctx, args): Promise<{
    chatContext: Array<{
      _id: Id<"embeddings">;
      text: string;
      messageId?: string;
      score: number;
      createdAt: number;
    }>;
    documentContext: Array<{
      _id: Id<"embeddings">;
      text: string;
      documentId?: Id<"documents">;
      documentName?: string;
      chunkIndex?: number;
      score: number;
      createdAt: number;
    }>;
    totalResults: number;
    queryEmbeddingTime: number;
    searchTime: number;
  }> => {
    const {
      sessionId,
      query,
      includeChatHistory = true,
      includeDocuments = true,
      globalDocuments = true, // Default to searching all documents
      topK = 5,
      minScore = 0.5,
    } = args;

    console.log(`[retrieveContext] Starting context retrieval for session ${sessionId}`);
    console.log(`[retrieveContext] Query: "${query}"`);
    console.log(`[retrieveContext] Config: chat=${includeChatHistory}, docs=${includeDocuments}, global=${globalDocuments}, topK=${topK}, minScore=${minScore}`);

    const startTime = Date.now();

    // Step 1: Generate query embedding (1536 dims - same for all)
    const embeddingStartTime = Date.now();
    const queryVector = await fetchQueryEmbedding(query);
    const queryEmbeddingTime = Date.now() - embeddingStartTime;
    
    console.log(`[retrieveContext] Generated query embedding (${queryVector.length} dims) in ${queryEmbeddingTime}ms`);

    // Step 2: Search chat history embeddings
    const searchStartTime = Date.now();
    const chatResults: Array<{
      _id: Id<"embeddings">;
      text: string;
      messageId?: string;
      score: number;
      createdAt: number;
    }> = [];

    if (includeChatHistory) {
      const chatSearchResults = await ctx.runQuery(internal.nexus.embeddings.searchEmbeddings, {
        sessionId,
        queryVector,
        sourceType: "chat" as const,
        topK,
      });

      const filteredChat = chatSearchResults
        .filter((r: SearchResult) => r.score >= minScore)
        .map((r: SearchResult) => ({
          _id: r._id,
          text: r.text,
          messageId: r.messageId,
          score: r.score,
          createdAt: r.createdAt,
        }));

      chatResults.push(...filteredChat);
      console.log(`[retrieveContext] Found ${chatResults.length} chat results above threshold`);
    }

    // Step 3: Search document embeddings (global or session-scoped)
    const docResults: Array<{
      _id: Id<"embeddings">;
      text: string;
      documentId?: Id<"documents">;
      documentName?: string;
      chunkIndex?: number;
      score: number;
      createdAt: number;
    }> = [];

    if (includeDocuments) {
      // Use global search if enabled, otherwise session-scoped
      const docSearchResults = globalDocuments
        ? await ctx.runQuery(internal.nexus.embeddings.searchDocumentsGlobal, {
            queryVector,
            topK,
          })
        : await ctx.runQuery(internal.nexus.embeddings.searchEmbeddings, {
            sessionId,
            queryVector,
            sourceType: "document" as const,
            topK,
          });

      console.log(`[retrieveContext] Document search (${globalDocuments ? 'global' : 'session-scoped'}) returned ${docSearchResults.length} results`);
      
      // Log scores for debugging
      if (docSearchResults.length > 0) {
        console.log(`[retrieveContext] Top document scores:`, docSearchResults.slice(0, 3).map((r: SearchResult) => ({
          score: r.score,
          textPreview: r.text.substring(0, 100),
        })));
      }

      // Get document names for each result
      const docResultsWithNames = await Promise.all(
        docSearchResults
          .filter((r: SearchResult) => {
            const passes = r.score >= minScore;
            if (!passes) {
              console.log(`[retrieveContext] Filtered out result with score ${r.score} (below threshold ${minScore})`);
            }
            return passes;
          })
          .map(async (r: SearchResult) => {
            let documentName: string | undefined;
            if (r.documentId) {
              const doc = await ctx.runQuery(internal.nexus.documents.getDocument, {
                documentId: r.documentId,
              });
              documentName = doc?.name;
            }

            return {
              _id: r._id,
              text: r.text,
              documentId: r.documentId,
              documentName,
              chunkIndex: r.chunkIndex,
              score: r.score,
              createdAt: r.createdAt,
            };
          })
      );

      docResults.push(...docResultsWithNames);
      console.log(`[retrieveContext] Found ${docResults.length} document results above threshold (minScore: ${minScore})`);
    }

    const searchTime = Date.now() - searchStartTime;
    const totalTime = Date.now() - startTime;

    console.log(`[retrieveContext] Search completed in ${searchTime}ms (total: ${totalTime}ms)`);
    console.log(`[retrieveContext] Returning ${chatResults.length} chat + ${docResults.length} document results`);

    return {
      chatContext: chatResults,
      documentContext: docResults,
      totalResults: chatResults.length + docResults.length,
      queryEmbeddingTime,
      searchTime,
    };
  },
});
