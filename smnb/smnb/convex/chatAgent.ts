import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const generateAIResponse = action({
  args: {
    sessionId: v.id("sessions"),
    userMessage: v.string(),
    conversationHistory: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }))),
  },
  returns: v.object({
    success: v.boolean(),
    messageId: v.optional(v.id("messages")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    messageId?: Id<"messages">;
    error?: string;
  }> => {
    try {
      // Check if Anthropic API key is available
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error("ANTHROPIC_API_KEY not configured");
        const messageId: Id<"messages"> = await ctx.runMutation(api.messages.insertAssistantMessage, {
          sessionId: args.sessionId,
          content: "I'm not properly configured to connect to Claude AI. Please check the ANTHROPIC_API_KEY environment variable."
        });
        
        return {
          success: false,
          messageId,
          error: "ANTHROPIC_API_KEY not configured"
        };
      }

      // Import Anthropic SDK directly
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Prepare the conversation history
      const messages = [
        ...(args.conversationHistory || []),
        { role: 'user' as const, content: args.userMessage }
      ];

      // Determine if this is a command or regular chat
      let systemPrompt = 'You are a helpful AI assistant in a session management context. Provide clear, informative, and engaging responses.';
      let temperature = 0.7;
      let maxTokens = 1000;
      let responseContent: string;

      // Check for special commands
      if (args.userMessage.startsWith('/analyze')) {
        const textToAnalyze = args.userMessage.replace('/analyze', '').trim();
        systemPrompt = 'You are an expert content analyzer. Provide structured analysis of text content including sentiment, intent, key topics, emotional tone, and actionable insights.';
        temperature = 0.3;
        maxTokens = 800;
        
        messages[messages.length - 1].content = `Analyze this text for sentiment, intent, and key topics: "${textToAnalyze}"

Provide a structured analysis including:
1. Sentiment (positive, negative, or neutral)
2. Main intent or purpose
3. Key topics and themes
4. Emotional tone
5. Any actionable insights`;
      } else if (args.userMessage.startsWith('/session-chat')) {
        const actualMessage = args.userMessage.replace('/session-chat', '').trim();
        systemPrompt = 'You are a helpful AI assistant with session awareness. You are participating in an ongoing conversation within a session management context. Provide clear, informative, and engaging responses while being aware that this is part of a longer conversation. Reference previous context when appropriate and maintain conversational continuity.';
        maxTokens = 1200;
        
        if (actualMessage) {
          messages[messages.length - 1].content = actualMessage;
        }
      } else if (args.userMessage.startsWith('/help-chat')) {
        // Return help content directly without calling API
        responseContent = `🤖 **Session Chat Agent Help**

**Available Commands:**
• \`/chat <message>\` - General conversation
• \`/session-chat <message>\` - Session-aware conversation
• \`/analyze <text>\` - Content analysis and insights
• \`/help-chat\` - Show this help

**Features:**
✨ Real-time AI responses using Claude
🧠 Session-aware conversations
📊 Content analysis and sentiment detection
💾 Automatic conversation storage
🔒 Context preservation across sessions

**Examples:**
• \`/chat What are the latest trends in AI?\`
• \`/session-chat Continue our previous discussion\`
• \`/analyze This product is amazing and works perfectly!\`

**Tips:**
- Use \`/chat\` for quick questions
- Use \`/session-chat\` when you want to maintain conversation context
- Use \`/analyze\` to understand sentiment and themes in text
- All conversations are automatically saved to your session

Type any command to get started!`;
      } else if (args.userMessage.startsWith('/chat')) {
        const actualMessage = args.userMessage.replace('/chat', '').trim();
        if (actualMessage) {
          messages[messages.length - 1].content = actualMessage;
        }
      }

      // Generate response using Claude API directly (unless it's help command)
      if (!args.userMessage.startsWith('/help-chat')) {
        console.log("🤖 Calling Claude API directly...");
        
        // Retry logic for API calls
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second base delay
        const startTime = Date.now();
        const requestId = `chat_${args.sessionId}_${startTime}`;
        
        while (retryCount < maxRetries) {
          try {
            const response = await anthropic.messages.create({
              model: "claude-3-5-haiku-20241022",
              max_tokens: maxTokens,
              temperature,
              system: systemPrompt,
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            });

            if (response.content && response.content.length > 0 && response.content[0].type === 'text') {
              responseContent = response.content[0].text;
              const duration = Date.now() - startTime;
              console.log("✅ Claude API response received:", responseContent.substring(0, 100) + "...");
              
              // Log token usage for monitoring and billing
              if (response.usage) {
                const inputTokens = response.usage.input_tokens;
                const outputTokens = response.usage.output_tokens;
                
                // Calculate estimated cost (approximate rates for Claude 3.5 Haiku)
                const inputCostPer1K = 0.00025; // $0.25 per 1K input tokens
                const outputCostPer1K = 0.00125; // $1.25 per 1K output tokens
                const estimatedCost = (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;
                
                console.log("📊 Token usage:", {
                  input_tokens: inputTokens,
                  output_tokens: outputTokens,
                  total_tokens: inputTokens + outputTokens,
                  estimated_cost: estimatedCost,
                  duration: duration,
                  model: "claude-3-5-haiku-20241022"
                });
                
                // Store token usage in database
                try {
                  await ctx.runMutation(api.messages.logTokenUsage, {
                    requestId,
                    model: "claude-3-5-haiku-20241022",
                    action: args.userMessage.startsWith('/analyze') ? "analyze" : "generate",
                    inputTokens,
                    outputTokens,
                    estimatedCost,
                    sessionId: args.sessionId,
                    duration,
                    success: true,
                  });
                  console.log("💰 Token usage logged successfully");
                } catch (tokenError) {
                  console.warn("⚠️ Failed to log token usage:", tokenError);
                }
              }
              
              break; // Success - exit retry loop
            } else {
              throw new Error("Invalid response format from Claude API");
            }
          } catch (apiError: unknown) {
            const error = apiError as { status?: number; error?: { error?: { type?: string } }; message?: string };
            retryCount++;
            const duration = Date.now() - startTime;
            console.log(`⚠️ Claude API attempt ${retryCount}/${maxRetries} failed:`, error.status || 'unknown', error.error?.error?.type || error.message);
            
            // Log failed attempts
            if (retryCount === maxRetries) {
              try {
                await ctx.runMutation(api.messages.logTokenUsage, {
                  requestId,
                  model: "claude-3-5-haiku-20241022",
                  action: args.userMessage.startsWith('/analyze') ? "analyze" : "generate",
                  inputTokens: 0,
                  outputTokens: 0,
                  estimatedCost: 0,
                  sessionId: args.sessionId,
                  duration,
                  success: false,
                  errorMessage: error.message || `API Error ${error.status}`,
                });
                console.log("📝 Failed request logged for tracking");
              } catch (logError) {
                console.warn("Failed to log error:", logError);
              }
            }
            
            // Check if this is a retryable error
            const isRetryable = error.status === 529 || // Overloaded
                               error.status === 503 || // Service unavailable
                               error.status === 502 || // Bad gateway
                               error.error?.error?.type === 'overloaded_error';
            
            if (retryCount >= maxRetries || !isRetryable) {
              // Provide user-friendly error messages
              if (error.status === 529 || error.error?.error?.type === 'overloaded_error') {
                responseContent = "🤖 Claude AI is experiencing high demand right now. I'll be back to full capacity shortly! In the meantime, you can try:\n\n• `/help-chat` for available commands\n• Asking simpler questions\n• Trying again in a few minutes\n\nThank you for your patience! 🙏";
              } else if (error.status === 401) {
                responseContent = "🔐 There's an authentication issue with the AI service. Please contact support.";
              } else if (error.status === 400) {
                responseContent = "⚠️ Your message couldn't be processed. Please try rephrasing it or use `/help-chat` for guidance.";
              } else {
                responseContent = `🔧 I'm experiencing technical difficulties (Error ${error.status || 'unknown'}). Please try again in a moment or use \`/help-chat\` for available commands.`;
              }
              console.log("🛑 All retries exhausted or non-retryable error. Using fallback response.");
              break;
            }
            
            // Wait before retrying (exponential backoff)
            const delay = retryDelay * Math.pow(2, retryCount - 1);
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // Insert the response into the database using the mutation
      const messageId: Id<"messages"> = await ctx.runMutation(api.messages.insertAssistantMessage, {
        sessionId: args.sessionId,
        content: responseContent!
      });

      return {
        success: true,
        messageId
      };

    } catch (error) {
      console.error("AI response generation error:", error);
      
      // Insert error response
      try {
        const messageId: Id<"messages"> = await ctx.runMutation(api.messages.insertAssistantMessage, {
          sessionId: args.sessionId,
          content: "I'm experiencing some technical difficulties. Please try again in a moment."
        });
        
        return {
          success: false,
          messageId,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      } catch (insertError) {
        console.error("Failed to insert error message:", insertError);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  },
});