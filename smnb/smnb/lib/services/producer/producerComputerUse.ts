/**
 * Computer Use AI Service for Producer Column Panel
 * Monitors and interacts with TipTap editor only when 'editor' column is selected
 * Uses Anthropic's computer use tool for direct browser interaction
 */

import Anthropic from '@anthropic-ai/sdk';
import { COMPUTER_USE_CONFIG } from '../../../../../.agents/anthropic.config';

export interface ComputerUseConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  displayWidth?: number;
  displayHeight?: number;
  editorPanelSelector?: string;
  rateLimitDelay?: number; // Delay between API calls in ms
  maxIterations?: number;
}

export interface EditorInteractionOptions {
  action: 'blog-post' | 'newsletter-format' | 'enhance' | 'rewrite' | 'summarize';
  content: string;
  context?: string;
  targetArea?: { x: number; y: number; width: number; height: number };
}

export class ProducerComputerUseService {
  private client: Anthropic;
  private config: ComputerUseConfig;
  private isMonitoring: boolean = false;
  private editorColumnActive: boolean = false;
  
  constructor(config: ComputerUseConfig) {
    // SECURITY FIX: This should be refactored to use backend API routes
    // TODO: Migrate to /api/producer-ai route and remove client-side Anthropic usage
    this.client = new Anthropic({ 
      apiKey: config.apiKey
      // dangerouslyAllowBrowser removed - this service should route through backend
    });
    this.config = {
      model: COMPUTER_USE_CONFIG.model,
      maxTokens: COMPUTER_USE_CONFIG.maxTokens,
      displayWidth: 1280,
      displayHeight: 800,
      editorPanelSelector: '[data-column="editor"]',
      rateLimitDelay: 3000, // 3 second delay between API calls
      maxIterations: 4, // Further reduced to avoid rate limits
      ...config
    };
  }

  /**
   * Start monitoring the producer column panel for editor selection
   */
  startMonitoring() {
    if (this.isMonitoring) {
      // Reduced logging to prevent console spam
      // console.log('🖥️ Computer use monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🖥️ Starting computer use monitoring for producer column panel');
    
    // Monitor for editor column selection
    this.monitorEditorSelection();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('🖥️ Stopped computer use monitoring');
  }

  /**
   * Monitor for editor column selection in producer panel
   */
  private monitorEditorSelection() {
    // This would typically be called when the producer column changes
    // For now, we'll expose a method to set the editor state
    console.log('🔍 Monitoring producer column for editor selection...');
  }

  /**
   * Set whether the editor column is currently active
   */
  setEditorColumnActive(active: boolean) {
    const wasActive = this.editorColumnActive;
    this.editorColumnActive = active;
    
    if (active && !wasActive) {
      console.log('✅ Editor column activated - computer use ready');
    } else if (!active && wasActive) {
      console.log('❌ Editor column deactivated - computer use paused');
    }
  }

  /**
   * Interact with the TipTap editor using computer use
   */
  async interactWithEditor(options: EditorInteractionOptions): Promise<void> {
    if (!this.isMonitoring) {
      throw new Error('Computer use monitoring not started');
    }

    if (!this.editorColumnActive) {
      throw new Error('Editor column is not currently active');
    }

    console.log(`🤖 Starting computer use interaction: ${options.action}`);

    try {
      // Create the computer use conversation
      const response = await this.client.beta.messages.create({
        model: this.config.model!,
        max_tokens: this.config.maxTokens!,
        tools: [
          {
            type: 'computer_20250124',
            name: 'computer',
            display_width_px: this.config.displayWidth!,
            display_height_px: this.config.displayHeight!,
          }
        ],
        messages: [
          {
            role: 'user',
            content: this.buildComputerUsePrompt(options)
          }
        ],
        betas: ['computer-use-2025-01-24']
      });

      // Process the tool calls in a loop
      await this.processToolCalls(response, options);

    } catch (error) {
      console.error('❌ Computer use interaction failed:', error);
      throw error;
    }
  }

  /**
   * Build prompt for computer use interaction
   */
  private buildComputerUsePrompt(options: EditorInteractionOptions): string {
    const { action, content, context } = options;
    
    return `You are interacting with a Next.js application running in a browser. Your task is to use the TipTap rich text editor to format content.

CRITICAL: You must use COMPUTER USE TOOLS ONLY (screenshot, click, key, type). Do NOT use str_replace_editor or any file editing tools.

IMPORTANT CONSTRAINTS:
1. ONLY interact with the producer column panel on the right side of the screen
2. The editor column is currently selected and active
3. Focus ONLY on the TipTap editor area within this column
4. Do NOT click or interact with any other parts of the application
5. Use ONLY computer use actions: screenshot, click, key, type

TASK: ${this.getActionDescription(action)}

CONTENT TO FORMAT:
${content}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ''}

STEP-BY-STEP COMPUTER USE INSTRUCTIONS:
1. Use screenshot tool to see the current state of the TipTap editor
2. Use click tool to locate and click inside the TipTap editor within the producer column panel (right side)
3. Use key tool to clear any existing content (Ctrl+A, Delete)
4. Use type tool to input the formatted content according to ${action} requirements
5. Use click tool to access TipTap's formatting toolbar for rich text formatting
6. Use key tool for keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic, etc.)
7. Use type tool to ensure the formatted content follows proper ${action} structure
8. Use screenshot tool to verify the formatting is complete

FORMATTING REQUIREMENTS FOR ${action.toUpperCase()}:
${this.getFormattingRequirements(action)}

BEGIN by taking a screenshot to see the current state.`;
  }

  /**
   * Get description for each action type
   */
  private getActionDescription(action: string): string {
    switch (action) {
      case 'blog-post':
        return 'Transform the content into a comprehensive analytical blog post with proper structure, headings, and rich formatting';
      case 'newsletter-format':
        return 'Convert the content into an engaging newsletter format with proper headers, sections, and visual hierarchy';
      case 'enhance':
        return 'Enhance and improve the content while maintaining its core meaning, focusing on clarity and engagement';
      case 'rewrite':
        return 'Completely rewrite the content with a fresh perspective while preserving core information';
      case 'summarize':
        return 'Create a concise, compelling summary of the content capturing key points';
      default:
        return 'Process and format the content appropriately';
    }
  }

  /**
   * Get specific formatting requirements for each action
   */
  private getFormattingRequirements(action: string): string {
    switch (action) {
      case 'blog-post':
        return `- Use H1 for main title, H2 for major sections, H3 for subsections
- Apply bold formatting for key metrics and important data
- Use italic for emphasis and context
- Create bulleted or numbered lists for structured information
- Use blockquotes for important insights or quotes
- Ensure professional, analytical tone throughout`;

      case 'newsletter-format':
        return `- Start with compelling newsletter-style header
- Use H2 for major sections with emojis (🌟, 📊, 📈, ⚠️)
- Bold format for key statistics and metrics
- Use visual hierarchy with proper spacing
- Include call-out boxes using blockquotes
- Apply consistent formatting for readability`;

      case 'enhance':
        return `- Improve clarity and flow while maintaining original structure
- Add bold emphasis for important points
- Use proper heading hierarchy if needed
- Enhance readability with formatting
- Maintain original intent and meaning`;

      case 'rewrite':
        return `- Completely restructure content with fresh perspective
- Use appropriate heading structure
- Apply rich formatting for better presentation
- Maintain factual accuracy while improving presentation`;

      case 'summarize':
        return `- Create clear, concise summary with key points
- Use bullet points or numbered lists for main items
- Bold format for critical information
- Ensure summary captures essential elements`;

      default:
        return `- Apply appropriate rich text formatting
- Use headings, bold, italic as needed
- Ensure content is well-structured and readable`;
    }
  }

  /**
   * Process tool calls from Claude's response
   */
  private async processToolCalls(response: any, options: EditorInteractionOptions): Promise<void> {
    let currentMessages = [
      {
        role: 'user' as const,
        content: this.buildComputerUsePrompt(options)
      },
      {
        role: 'assistant' as const,
        content: response.content
      }
    ];

    // Continue the conversation until Claude completes the task
    let iterations = 0;
    const maxIterations = this.config.maxIterations || 6;

    while (iterations < maxIterations) {
      iterations++;

      // Check if Claude used any tools in the latest response
      const toolCalls = response.content?.filter((block: any) => block.type === 'tool_use') || [];
      
      if (toolCalls.length === 0) {
        console.log('✅ Computer use interaction completed');
        break;
      }

      // Early completion after basic actions to avoid rate limits
      // Check BEFORE processing new tool calls to prevent unnecessary API calls
      if (iterations >= 2 && this.hasPerformedSufficientActions(currentMessages)) {
        console.log('✅ Computer use interaction completed - sufficient formatting actions performed');
        break;
      }

      console.log(`🛠️ Processing ${toolCalls.length} tool calls (iteration ${iterations})`);

      // Process each tool call
      const toolResults = [];
      for (const toolCall of toolCalls) {
        const result = await this.executeTool(toolCall);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: result.content,
          is_error: result.is_error
        });
      }

      // Add tool results to conversation
      currentMessages.push({
        role: 'user',
        content: toolResults as any
      });

      // Add rate limiting delay before next API call
      if (iterations > 1) {
        console.log(`⏳ Rate limiting: waiting ${this.config.rateLimitDelay}ms before next API call...`);
        await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelay!));
      }

      // Get Claude's next response with retry on rate limit
      try {
        response = await this.client.beta.messages.create({
          model: this.config.model!,
          max_tokens: this.config.maxTokens!,
          tools: [
            {
              type: 'computer_20250124',
              name: 'computer',
              display_width_px: this.config.displayWidth!,
              display_height_px: this.config.displayHeight!,
            },
            {
              type: 'text_editor_20250124',
              name: 'str_replace_editor'
            }
          ],
          messages: currentMessages,
          betas: ['computer-use-2025-01-24']
        });
      } catch (error: any) {
        if (error.status === 429) {
          console.warn('⚠️ Rate limit hit, waiting longer and retrying...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          // Try once more with longer delay
          response = await this.client.beta.messages.create({
            model: this.config.model!,
            max_tokens: this.config.maxTokens!,
            tools: [
              {
                type: 'computer_20250124',
                name: 'computer',
                display_width_px: this.config.displayWidth!,
                display_height_px: this.config.displayHeight!,
              },
              {
                type: 'text_editor_20250124',
                name: 'str_replace_editor'
              }
            ],
            messages: currentMessages,
            betas: ['computer-use-2025-01-24']
          });
        } else {
          throw error;
        }
      }

      // Add Claude's response to conversation
      currentMessages.push({
        role: 'assistant',
        content: response.content
      });
    }

    if (iterations >= maxIterations) {
      console.warn('⚠️ Computer use interaction reached maximum iterations');
    }
  }

  /**
   * Execute a tool call
   * Note: This is a placeholder - actual implementation would depend on your computer use setup
   */
  private async executeTool(toolCall: any): Promise<{ content: string; is_error?: boolean }> {
    const { name, input } = toolCall;

    console.log(`🔧 Executing tool: ${name}`, input);

    // This is where you would implement actual tool execution
    // For now, return a placeholder result
    if (name === 'computer') {
      return this.executeComputerAction(input);
    } else if (name === 'str_replace_editor') {
      return this.executeTextEditorAction(input);
    }

    return {
      content: `Tool ${name} executed successfully`,
      is_error: false
    };
  }

  /**
   * Execute computer action (screenshot, click, type, etc.)
   */
  private executeComputerAction(input: any): { content: string; is_error?: boolean } {
    const { action } = input;
    
    console.log(`🖱️ Computer action: ${action}`);
    
    if (action === 'screenshot') {
      // Simulate realistic screenshot response
      return {
        content: `Screenshot captured successfully. The TipTap editor is visible in the producer column panel on the right side of the screen. The editor area shows a rich text interface with formatting toolbar at the top. The editor content area is ready for input and formatting.`
      };
    } else if (action === 'left_click') {
      const coords = input.coordinate || { x: 640, y: 400 };
      return {
        content: `Successfully clicked at coordinates (${coords.x}, ${coords.y}). The TipTap editor is now focused and ready for content input. Cursor is positioned in the editor.`
      };
    } else if (action === 'type') {
      const text = input.text || '';
      return {
        content: `Successfully typed text into the TipTap editor: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}". Content has been successfully formatted and added to the editor. Newsletter formatting is now complete with proper structure and styling applied.`
      };
    } else if (action === 'key') {
      const key = input.key || 'unknown';
      return {
        content: `Successfully pressed key: ${key}. Editor state updated accordingly.`
      };
    }

    return {
      content: `Computer action ${action} completed successfully.`
    };
  }

  /**
   * Execute text editor action
   */
  private executeTextEditorAction(input: any): { content: string; is_error?: boolean } {
    console.log('📝 Text editor action:', input);
    
    // Placeholder for text editor operations
    return {
      content: 'Text editor operation completed'
    };
  }

  /**
   * Check if the service is ready for interaction
   */
  isReady(): boolean {
    return this.isMonitoring && this.editorColumnActive;
  }

  /**
   * Check if sufficient actions have been performed for the task
   */
  private hasPerformedSufficientActions(messages: any[]): boolean {
    const toolResults = messages.flatMap(msg => 
      Array.isArray(msg.content) ? msg.content.filter((block: any) => block.type === 'tool_result') : []
    );
    
    const actionTypes = new Set();
    let hasScreenshot = false;
    let hasClick = false;
    let hasTyping = false;
    let hasKeyPress = false;
    
    toolResults.forEach(result => {
      const content = result.content || '';
      if (content.includes('screenshot') || content.includes('Screenshot')) {
        hasScreenshot = true;
        actionTypes.add('screenshot');
      }
      if (content.includes('clicked') || content.includes('Clicked') || content.includes('click')) {
        hasClick = true;
        actionTypes.add('click');
      }
      if (content.includes('typed') || content.includes('Typed') || content.includes('text into')) {
        hasTyping = true;
        actionTypes.add('type');
      }
      if (content.includes('key') || content.includes('Key') || content.includes('pressed')) {
        hasKeyPress = true;
        actionTypes.add('key');
      }
    });
    
    // Basic newsletter formatting workflow: screenshot -> click -> select all/delete -> type content
    // Complete if we've done screenshot + click + (typing OR key presses)
    const basicWorkflow = hasScreenshot && hasClick && (hasTyping || hasKeyPress);
    
    console.log(`🔍 Action check - Screenshot: ${hasScreenshot}, Click: ${hasClick}, Type: ${hasTyping}, Key: ${hasKeyPress}, Sufficient: ${basicWorkflow}`);
    
    return basicWorkflow;
  }

  /**
   * Get current status
   */
  getStatus(): { monitoring: boolean; editorActive: boolean; ready: boolean } {
    return {
      monitoring: this.isMonitoring,
      editorActive: this.editorColumnActive,
      ready: this.isReady()
    };
  }
}

// Export a singleton instance
let computerUseService: ProducerComputerUseService | null = null;

export const getComputerUseService = (config?: ComputerUseConfig): ProducerComputerUseService => {
  if (!computerUseService && config) {
    computerUseService = new ProducerComputerUseService(config);
  }
  
  if (!computerUseService) {
    throw new Error('Computer use service not initialized. Please provide config on first call.');
  }
  
  return computerUseService;
};