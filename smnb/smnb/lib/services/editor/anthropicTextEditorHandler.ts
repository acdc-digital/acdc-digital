/**
 * Anthropic Text Editor Tool Handler
 * Processes tool calls from Claude's native text editor tool
 */

import { Editor } from '@tiptap/react';

export interface TextEditorToolCall {
  type: 'tool_use';
  id: string;
  name: 'str_replace_editor';
  input: {
    command: 'view' | 'create' | 'str_replace' | 'insert' | 'undo_edit';
    path?: string;
    file_text?: string;
    old_str?: string;
    new_str?: string;
    insert_line?: number;
    view_range?: [number, number];
  };
}

export interface TextEditorToolResult {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/**
 * Handle Anthropic text editor tool calls for our TipTap editor
 */
export class AnthropicTextEditorHandler {
  private currentContent: string = '';
  private editor: Editor | null = null;

  constructor(editor?: Editor) {
    this.editor = editor || null;
  }

  setEditor(editor: Editor) {
    this.editor = editor;
    this.currentContent = editor.getText();
  }

  /**
   * Process a text editor tool call from Claude
   */
  handleToolCall(toolCall: TextEditorToolCall): TextEditorToolResult {
    const { command, path, file_text, old_str, new_str, insert_line, view_range } = toolCall.input;

    try {
      switch (command) {
        case 'view':
          return this.handleView(toolCall.id, path, view_range);
        
        case 'create':
          return this.handleCreate(toolCall.id, path || 'content.md', file_text || '');
        
        case 'str_replace':
          return this.handleStrReplace(toolCall.id, old_str || '', new_str || '');
        
        case 'insert':
          return this.handleInsert(toolCall.id, insert_line || 0, new_str || '');
        
        case 'undo_edit':
          return this.handleUndoEdit(toolCall.id);
        
        default:
          return {
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: `Error: Unknown command '${command}'`,
            is_error: true
          };
      }
    } catch (error) {
      console.error('❌ Text editor tool error:', error);
      return {
        type: 'tool_result',
        tool_use_id: toolCall.id,
        content: `Error: ${error}`,
        is_error: true
      };
    }
  }

  private handleView(toolUseId: string, path?: string, viewRange?: [number, number]): TextEditorToolResult {
    console.log('👁️ Text editor: VIEW command');
    
    // For our use case, we're viewing the current editor content
    let content = this.currentContent;
    
    if (viewRange) {
      const lines = content.split('\n');
      const [start, end] = viewRange;
      const selectedLines = lines.slice(start - 1, end === -1 ? lines.length : end);
      content = selectedLines.map((line, index) => `${start + index}: ${line}`).join('\n');
    } else {
      // Add line numbers for better tool usage
      const lines = content.split('\n');
      content = lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
    }

    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: content || 'Empty document'
    };
  }

  private handleCreate(toolUseId: string, path: string, fileText: string): TextEditorToolResult {
    console.log('✨ Text editor: CREATE command for', path);
    
    // Update our content and the TipTap editor
    this.currentContent = fileText;
    
    if (this.editor) {
      this.editor.commands.setContent(this.convertMarkdownToTipTap(fileText));
    }

    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: `Successfully created content with ${fileText.length} characters`
    };
  }

  private handleStrReplace(toolUseId: string, oldStr: string, newStr: string): TextEditorToolResult {
    console.log('🔄 Text editor: STR_REPLACE command');
    
    const occurrences = (this.currentContent.match(new RegExp(this.escapeRegex(oldStr), 'g')) || []).length;
    
    if (occurrences === 0) {
      return {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: 'Error: No match found for replacement text',
        is_error: true
      };
    }
    
    if (occurrences > 1) {
      return {
        type: 'tool_result',
        tool_use_id: toolUseId,
        content: `Error: Found ${occurrences} matches. Please provide more specific text to match exactly one location.`,
        is_error: true
      };
    }

    // Perform the replacement
    this.currentContent = this.currentContent.replace(oldStr, newStr);
    
    if (this.editor) {
      this.editor.commands.setContent(this.convertMarkdownToTipTap(this.currentContent));
    }

    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: 'Successfully replaced text at exactly one location'
    };
  }

  private handleInsert(toolUseId: string, insertLine: number, newStr: string): TextEditorToolResult {
    console.log('📝 Text editor: INSERT command at line', insertLine);
    
    const lines = this.currentContent.split('\n');
    
    if (insertLine === 0) {
      // Insert at beginning
      lines.unshift(newStr);
    } else if (insertLine >= lines.length) {
      // Insert at end
      lines.push(newStr);
    } else {
      // Insert after specified line
      lines.splice(insertLine, 0, newStr);
    }

    this.currentContent = lines.join('\n');
    
    if (this.editor) {
      this.editor.commands.setContent(this.convertMarkdownToTipTap(this.currentContent));
    }

    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: `Successfully inserted text at line ${insertLine}`
    };
  }

  private handleUndoEdit(toolUseId: string): TextEditorToolResult {
    console.log('↩️ Text editor: UNDO_EDIT command');
    
    // For Claude 3.5 Sonnet - implement basic undo functionality
    // In a full implementation, you'd maintain an edit history
    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content: 'Undo functionality not fully implemented in this demo'
    };
  }

  /**
   * Convert markdown content to TipTap-compatible format
   */
  private convertMarkdownToTipTap(markdown: string): string {
    // Basic markdown to HTML conversion for TipTap
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Convert emphasis
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
    
    // Convert blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');
    
    // Convert paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;
    
    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<li>.*<\/li>)<\/p>/g, '<ul>$1</ul>');
    html = html.replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
    
    return html;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getCurrentContent(): string {
    return this.currentContent;
  }

  setCurrentContent(content: string) {
    this.currentContent = content;
  }
}

console.log('🛠️ Anthropic Text Editor Tool Handler initialized');