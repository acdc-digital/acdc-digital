"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../../_generated/api";

/**
 * Extract text from PDF buffer using pdf-parse-fork
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse-fork");
    const data = await pdfParse(buffer);
    
    console.log(`[extractPdfText] PDF has ${data.numpages} pages`);
    console.log(`[extractPdfText] Extracted ${data.text.length} characters total`);
    
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch embedding from OpenAI API (using text-embedding-3-small for consistency)
 */
async function fetchEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const result = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small", // Changed to small for consistency with chat
      input: [text],
    }),
  });

  if (!result.ok) {
    throw new Error(`OpenAI API error: ${result.statusText}`);
  }

  const jsonResults = await result.json();
  return jsonResults.data[0].embedding;
}

/**
 * Simple text chunking: split by paragraphs/sentences with overlap
 */
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  
  // Split by double newlines (paragraphs) first
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = "";
  
  for (const para of paragraphs) {
    // If adding this paragraph would exceed chunk size
    if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Create overlap by taking last `overlap` characters
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + "\n\n" + para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no chunks created (single paragraph), split by character count
  if (chunks.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
  }
  
  return chunks;
}

/**
 * Process uploaded document: extract text, chunk, generate embeddings
 */
export default action({
  args: {
    documentId: v.id("documents"),
    storageId: v.string(),
    fileType: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    chunksProcessed: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.nexus.documents.updateDocumentStatus, {
        documentId: args.documentId,
        status: "processing",
      });

      // Get document details
      const document = await ctx.runQuery(internal.nexus.documents.getDocument, {
        documentId: args.documentId,
      });

      if (!document) {
        throw new Error("Document not found");
      }

      console.log(`[processDocument] Processing document: ${document.name} (${args.fileType})`);

      // Download file from storage
      const fileBlob = await ctx.storage.get(args.storageId);
      if (!fileBlob) {
        throw new Error("File not found in storage");
      }

      // Convert blob to buffer for processing
      const arrayBuffer = await fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`[processDocument] Downloaded file: ${buffer.length} bytes`);

      // Extract text based on file type
      let text = "";
      
      if (args.fileType === "application/pdf") {
        console.log(`[processDocument] Extracting text from PDF...`);
        text = await extractPdfText(buffer);
        console.log(`[processDocument] Extracted ${text.length} characters from PDF`);
      } else if (args.fileType === "text/plain") {
        text = buffer.toString('utf-8');
        console.log(`[processDocument] Read ${text.length} characters from text file`);
      } else {
        throw new Error(`Unsupported file type: ${args.fileType}`);
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text content extracted from file");
      }

      // Chunk the text
      const chunks = chunkText(text, 1000, 200);
      console.log(`[processDocument] Created ${chunks.length} chunks from document`);

      // Generate embeddings for each chunk
      let processed = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          console.log(`[processDocument] Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
          
          // Generate embedding
          const vector = await fetchEmbedding(chunk);

          // Save to Convex
          await ctx.runMutation(api.nexus.embeddings.createEmbedding, {
            sessionId: document.sessionId,
            sourceType: "document",
            documentId: args.documentId,
            chunkIndex: i,
            text: chunk,
            vector,
            model: "text-embedding-3-small", // Changed to small for consistency
            metadata: JSON.stringify({
              source: "document",
              fileName: document.name,
              chunkSize: chunk.length,
              totalChunks: chunks.length,
            }),
          });
          
          processed++;
        } catch (error) {
          console.error(`[processDocument] Failed to process chunk ${i}:`, error);
          // Continue processing other chunks
        }
      }

      console.log(`[processDocument] Successfully processed ${processed}/${chunks.length} chunks`);

      // Update document status to ready
      await ctx.runMutation(api.nexus.documents.updateDocumentStatus, {
        documentId: args.documentId,
        status: "ready",
        chunkCount: processed,
      });

      return {
        success: true,
        chunksProcessed: processed,
      };
    } catch (error) {
      // Update document status to error
      await ctx.runMutation(api.nexus.documents.updateDocumentStatus, {
        documentId: args.documentId,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        chunksProcessed: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
