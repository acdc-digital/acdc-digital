/**
 * TipTap AI Agent Formatting Tools
 * Client-side tools that allow AI to format documents properly
 */

import { z } from 'zod';
import { Editor } from '@tiptap/react';

// Tool interface for AI Agent
export interface AiAgentTool {
  name: string;
  modifiesEditor: boolean;
  handleToolCall: (params: {
    editor: Editor;
    toolCall: {
      arguments: any;
      name: string;
    };
  }) => string;
}

// Schema for heading tool
const headingToolSchema = z.object({
  level: z.number().min(1).max(6),
  text: z.string().min(1),
  position: z.enum(['start', 'end', 'current']).default('current')
});

// Schema for emphasis tool
const emphasisToolSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['bold', 'italic', 'underline', 'strike']),
  position: z.enum(['start', 'end', 'current']).default('current')
});

// Schema for list tool
const listToolSchema = z.object({
  items: z.array(z.string()),
  type: z.enum(['bullet', 'ordered']),
  position: z.enum(['start', 'end', 'current']).default('current')
});

// Schema for section tool
const sectionToolSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  level: z.number().min(1).max(6).default(2),
  position: z.enum(['start', 'end', 'current']).default('end')
});

// Schema for metrics box tool
const metricsBoxToolSchema = z.object({
  title: z.string().min(1),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    trend: z.enum(['up', 'down', 'neutral']).optional()
  })),
  position: z.enum(['start', 'end', 'current']).default('current')
});

// Schema for blockquote tool
const blockquoteToolSchema = z.object({
  text: z.string().min(1),
  author: z.string().optional(),
  position: z.enum(['start', 'end', 'current']).default('current')
});

// Helper function to position content
function positionContent(editor: Editor, position: 'start' | 'end' | 'current') {
  switch (position) {
    case 'start':
      editor.commands.focus('start');
      break;
    case 'end':
      editor.commands.focus('end');
      break;
    case 'current':
      // Stay at current position
      break;
  }
}

// Add Heading Tool
export const addHeadingTool = (): AiAgentTool => ({
  name: 'add_heading',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    const result = headingToolSchema.safeParse(toolCall.arguments);
    if (!result.success) {
      throw new Error(`Invalid arguments: ${result.error.message}`);
    }

    const { level, text, position } = result.data;
    
    positionContent(editor, position);
    
    editor.commands.insertContent(`<h${level}>${text}</h${level}>`);
    
    return `Successfully added H${level} heading: "${text}"`;
  }
});

// Add Emphasis Tool
export const addEmphasisTool = (): AiAgentTool => ({
  name: 'add_emphasis',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    const result = emphasisToolSchema.safeParse(toolCall.arguments);
    if (!result.success) {
      throw new Error(`Invalid arguments: ${result.error.message}`);
    }

    const { text, type, position } = result.data;
    
    positionContent(editor, position);
    
    let html = '';
    switch (type) {
      case 'bold':
        html = `<strong>${text}</strong>`;
        break;
      case 'italic':
        html = `<em>${text}</em>`;
        break;
      case 'underline':
        html = `<u>${text}</u>`;
        break;
      case 'strike':
        html = `<s>${text}</s>`;
        break;
    }
    
    editor.commands.insertContent(html);
    
    return `Successfully added ${type} text: "${text}"`;
  }
});

// Add List Tool
export const addListTool = (): AiAgentTool => ({
  name: 'add_list',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    const result = listToolSchema.safeParse(toolCall.arguments);
    if (!result.success) {
      throw new Error(`Invalid arguments: ${result.error.message}`);
    }

    const { items, type, position } = result.data;
    
    positionContent(editor, position);
    
    const listTag = type === 'bullet' ? 'ul' : 'ol';
    const listItems = items.map(item => `<li>${item}</li>`).join('');
    const html = `<${listTag}>${listItems}</${listTag}>`;
    
    editor.commands.insertContent(html);
    
    return `Successfully added ${type} list with ${items.length} items`;
  }
});

// Add Section Tool
export const addSectionTool = (): AiAgentTool => ({
  name: 'add_section',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    const result = sectionToolSchema.safeParse(toolCall.arguments);
    if (!result.success) {
      throw new Error(`Invalid arguments: ${result.error.message}`);
    }

    const { title, content, level, position } = result.data;
    
    positionContent(editor, position);
    
    const html = `
      <h${level}>${title}</h${level}>
      <p>${content}</p>
    `;
    
    editor.commands.insertContent(html);
    
    return `Successfully added section: "${title}"`;
  }
});

// Add Metrics Box Tool
export const addMetricsBoxTool = (): AiAgentTool => ({
  name: 'add_metrics_box',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    const result = metricsBoxToolSchema.safeParse(toolCall.arguments);
    if (!result.success) {
      throw new Error(`Invalid arguments: ${result.error.message}`);
    }

    const { title, metrics, position } = result.data;
    
    positionContent(editor, position);
    
    const metricsList = metrics.map(metric => {
      const trendIcon = metric.trend === 'up' ? '⬆️' : 
                       metric.trend === 'down' ? '⬇️' : '';
      return `<li><strong>${metric.label}:</strong> ${metric.value} ${trendIcon}</li>`;
    }).join('');
    
    const html = `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f8fafc;">
        <h4 style="margin: 0 0 12px 0; color: #1e293b;">${title}</h4>
        <ul style="margin: 0; padding-left: 20px;">${metricsList}</ul>
      </div>
    `;
    
    editor.commands.insertContent(html);
    
    return `Successfully added metrics box: "${title}" with ${metrics.length} metrics`;
  }
});

// Add Blockquote Tool
export const addBlockquoteTool = (): AiAgentTool => ({
  name: 'add_blockquote',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    const result = blockquoteToolSchema.safeParse(toolCall.arguments);
    if (!result.success) {
      throw new Error(`Invalid arguments: ${result.error.message}`);
    }

    const { text, author, position } = result.data;
    
    positionContent(editor, position);
    
    const html = `
      <blockquote>
        <p>${text}</p>
        ${author ? `<footer>— ${author}</footer>` : ''}
      </blockquote>
    `;
    
    editor.commands.insertContent(html);
    
    return `Successfully added blockquote${author ? ` by ${author}` : ''}`;
  }
});

// Format Document Tool - Applies comprehensive formatting using TipTap commands
export const formatDocumentTool = (): AiAgentTool => ({
  name: 'format_document',
  modifiesEditor: true,
  handleToolCall: ({ editor, toolCall }) => {
    console.log('🎨 Starting TipTap-based document formatting...');
    
    try {
      // Apply formatting using TipTap's native commands
      formatWithTipTapCommands(editor);
      
      return 'Successfully formatted document using TipTap editor commands';
    } catch (error) {
      console.error('❌ TipTap formatting failed:', error);
      return `Formatting failed: ${error}`;
    }
  }
});

/**
 * Apply comprehensive formatting using TipTap editor commands
 */
function formatWithTipTapCommands(editor: any) {
  const doc = editor.state.doc;
  const schema = editor.schema;
  let tr = editor.state.tr;
  
  // Track changes for logging
  const changes: string[] = [];
  
  // Process each node in the document
  doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'paragraph') {
      const text = node.textContent.trim();
      
      // Format emoji + ALL CAPS as H2 headers
      if (/^(🌟|📊|�|⚠️|🎯|📈|💡|🚀|📰|🔥)\s*([A-Z\s&;]{8,})$/.test(text)) {
        tr = tr.setNodeMarkup(pos, schema.nodes.heading, { level: 2 });
        changes.push(`Converted to H2: ${text.substring(0, 30)}...`);
      }
      // Format emoji + mixed case as H3 sections
      else if (/^([🌟📊🔍⚠️🎯📈💡🚀📰🔥])\s+([^0-9].{3,})$/.test(text)) {
        tr = tr.setNodeMarkup(pos, schema.nodes.heading, { level: 3 });
        changes.push(`Converted to H3: ${text.substring(0, 30)}...`);
      }
      // Format standalone ALL CAPS as H4
      else if (/^[A-Z\s&;]{8,}$/.test(text) && text.length < 50) {
        tr = tr.setNodeMarkup(pos, schema.nodes.heading, { level: 4 });
        changes.push(`Converted to H4: ${text.substring(0, 30)}...`);
      }
    }
  });
  
  // Apply all heading changes
  if (tr.docChanged) {
    editor.view.dispatch(tr);
    console.log('📝 Applied heading formatting:', changes);
  }
  
  // Apply text-level formatting
  setTimeout(() => {
    applyTextFormatting(editor);
  }, 100);
}

/**
 * Apply text-level formatting (bold, colors, etc.)
 */
function applyTextFormatting(editor: any) {
  const content = editor.getText();
  
  // Find and format metrics/percentages
  const percentageMatches = content.match(/\d+(?:\.\d+)?%/g);
  if (percentageMatches) {
    percentageMatches.forEach((percentage: string) => {
      // Use TipTap's search and replace with formatting
      try {
        // This is a simplified approach - you'd need a more sophisticated implementation
        // for production use that actually finds and formats the text positions
        console.log(`📊 Would format percentage: ${percentage}`);
      } catch (error) {
        console.warn('Could not format percentage:', percentage);
      }
    });
  }
  
  // Apply consistent paragraph styling
  editor.chain()
    .focus()
    .selectAll()
    .updateAttributes('paragraph', {
      class: 'newsletter-paragraph'
    })
    .run();
    
  console.log('✅ Applied text formatting');
}

// Export all tools
export const aiFormattingTools = [
  addHeadingTool(),
  addEmphasisTool(), 
  addListTool(),
  addSectionTool(),
  addMetricsBoxTool(),
  addBlockquoteTool(),
  formatDocumentTool()
];

console.log('🛠️ AI Agent formatting tools initialized');