/**
 * AI Service - Anthropic Claude Integrat    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        tools: [
          {
            type: 'text_editor_20241022',
              case 'newsletter-format':
        return `CRITICAL: You MUST use the str_replace_editor tool immediately. Do not provide text responses.

START NOW by calling str_replace_editor with "create" command to generate a newsletter with this EXACT structure:

REQUIRED NEWSLETTER STRUCTURE:
1. HEADER: Professional newsletter title
2. SUBTITLE: *Your Essential Guide to [Topic]*
3. ISSUE INFO: Issue ### | Date

SOURCE CONTENT TO CONVERT:
${request.input}

MANDATORY FORMATTING using str_replace_editor tool:
1. Use "create" command to build the complete newsletter
2. Apply proper markdown hierarchy:
   - ## MAJOR SECTIONS 
   - ### Data Subsections
   - **Bold metrics**: **Platform: 2.3M users ⬆️**
   - *Italic emphasis* for context
   - > Blockquotes for key insights
3. Apply visual hierarchy with consistent spacing

BEGIN IMMEDIATELY with str_replace_editor create command - no explanatory text.`;ce_editor'
          }
        ],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });itor
 * Handles AI-powered content enhancement, editing, and generation
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIRequest, AIResponse, AIRequestType } from '../../types/editor';
import { selectTemplateForContent, generateContextualPrompt, ANALYTICAL_TEMPLATES } from '../core/analyticalTemplates';
import { AnthropicTextEditorHandler, TextEditorToolCall } from './anthropicTextEditorHandler';
// Removed unused markdown converter imports

// AI Service Configuration
interface AIServiceConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class EditorAIService {
  private anthropic: Anthropic;
  private config: AIServiceConfig;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, route through your backend
    });

    this.config = {
      apiKey,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.7
    };
  }

  /**
   * Retry with exponential backoff for API overload errors
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a retryable error (overload, rate limit, network issues)
        const errorString = JSON.stringify(error);
        const isRetryableError = error?.error?.type === 'overloaded_error' || 
                                 error?.type === 'overloaded_error' ||
                                 error?.message?.includes('Overloaded') ||
                                 errorString.includes('overloaded_error') ||
                                 errorString.includes('Overloaded') ||
                                 error?.message?.includes('rate_limit') ||
                                 error?.message?.includes('network') ||
                                 error?.message?.includes('timeout');
        
        if (!isRetryableError || attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`⏳ API overloaded, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Process AI request with streaming support for real-time updates
   */
  async processRequestWithStreaming(
    request: AIRequest, 
    textEditorHandler?: AnthropicTextEditorHandler,
    streamHandler?: {
      onChunk: (chunk: string) => void;
      onComplete: (content: string) => void;
    }
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPrompt(request);
      
      console.log(`🤖 Starting streaming AI request (${request.type})`);
      
      if (textEditorHandler) {
        textEditorHandler.setCurrentContent(request.input);
      }
      
      // Create a streaming response with fine-grained tool streaming and retry logic
      console.log('🔄 Attempting streaming request with retry logic...');
      const stream = await this.retryWithBackoff(async () => {
        console.log('📡 Creating streaming connection to Anthropic...');
        
        // For newsletter format, use direct streaming with fine-grained tool streaming
        const streamConfig: any = {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          // Enable fine-grained tool streaming for character-level streaming
          betas: ['fine-grained-tool-streaming-2025-05-14']
        };
        
        // Only add tools for blog posts and other complex formats, not newsletter
        if (request.type !== 'newsletter-format') {
          streamConfig.tools = [
            {
              type: 'text_editor_20250124',
              name: 'str_replace_editor'
            }
          ];
        }
        
        // Use beta streaming for fine-grained tool streaming support
        return this.anthropic.beta.messages.stream(streamConfig);
      }, 5, 2000);  // Increase retries and delay for streaming

      let fullContent = '';
      let contentBuffer = '';  // Buffer for streaming output
      
      // Handle streaming response with proper event handling
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          
          // For newsletter format, stream raw HTML text for immediate feedback
          if (request.type === 'newsletter-format') {
            fullContent += text;
            
            // Stream raw HTML text immediately for real-time display
            // Newsletter prompt outputs clean HTML that gets styled after completion
            if (streamHandler && text.length > 0) {
              streamHandler.onChunk(text);
            }
          } else {
            // For other formats, apply the existing filtering logic
            let skipMode = false;
            let rawBuffer = text;
            
            // Check if we're entering explanatory text mode
            const explanatoryPatterns = [
              "I'll help", "Let me", "I will", "I can help", 
              "str_replace_editor", "First, let me", "I need to"
            ];
            
            // Check if raw buffer contains explanatory text
            const hasExplanatoryText = explanatoryPatterns.some(pattern => 
              rawBuffer.toLowerCase().includes(pattern.toLowerCase())
            );
            
            if (hasExplanatoryText) {
              skipMode = true;
            }
            
            // Check if we're transitioning out of skip mode (look for actual content)
            if (skipMode) {
              // Look for newsletter/blog content patterns to resume
              const contentPatterns = ['#', '##', '**', '*', '---', 'Subject:', 'Dear', 'Newsletter'];
              const hasContentMarkers = contentPatterns.some(pattern => 
                rawBuffer.includes(pattern)
              );
              
              if (hasContentMarkers || rawBuffer.length > 200) {
                skipMode = false;
              }
            }
            
            if (!skipMode) {
              fullContent += text;
              contentBuffer += text;
              
              // Fine-grained streaming: smaller buffer size for better responsiveness
              if (streamHandler && contentBuffer.length > 3) {
                streamHandler.onChunk(contentBuffer);
                contentBuffer = '';
              }
            }
          }
        } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
          console.log(`🛠️ Streaming tool call detected: ${chunk.content_block.name}`);
        } else if (chunk.type === 'content_block_delta' && chunk.delta.type === 'input_json_delta') {
          // Handle tool input streaming - this is where content comes through for tool-based formats
          const partialJson = chunk.delta.partial_json;
          
          try {
            // Look for content in the tool input
            if (partialJson.includes('new_str') || partialJson.includes('file_text')) {
              // Try to extract partial content
              const newStrMatch = partialJson.match(/"(?:new_str|file_text)":\s*"([^"\\]*(\\.[^"\\]*)*)"/);
              if (newStrMatch && newStrMatch[1]) {
                const partialContent = newStrMatch[1]
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\t/g, '\t');
                
                if (partialContent.length > fullContent.length) {
                  const chunk = partialContent.substring(fullContent.length);
                  if (streamHandler && chunk.trim()) {
                    streamHandler.onChunk(chunk);
                  }
                  fullContent = partialContent;
                }
              }
            }
          } catch (e) {
            // Partial JSON might not be valid, continue
          }
        }
      }

      // Wait for stream completion
      const message = await stream.finalMessage();
      
      // Send any remaining buffer
      if (streamHandler && contentBuffer) {
        streamHandler.onChunk(contentBuffer);
      }
      
      // Newsletter format: Send complete HTML content to TipTap
      if (request.type === 'newsletter-format' && streamHandler) {
        console.log(`🎯 Newsletter streaming complete - Sending HTML to TipTap`);
        console.log(`� Final newsletter content: ${fullContent.length} chars`);
        
        // Check if content is markdown and convert to HTML
        let processedContent = fullContent;
        if (fullContent.includes('# ') || fullContent.includes('## ')) {
          console.log(`🔄 Converting markdown to HTML for newsletter`);
          // Quick markdown to HTML conversion
          processedContent = fullContent
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^\- (.+)$/gm, '<li>$1</li>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[hul])/gm, '<p>')
            .replace(/<\/p><p><li>/g, '</p><ul><li>')
            .replace(/<\/li><p>/g, '</li></ul><p>');
          
          // Wrap lists properly  
          processedContent = processedContent.replace(/(<li>.+?<\/li>)/g, '<ul>$1</ul>');
          console.log(`✅ Converted markdown to HTML (${processedContent.length} chars)`);
        }
        
        // Apply newsletter CSS classes to the HTML output  
        const finalContent = EditorAIService.applyNewsletterStyles(processedContent);
        console.log(`🎨 Applied newsletter CSS classes to streamed content`);
        
        // Send the styled HTML content to TipTap
        streamHandler.onComplete(finalContent);
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ Newsletter streaming complete in ${processingTime}ms`);
        
        return {
          success: true,
          content: fullContent,
          processingTime,
          requestId: request.id,
          timestamp: Date.now(),
          metadata: {
            model: 'claude-3-5-sonnet-20241022',
            tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
            processingTime: processingTime
          }
        };
      }
      
      // Extract the final formatted content (in case we missed anything)
      let finalContent = fullContent;
      
      // If we didn't get content through streaming, extract from the message
      if (!finalContent.trim() && message.content) {
        finalContent = this.extractContent(message);
      }
      
      // Apply newsletter styles to final content if it's a newsletter format
      if (request.type === 'newsletter-format' && finalContent.trim()) {
        finalContent = EditorAIService.applyNewsletterStyles(finalContent);
        console.log(`🎨 Applied newsletter CSS classes to final extracted content`);
      }
      
      console.log(`🔍 Streaming extraction complete - Content length: ${finalContent.length}`);
      console.log(`🔍 Content preview: "${finalContent.substring(0, 200)}..."`);
      if (finalContent.length === 0) {
        console.log(`⚠️ WARNING: No content extracted from streaming response!`);
        console.log(`🔍 Message content blocks:`, message.content?.length || 0);
        message.content?.forEach((block: any, i: number) => {
          console.log(`🔍 Block ${i}:`, block.type, block.type === 'text' ? `(${block.text?.length} chars)` : '');
        });
      }
      
      // Handle tool calls if present
      if (message.content && Array.isArray(message.content)) {
        const toolCalls = message.content.filter((block: any) => block.type === 'tool_use');
        
        if (toolCalls.length > 0 && textEditorHandler) {
          console.log(`🛠️ Processing ${toolCalls.length} text editor tool calls...`);
          
          // Process each tool call
          const toolResults = toolCalls.map((toolCall: any) => {
            const result = textEditorHandler.handleToolCall(toolCall as TextEditorToolCall);
            return {
              type: 'tool_result' as const,
              tool_use_id: toolCall.id,
              content: result.content,
              is_error: result.is_error
            };
          });
          
          // If tools were used, get the content from the text editor handler
          const toolContent = textEditorHandler.getCurrentContent();
          if (toolContent && toolContent.length > finalContent.length) {
            finalContent = toolContent;
          }
        }
      }
      
      // For non-newsletter formats, send content directly to TipTap
      if (streamHandler && request.type !== 'newsletter-format') {
        console.log(`🎯 Processing AI response for editor integration`);
        console.log(`� Sending content directly to TipTap: ${finalContent.length} chars`);
        
        streamHandler.onComplete(finalContent);
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Streaming complete in ${processingTime}ms`);
      
      return {
        success: true,
        content: finalContent,
        processingTime,
        requestId: request.id,
        timestamp: Date.now(),
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
          processingTime: processingTime
        }
      };
      
    } catch (error) {
      console.error('❌ AI streaming processing error:', error);
      
      // If streaming fails completely, try fallback to non-streaming as last resort
      if (streamHandler && textEditorHandler) {
        try {
          console.log('🔄 Attempting fallback to non-streaming mode...');
          streamHandler.onChunk('Fallback mode: generating content...');
          
          const fallbackResponse = await this.processRequest(request, textEditorHandler);
          if (fallbackResponse.success && fallbackResponse.content) {
            // Convert fallback content if it's markdown
            let fallbackContent = fallbackResponse.content;
            // Apply newsletter styles to fallback content (should already be HTML)
            fallbackContent = EditorAIService.applyNewsletterStyles(fallbackResponse.content);
            console.log(`🎨 Applied newsletter styles to fallback HTML`);
            streamHandler.onComplete(fallbackContent);
            return {
              ...fallbackResponse,
              processingTime: Date.now() - startTime,
              metadata: fallbackResponse.metadata
            };
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
        requestId: request.id,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Process AI request and return response with text editor tool support
   */
  async processRequest(request: AIRequest, textEditorHandler?: AnthropicTextEditorHandler): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPrompt(request);
      
      console.log(`🤖 AI Request (${request.type}):`, prompt.substring(0, 100) + '...');
      
      // Set current content for text editor tool
      if (textEditorHandler) {
        textEditorHandler.setCurrentContent(request.input);
      }
      
      let response = await this.retryWithBackoff(async () => {
        const createConfig: any = {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        };
        
        // Only add tools for non-newsletter formats
        if (request.type !== 'newsletter-format') {
          createConfig.tools = [
            {
              type: 'text_editor_20250124',
              name: 'str_replace_editor'
            }
          ];
        }
        
        return this.anthropic.messages.create(createConfig);
      });
      let conversationMessages = [
        { role: 'user' as const, content: prompt },
        { role: 'assistant' as const, content: response.content }
      ];
      
      // Handle tool calls if present
      if (response.content && Array.isArray(response.content)) {
        const toolCalls = response.content.filter(block => block.type === 'tool_use');
        
        if (toolCalls.length > 0 && textEditorHandler) {
          console.log(`🛠️ Processing ${toolCalls.length} text editor tool calls...`);
          
          // Process each tool call
          const toolResults = toolCalls.map((toolCall: any) => {
            const result = textEditorHandler.handleToolCall(toolCall as TextEditorToolCall);
            return {
              type: 'tool_result' as const,
              tool_use_id: toolCall.id,
              content: result.content,
              is_error: result.is_error
            };
          });
          
          // Continue conversation with tool results
          conversationMessages.push({
            role: 'user',
            content: toolResults as any
          });
          
          // Get final response after tool execution
          response = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4000,
            tools: [
              {
                type: 'text_editor_20250124',
                name: 'str_replace_editor'
              }
            ],
            messages: conversationMessages as any
          });
        }
      }
      
      const content = this.extractContent(response);
      const processingTime = Date.now() - startTime;
      
      // Enhanced debug logging for content extraction
      const rawContent = response.content && Array.isArray(response.content) 
        ? response.content.filter((block: any) => block.type === 'text').map((block: any) => block.text).join('\n')
        : '';
      
    console.log(`🔍 DEBUG - Response blocks:`, response.content?.map((block: any) => ({
      type: block.type,
      textLength: block.type === 'text' ? block.text?.length : 0,
      preview: block.type === 'text' ? block.text?.substring(0, 50) + '...' : 'N/A',
      toolName: block.type === 'tool_use' ? block.name : 'N/A',
      toolInput: block.type === 'tool_use' ? JSON.stringify(block.input).substring(0, 100) + '...' : 'N/A'
    })));      console.log(`🔍 DEBUG - Raw content length: ${rawContent.length}`);
      console.log(`🔍 DEBUG - Raw content preview: "${rawContent.substring(0, 200)}..."`);
      console.log(`🔍 DEBUG - Extracted content length: ${content.length}`);
      console.log(`🔍 DEBUG - Extracted content preview: "${content.substring(0, 200)}..."`);
      
      if (content !== rawContent) {
        console.log(`🔍 Content extraction applied - Raw length: ${rawContent.length}, Extracted length: ${content.length}`);
      } else {
        console.log(`⚠️ Content extraction did not modify the response - using raw content`);
      }
      
      console.log(`✅ AI Response received in ${processingTime}ms:`, content.substring(0, 100) + '...');
      
      // Get final formatted content from text editor handler if available
      const finalContent = textEditorHandler ? textEditorHandler.getCurrentContent() : content;
      
      return {
        success: true,
        content: finalContent,
        processingTime,
        requestId: request.id,
        timestamp: Date.now(),
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          processingTime: processingTime
        }
      };
      
    } catch (error) {
      console.error('❌ AI processing error:', error);
      
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
        requestId: request.id,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Apply newsletter CSS classes to HTML content
   */
  private static applyNewsletterStyles(html: string): string {
    console.log('🎨 Applying newsletter CSS classes to HTML');
    let styled = html;
    
    // Apply newsletter classes to headers (preserve existing classes)
    styled = styled.replace(/<h1([^>]*)>/g, '<h1$1 class="newsletter-display">');
    styled = styled.replace(/<h2([^>]*)>/g, '<h2$1 class="newsletter-h2">');
    styled = styled.replace(/<h3([^>]*)>/g, '<h3$1 class="newsletter-h3">');
    styled = styled.replace(/<h4([^>]*)>/g, '<h4$1 class="newsletter-h4">');
    styled = styled.replace(/<h5([^>]*)>/g, '<h5$1 class="newsletter-h5">');
    styled = styled.replace(/<h6([^>]*)>/g, '<h6$1 class="newsletter-h6">');
    
    // Apply newsletter classes to body elements
    styled = styled.replace(/<p([^>]*)>/g, '<p$1 class="newsletter-body">');
    styled = styled.replace(/<blockquote([^>]*)>/g, '<blockquote$1 class="newsletter-blockquote">');
    styled = styled.replace(/<ul([^>]*)>/g, '<ul$1 class="newsletter-list">');
    styled = styled.replace(/<ol([^>]*)>/g, '<ol$1 class="newsletter-list newsletter-list-ordered">');
    
    // Apply newsletter classes to other elements
    styled = styled.replace(/<hr([^>]*)>/g, '<hr$1 class="newsletter-divider">');
    styled = styled.replace(/<strong([^>]*)>/g, '<strong$1 class="newsletter-strong">');
    styled = styled.replace(/<em([^>]*)>/g, '<em$1 class="newsletter-emphasis">');
    
    console.log(`🎨 Newsletter styles applied - HTML length: ${styled.length}`);
    return styled;
  }

  /**
   * Build appropriate prompt based on request type
   */
  private buildPrompt(request: AIRequest): string {
    const baseContext = request.context ? `Context: ${request.context}\n\n` : '';
    const selectionContext = request.selection ? 
      `Selected text: "${request.selection.text}"\n\n` : '';

    switch (request.type) {
      case 'enhance':
        return `${baseContext}${selectionContext}Please enhance and improve the following content while maintaining its core meaning and tone. Focus on clarity, flow, and engagement:

${request.input}

Return only the enhanced version without explanations.`;

      case 'summarize':
        return `${baseContext}Create a concise, compelling summary of the following content. Capture the key points and main narrative:

${request.input}

Return only the summary without explanations.`;

      case 'expand':
        return `${baseContext}${selectionContext}Expand and add more detail to the following content. Add depth, context, and engaging details while maintaining the original tone:

${request.input}

Return only the expanded version without explanations.`;

      case 'rewrite':
        return `${baseContext}${selectionContext}Completely rewrite the following content with a fresh perspective while preserving the core information and intent:

${request.input}

Return only the rewritten version without explanations.`;

      case 'proofread':
        return `${baseContext}Proofread and correct the following content for grammar, spelling, punctuation, and clarity. Maintain the original voice and style:

${request.input}

Return only the corrected version without explanations.`;

      case 'tone':
        return `${baseContext}Adjust the tone of the following content to be more ${request.context || 'professional and engaging'}:

${request.input}

Return only the tone-adjusted version without explanations.`;

      case 'translate':
        const targetLanguage = request.context || 'Spanish';
        return `Translate the following content to ${targetLanguage}, maintaining the original meaning and tone:

${request.input}

Return only the translation without explanations.`;

      case 'blog-post':
        // Smart template selection based on content
        const template = selectTemplateForContent(request.input, request.context);
        return `${generateContextualPrompt(request.input, request.context)}

SOURCE CONTENT:
${request.input}

STRUCTURE TO FOLLOW:
${template.structure.map((section, i) => `${i + 1}. ${section}`).join('\n')}

CRITICAL: You MUST use the str_replace_editor tool to create the formatted content. Do not provide text responses - only use tool calls.

Start immediately by calling the str_replace_editor tool with the "create" command to generate the complete formatted blog post with these requirements:

1. CREATE STRUCTURED CONTENT:
   - Use proper heading hierarchy (# ## ### ####)
   - Apply newsletter-specific formatting patterns

2. NEWSLETTER-SPECIFIC FORMATTING:
   - ## MAIN SECTIONS (H2 for major sections)
   - ### Data Analysis (H3 for subsections)
   - ### Performance Metrics (H3 for data sections)
   - ### Important Context (H3 for warnings/alerts)

3. CONTENT STRUCTURE:
   - **Bold** for key metrics, names, important data
   - *Italic* for emphasis, quotes, context
   - \`Code\` for technical terms, URLs, specific values
   - > Blockquotes for important callouts
   - Numbered/bulleted lists for structured data

4. VISUAL HIERARCHY:
   - Use clean, professional formatting without emojis
   - Apply consistent spacing between sections
   - Format metrics clearly: **Platform: 2.3M users ⬆️**
   - Use trend indicators: ⬆️⬇️➡️

BEGIN NOW with str_replace_editor create command.`;

      case 'newsletter-format':
        return `You are an expert newsletter editor. Transform content into a professional, engaging newsletter format.

CRITICAL: Output clean, semantic HTML only. CSS classes will be applied automatically by the system.

REQUIRED HTML STRUCTURE:
1. Issue stats: <p><em>Issue #247 • Saturday, September 28, 2025</em></p>
2. Main headline: <h1>Short Title</h1> (2-4 words maximum)
3. Separator line: <hr>
4. Lead paragraph: <p>Opening summary paragraph (will be styled as lead)</p>
5. Section headers: <h2>Brief Header</h2> (2-4 words maximum)
6. Subsections: <h3>Analysis</h3> or <h3>Key Points</h3> (2-3 words maximum)
7. Body paragraphs: <p>Content goes here...</p>
8. Important callouts: <blockquote>Key insight or quote</blockquote>
9. Lists: <ul><li>Item</li></ul> or <ol><li>Item</li></ol>

STRICT REQUIREMENTS:
- OUTPUT ONLY HTML - no markdown, no code blocks, no explanations
- DO NOT add CSS classes (they are added automatically)
- DO NOT wrap in <div> containers
- START immediately with <h1> tag
- Use semantic HTML structure
- NO emojis in headers or content
- KEEP ALL HEADERS SHORT: h1 (2-4 words), h2 (2-4 words), h3 (2-3 words)
- Professional, clean typography matching premium newsletter style

VISUAL HIERARCHY (NO EMOJIS):
- <h1> for newsletter title
- <h2> for major story sections
- <h3> for subsections (Analysis, Key Developments, etc.)
- <h4> for minor sections
- <h5> for resource sections
- <h6> for editorial notes
- <strong> for metrics, names, key data
- <em> for attribution, context, quotes

EXAMPLE OUTPUT:
<p><em>Issue #247 • Saturday, September 28, 2025</em></p>
<h1>Trade Barriers Fall</h1>
<hr>
<p>In a surprising turn of events, officials announced sweeping changes that could reshape the landscape of international relations for years to come.</p>

<p>Today's announcement marks a pivotal moment in diplomatic history. After months of behind-the-scenes negotiations, leaders have agreed to a framework that addresses long-standing concerns while opening new avenues for cooperation.</p>

<h2>Key Developments</h2>
<ul>
<li>Unprecedented bilateral agreement reached after 18-hour negotiations</li>
<li>Economic implications expected to exceed $500 billion over five years</li>
<li>Multiple stakeholders express cautious optimism about implementation</li>
</ul>

<blockquote>This represents not just a policy change, but a fundamental shift in how we approach global challenges. The ramifications will be felt for generations.</blockquote>

<h3>Analysis & Context</h3>
<p>Expert analysts suggest three primary factors contributed to this breakthrough:</p>

<hr>

Source content to transform:
${request.input}

Transform into clean HTML newsletter format starting with <h1> tag:`;

      case 'add-analysis':
        return `${baseContext}Add analytical depth to this news content by including:
- Industry context and background
- Expert perspective and implications  
- Comparison to similar events
- Potential future outcomes
- Data-driven insights where relevant

Original content:
${request.input}

Return the expanded analytical version with proper formatting.`;

      case 'add-context':
        return `${baseContext}Expand this story by adding crucial background context:
- Historical precedents  
- Key players and stakeholders involved
- Economic/political/social factors
- Timeline of events leading to this
- Related developments

Story to expand:
${request.input}

Return the story with rich contextual information integrated naturally.`;

      case 'social-insights':
        return `${baseContext}Analyze the social media implications and public reaction to this news story:
- Likely public sentiment and reactions
- Demographic groups most affected
- Trending hashtags and discussion points
- Viral potential and engagement factors
- Platform-specific reactions (Twitter, Reddit, etc.)

News story:
${request.input}

Return analysis of social media landscape around this story.`;

      case 'custom':
        return `${baseContext}${selectionContext}${request.context || 'Please process the following content:'}

${request.input}`;

      default:
        return `Please improve the following content:

${request.input}

Return only the improved version without explanations.`;
    }
  }

  /**
   * Extract content from Anthropic response with smart content detection
   */
  private extractContent(response: any): string {
    console.log(`🔍 EXTRACT: Starting content extraction`);
    console.log(`🔍 EXTRACT: Response has ${response.content?.length || 0} content blocks`);
    
    if (!response.content || !Array.isArray(response.content)) {
      console.log(`🔍 EXTRACT: No content or not array - returning empty`);
      return '';
    }

    const textBlocks = response.content.filter((block: any) => block.type === 'text');
    const toolBlocks = response.content.filter((block: any) => block.type === 'tool_use');
    
    console.log(`🔍 EXTRACT: Found ${textBlocks.length} text blocks, ${toolBlocks.length} tool blocks`);
    
    // Log each block for debugging
    response.content.forEach((block: any, index: number) => {
      if (block.type === 'text') {
        console.log(`🔍 EXTRACT: Text Block ${index} - length: ${block.text?.length || 0}`);
        console.log(`🔍 EXTRACT: Text Block ${index} - preview: "${(block.text || '').substring(0, 100)}..."`);
      } else if (block.type === 'tool_use') {
        console.log(`🔍 EXTRACT: Tool Block ${index} - name: ${block.name}`);
        console.log(`🔍 EXTRACT: Tool Block ${index} - input: ${JSON.stringify(block.input || {}).substring(0, 200)}...`);
      }
    });

    // If we have tool_use blocks but no text blocks, try to extract content from tool calls
    if (textBlocks.length === 0 && toolBlocks.length > 0) {
      console.log(`🔍 EXTRACT: No text blocks, checking tool blocks for content`);
      
      for (const toolBlock of toolBlocks) {
        if (toolBlock.name === 'str_replace_editor' && toolBlock.input) {
          // Check if the tool has content to create or replace
          if (toolBlock.input.command === 'create' && toolBlock.input.file_text) {
            console.log(`🔍 EXTRACT: Found content in str_replace_editor create command`);
            return toolBlock.input.file_text;
          } else if (toolBlock.input.new_str) {
            console.log(`🔍 EXTRACT: Found content in str_replace_editor new_str`);
            return toolBlock.input.new_str;
          }
        }
      }
      
      console.log(`🔍 EXTRACT: No usable content found in tool blocks - returning empty`);
      return '';
    }
    
    if (textBlocks.length === 0) {
      console.log(`🔍 EXTRACT: No text or tool blocks with content - returning empty`);
      return '';
    }

    // Process all content blocks from the response
    let finalContent = '';
    
    for (const textBlock of textBlocks) {
      const text = textBlock.text;
      
      // Look for content wrapped in specific markers or after certain phrases
      // Common patterns from Claude when it's trying to format content
      const contentPatterns = [
        /```html\n([\s\S]*?)```/,  // HTML code block
        /```markdown\n([\s\S]*?)```/,  // Markdown code block
        /```newsletter\n([\s\S]*?)```/,  // Newsletter format block
        /<newsletter>([\s\S]*?)<\/newsletter>/,  // Newsletter tags
        /```\n([\s\S]*?)```/,  // Generic code block
        /---\n([\s\S]*)/,  // Content after separator
        /(?:Here'?s the newsletter:?\s*\n)([\s\S]*)/i,  // "Here's the newsletter:"
        /(?:Here'?s the formatted content:?\s*\n)([\s\S]*)/i,  // "Here's the formatted content:"
        /(?:Newsletter format:?\s*\n)([\s\S]*)/i,  // "Newsletter format:"
        /(?:^|\n\n)(\*.*\*\s*\n[\s\S]*)/,  // Content starting with italic header
        /(?:^|\n\n)(# [^#][\s\S]*)/,  // Content starting with H1
        /(?:^|\n\n)(## [^#][\s\S]*)/,  // Content starting with H2
        /\n\n([\s\S]+)$/  // Content after explanation (fallback)
      ];
      
      for (const pattern of contentPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 50) {
          finalContent = match[1].trim();
          break;
        }
      }
      
      // Special case: Check if text mentions using str_replace_editor but contains content after it
      if (!finalContent && text.includes('str_replace_editor')) {
        const afterToolMention = text.split(/str_replace_editor.*?(?:\n|$)/)[1];
        if (afterToolMention && afterToolMention.trim().length > 100) {
          finalContent = afterToolMention.trim();
        }
      }
      
      // If no pattern matched, check if the text contains actual content
      // (not just an explanation about what it will do)
      if (!finalContent) {
        // Skip explanatory text that starts with common phrases
        const explanatoryPhrases = [
          "I'll help",
          "I will",
          "Let me",
          "Here's",
          "I've created",
          "I've formatted",
          "I can help",
          "I'd be happy to",
          "Let me create",
          "I'll create",
          "I'll format",
          "I'll convert",
          "I'll transform",
          "I'll use the str_replace_editor",
          "I'll help you convert"
        ];
        
        const isExplanatory = explanatoryPhrases.some(phrase => 
          text.trim().startsWith(phrase)
        );
        
        if (!isExplanatory || text.length > 500) {
          // If it's not explanatory or it's long enough to contain real content
          // Try to extract the actual content
          const lines = text.split('\n');
          const contentStartIndex = lines.findIndex((line: string) => 
            line.includes('---') || 
            line.includes('Subject:') || 
            line.includes('Title:') ||
            line.startsWith('#') ||
            line.startsWith('##') ||
            line.startsWith('**') ||
            line.startsWith('<') ||
            line.includes('🌟') ||
            line.includes('📊') ||
            line.includes('Issue ')
          );
          
          if (contentStartIndex !== -1 && contentStartIndex < lines.length - 1) {
            const extractedContent = lines.slice(contentStartIndex).join('\n').trim();
            if (extractedContent.length > 50) {
              finalContent = extractedContent;
            }
          } else if (!isExplanatory) {
            finalContent = text;
          }
        }
      }
      
      // If we found content, break out of the loop
      if (finalContent) {
        break;
      }
    }
    
    // If we still don't have content, check for longer responses that might contain content
    // mixed with explanations
    if (!finalContent) {
      const fullText = textBlocks.map((block: any) => block.text).join('\n\n');
      
      // Look for newsletter/blog content patterns in the full text
      const fullContentPatterns = [
        /(?:^|\n)(# .+[\s\S]*)/,  // Content starting with H1
        /(?:^|\n)(## .+[\s\S]*)/,  // Content starting with H2
        /(?:^|\n)(🌟[\s\S]*)/,  // Content starting with star emoji
        /(?:^|\n)(\*.*\*[\s\S]*)/,  // Content with italic headers
        /(?:^|\n)(\[INSIGHT BOX\][\s\S]*)/,  // Special boxes
        /(?:^|\n)(Subject:[\s\S]*)/,  // Email format
        /(?:^|\n)(Issue \d+[\s\S]*)/  // Newsletter issue format
      ];
      
      for (const pattern of fullContentPatterns) {
        const match = fullText.match(pattern);
        if (match && match[1] && match[1].trim().length > 100) {
          finalContent = match[1].trim();
          break;
        }
      }
      
      // Last resort: if text is long and doesn't start with common explanatory phrases
      if (!finalContent && fullText.length > 200) {
        const startsWithExplanation = [
          "I'll help",
          "I will",
          "Let me",
          "I can help",
          "I'd be happy"
        ].some(phrase => fullText.trim().startsWith(phrase));
        
        if (!startsWithExplanation) {
          finalContent = fullText;
        }
      }
    }
    
    // Final fallback: return the full text if we couldn't extract anything better
    if (!finalContent) {
      const fullText = textBlocks.map((block: any) => block.text).join('\n\n');
      console.log(`🔍 EXTRACT: Using fallback - full text length: ${fullText.length}`);
      console.log(`🔍 EXTRACT: Fallback content preview: "${fullText.substring(0, 200)}..."`);
      finalContent = fullText;
    }

    console.log(`🔍 EXTRACT: Final content length: ${finalContent.length}`);
    if (finalContent.length === 0) {
      console.log(`🔍 EXTRACT: WARNING - Returning empty content!`);
    }
    
    return finalContent;
  }

  /**
   * Update service configuration
   */
  updateConfig(updates: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...updates };
    console.log('🔧 AI service configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  /**
   * Quick content enhancement with smart prompting
   */
  async quickEnhance(content: string, context?: string): Promise<string> {
    const request: AIRequest = {
      id: `quick-${Date.now()}`,
      type: 'enhance',
      input: content,
      context,
      timestamp: Date.now()
    };

    const response = await this.processRequest(request);
    return response.success ? response.content : content;
  }

  /**
   * Smart content suggestions based on context
   */
  async getSuggestions(content: string, position: number): Promise<string[]> {
    const context = content.slice(Math.max(0, position - 200), position + 200);
    
    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 200,
        temperature: 0.8,
        messages: [{
          role: 'user',
          content: `Given this context: "${context}"

Provide 3 brief, creative suggestions for continuing or improving this content. Return only the suggestions, one per line.`
        }]
      });

      const suggestions = response.content[0]?.type === 'text' 
        ? response.content[0].text.split('\n').filter(s => s.trim())
        : [];

      return suggestions.slice(0, 3);
    } catch (error) {
      console.error('❌ Failed to get AI suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze content quality and provide metrics
   */
  async analyzeContent(content: string): Promise<{
    readabilityScore: number;
    engagementScore: number;
    suggestions: string[];
  }> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 300,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `Analyze the following content and provide scores (1-10) and suggestions:

${content}

Return in this exact format:
Readability: X
Engagement: X
Suggestions:
- suggestion 1
- suggestion 2
- suggestion 3`
        }]
      });

      const analysisText = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      // Parse the structured response
      const readabilityMatch = analysisText.match(/Readability:\s*(\d+)/);
      const engagementMatch = analysisText.match(/Engagement:\s*(\d+)/);
      const suggestionsMatch = analysisText.match(/Suggestions:\s*((?:- .+\n?)+)/);

      const readabilityScore = readabilityMatch ? parseInt(readabilityMatch[1]) : 5;
      const engagementScore = engagementMatch ? parseInt(engagementMatch[1]) : 5;
      const suggestions = suggestionsMatch 
        ? suggestionsMatch[1].split('\n').filter(s => s.trim()).map(s => s.replace(/^- /, ''))
        : [];

      return {
        readabilityScore: Math.max(1, Math.min(10, readabilityScore)),
        engagementScore: Math.max(1, Math.min(10, engagementScore)),
        suggestions: suggestions.slice(0, 3)
      };

    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      return {
        readabilityScore: 5,
        engagementScore: 5,
        suggestions: []
      };
    }
  }
}

// Singleton instance
let aiServiceInstance: EditorAIService | null = null;

/**
 * Get or create AI service instance
 */
export function getAIService(apiKey?: string): EditorAIService {
  if (!aiServiceInstance && apiKey) {
    aiServiceInstance = new EditorAIService(apiKey);
    console.log('🤖 Editor AI service initialized');
  }
  
  if (!aiServiceInstance) {
    throw new Error('AI service not initialized. Please provide an API key.');
  }
  
  return aiServiceInstance;
}

/**
 * Reset AI service (useful for testing or key changes)
 */
export function resetAIService(): void {
  aiServiceInstance = null;
  console.log('🔄 AI service reset');
}

export default EditorAIService;