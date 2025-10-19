"use node";

import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";

/**
 * Fetch embedding from OpenAI API
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
      model: "text-embedding-3-small",
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
 * Generate embeddings for texts and save to Convex
 */
export default action({
  args: {
    sessionId: v.string(),
    messageId: v.optional(v.string()),
    texts: v.array(v.string()),
  },
  returns: v.object({ created: v.number() }),
  handler: async (ctx, args) => {
    const { sessionId, messageId, texts } = args;

    if (texts.length === 0) {
      return { created: 0 };
    }

    let created = 0;
    for (const text of texts) {
      try {
        // Fetch embedding from OpenAI
        const vector = await fetchEmbedding(text);

        // Save to Convex
        await ctx.runMutation(api.nexus.embeddings.createEmbedding, {
          sessionId,
          sourceType: "chat",
          messageId,
          text,
          vector,
          model: "text-embedding-3-small",
          metadata: JSON.stringify({ source: "sessionManager" }),
        });
        created++;
      } catch (error) {
        console.error(`Failed to generate embedding for text: ${text}`, error);
      }
    }

    return { created };
  },
});
