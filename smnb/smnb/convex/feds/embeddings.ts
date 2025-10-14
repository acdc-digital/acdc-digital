/**
 * FEDS Embeddings - Generate embeddings and perform vector search
 * 
 * Actions for generating embeddings using OpenAI and performing
 * semantic search over the FEDS document corpus.
 */

"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Type for OpenAI embedding response
interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate embedding for text using OpenAI API
 */
export const generateEmbedding = action({
  args: {
    text: v.string(),
    model: v.optional(v.string()),
  },
  returns: v.object({
    embedding: v.array(v.number()),
    model: v.string(),
    tokenUsage: v.number(),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }

    const model = args.model || "text-embedding-3-small";
    
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: args.text,
          model: model,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json() as OpenAIEmbeddingResponse;
      
      if (!data.data || data.data.length === 0) {
        throw new Error("No embedding returned from OpenAI");
      }

      return {
        embedding: data.data[0].embedding,
        model: data.model,
        tokenUsage: data.usage.total_tokens,
      };
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  },
});

/**
 * Create a document with auto-generated embedding
 */
export const createWithEmbedding = action({
  args: {
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    documentType: v.union(
      v.literal("statistic"),
      v.literal("report"),
      v.literal("guideline"),
      v.literal("policy"),
      v.literal("fact")
    ),
    category: v.string(),
    tags: v.array(v.string()),
    source: v.optional(v.string()),
    relevanceScore: v.optional(v.number()),
    verificationStatus: v.optional(v.union(
      v.literal("verified"),
      v.literal("pending"),
      v.literal("draft")
    )),
  },
  returns: v.object({
    documentId: v.id("feds_documents"),
    tokenUsage: v.number(),
  }),
  handler: async (ctx, args) => {
    // Generate embedding for the content
    const embeddingResult = await ctx.runAction(api.feds.embeddings.generateEmbedding, {
      text: args.content,
    });

    // Create the document with the embedding
    const documentId = await ctx.runMutation(api.feds.documents.create, {
      title: args.title,
      content: args.content,
      summary: args.summary,
      documentType: args.documentType,
      category: args.category,
      tags: args.tags,
      source: args.source,
      embedding: embeddingResult.embedding,
      embeddingModel: embeddingResult.model,
      relevanceScore: args.relevanceScore,
      verificationStatus: args.verificationStatus || "draft",
    });

    return {
      documentId,
      tokenUsage: embeddingResult.tokenUsage,
    };
  },
});

/**
 * Semantic search - query with natural language
 */
export const semanticSearch = action({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    documentType: v.optional(v.union(
      v.literal("statistic"),
      v.literal("report"),
      v.literal("guideline"),
      v.literal("policy"),
      v.literal("fact")
    )),
    verificationStatus: v.optional(v.union(
      v.literal("verified"),
      v.literal("pending"),
      v.literal("draft")
    )),
    limit: v.optional(v.number()),
    minScore: v.optional(v.number()),
  },
  returns: v.object({
    results: v.array(v.object({
      documentId: v.id("feds_documents"),
      title: v.string(),
      content: v.string(),
      summary: v.optional(v.string()),
      category: v.string(),
      tags: v.array(v.string()),
      documentType: v.union(
        v.literal("statistic"),
        v.literal("report"),
        v.literal("guideline"),
        v.literal("policy"),
        v.literal("fact")
      ),
      similarityScore: v.number(),
      relevanceScore: v.optional(v.number()),
    })),
    query: v.string(),
    totalFound: v.number(),
    tokenUsage: v.number(),
  }),
  handler: async (ctx, args) => {
    // Generate embedding for the query
    const embeddingResult = await ctx.runAction(api.feds.embeddings.generateEmbedding, {
      text: args.query,
    });

    // Perform vector search
    const searchResults = await ctx.runQuery(api.feds.documents.vectorSearch, {
      embedding: embeddingResult.embedding,
      category: args.category,
      documentType: args.documentType,
      verificationStatus: args.verificationStatus || "verified", // Default to verified docs
      limit: args.limit || 10,
    });

    // Filter by minimum score if provided
    const minScore = args.minScore || 0.7;
    const filteredResults = searchResults.filter(r => r._score >= minScore);

    // Track access for returned documents
    for (const result of filteredResults) {
      await ctx.runMutation(internal.feds.documents.trackAccess, {
        documentId: result._id,
      });
    }

    // Format results
    const results = filteredResults.map(r => ({
      documentId: r._id,
      title: r.title,
      content: r.content,
      summary: r.summary,
      category: r.category,
      tags: r.tags,
      documentType: r.documentType,
      similarityScore: r._score,
      relevanceScore: r.relevanceScore,
    }));

    return {
      results,
      query: args.query,
      totalFound: results.length,
      tokenUsage: embeddingResult.tokenUsage,
    };
  },
});

/**
 * Batch generate embeddings for multiple documents
 */
export const batchGenerateEmbeddings = action({
  args: {
    documentIds: v.array(v.id("feds_documents")),
  },
  returns: v.object({
    success: v.number(),
    failed: v.number(),
    totalTokenUsage: v.number(),
  }),
  handler: async (ctx, args) => {
    let success = 0;
    let failed = 0;
    let totalTokenUsage = 0;

    for (const documentId of args.documentIds) {
      try {
        // Get the document
        const doc = await ctx.runQuery(api.feds.documents.get, { documentId });
        
        if (!doc) {
          console.log(`Document ${documentId} not found`);
          failed++;
          continue;
        }

        // Generate embedding
        const embeddingResult = await ctx.runAction(api.feds.embeddings.generateEmbedding, {
          text: doc.content,
        });

        // Update document with new embedding
        await ctx.runMutation(api.feds.documents.update, {
          documentId,
          embedding: embeddingResult.embedding,
          embeddingModel: embeddingResult.model,
        });

        success++;
        totalTokenUsage += embeddingResult.tokenUsage;
      } catch (error) {
        console.error(`Failed to generate embedding for ${documentId}:`, error);
        failed++;
      }
    }

    return {
      success,
      failed,
      totalTokenUsage,
    };
  },
});
