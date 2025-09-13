"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Content transformation action that directly updates the document
export const transformContent = action({
  args: {
    documentId: v.id("documents"),
    contentType: v.union(
      v.literal("newsletter"),
      v.literal("blog"),
      v.literal("analysis"),
      v.literal("social"),
      v.literal("context")
    ),
    currentContent: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    transformedContent: v.string(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Get transformation prompt based on content type
      const systemPrompt = getTransformationPrompt(args.contentType);
      
      console.log(`Transforming content to ${args.contentType} format`);
      console.log(`Current content length: ${args.currentContent.length}`);

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Transform this content to ${args.contentType} format:

${args.currentContent}`
        }],
      });

      let transformedContent = "";
      
      // Extract the transformed content from the response
      for (const contentBlock of response.content) {
        if (contentBlock.type === "text") {
          transformedContent += contentBlock.text;
        }
      }

      if (!transformedContent) {
        throw new Error("No content generated from AI response");
      }

      console.log(`Generated transformed content length: ${transformedContent.length}`);

      // Update the document with the transformed content
      await ctx.runMutation(api.sharedDocument.updateDocumentContent, {
        documentId: args.documentId,
        content: transformedContent,
      });

      console.log(`Successfully updated document ${args.documentId} with transformed content`);

      return {
        success: true,
        transformedContent,
      };

    } catch (error) {
      console.error("Error transforming content:", error);
      return {
        success: false,
        transformedContent: args.currentContent,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

// Get transformation prompts for different content types
function getTransformationPrompt(contentType: string): string {
  const baseInstructions = `You are a professional content transformation specialist. Transform the provided content while preserving all key information and facts. Return only the transformed content in HTML format suitable for a rich text editor.`;

  switch (contentType) {
    case "newsletter":
      return `${baseInstructions}

Transform the content into an engaging newsletter format with:
- A compelling subject line as an H1 heading
- A warm, personal greeting
- Clear, scannable sections with descriptive headings
- Bullet points or numbered lists where appropriate
- A friendly, conversational tone
- A clear call-to-action or next steps
- Newsletter-style formatting with proper HTML structure

Focus on making the content engaging and easy to read for email subscribers.`;

    case "blog":
      return `${baseInstructions}

Transform the content into a comprehensive blog post format with:
- An SEO-optimized title as an H1 heading
- An engaging introduction that hooks the reader
- Well-structured content with H2 and H3 headings
- A logical narrative flow with smooth transitions
- Engaging paragraphs with good readability
- A strong conclusion with key takeaways
- Proper HTML formatting for web publication

Focus on creating engaging, informative content that provides value to readers.`;

    case "analysis":
      return `${baseInstructions}

Transform the content into a structured analytical report with:
- An executive summary at the beginning
- Clear methodology and data sources
- Evidence-based insights and findings
- Logical argumentation and reasoning
- Data points and statistics where relevant
- Clear conclusions and recommendations
- Professional, objective tone
- Proper HTML structure with headings and sections

Focus on providing thorough, data-driven analysis that supports decision-making.`;

    case "social":
      return `${baseInstructions}

Transform the content into social media-optimized format with:
- Engaging, attention-grabbing opening
- Concise, punchy language
- Key points broken into digestible chunks
- Hashtag suggestions (in a separate section)
- Call-to-action for engagement
- Platform-agnostic but social-first approach
- Shorter paragraphs and sentences
- Visual content suggestions where appropriate

Focus on creating shareable, engaging content that encourages interaction.`;

    case "context":
      return `${baseInstructions}

Transform the content into a comprehensive contextual overview with:
- Background information and setting
- Key stakeholders and their roles
- Timeline of relevant events
- Dependencies and relationships
- Strategic implications and significance
- Broader context and connections
- Clear explanations of complex topics
- Proper HTML structure with informative headings

Focus on providing comprehensive background that helps readers understand the full picture.`;

    default:
      return `${baseInstructions}

Transform the content to improve clarity, structure, and readability while preserving all key information. Use proper HTML formatting with headings, paragraphs, and lists as appropriate.`;
  }
}