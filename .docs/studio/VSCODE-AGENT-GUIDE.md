# Building a VS Code Agent with Real File Modification

A comprehensive guide to creating an AI agent that modifies real workspace files in VS Code, inspired by Chef's architecture.

## Table of Contents

- [Overview](#overview)
- [Architecture Comparison](#architecture-comparison)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Core Components](#core-components)
- [Implementation Guide](#implementation-guide)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

This guide shows you how to build a VS Code extension that:
- Provides a chat interface for interacting with an AI agent
- Uses streaming artifact parsing (like Chef) to extract code from AI responses
- Writes directly to real workspace files
- Shows real-time diffs and changes in VS Code
- Integrates with VS Code's native features (Git, IntelliSense, debugging)

### Why This Approach?

**Chef's Approach (WebContainer):**
- ✅ Sandboxed, safe for demos
- ✅ No setup required
- ❌ In-memory only
- ❌ Limited to browser APIs

**VS Code Extension Approach:**
- ✅ Real files with Git integration
- ✅ Full access to workspace
- ✅ Native VS Code features
- ⚠️ Requires user trust (modifies real files)

---

## Architecture Comparison

### Chef Architecture
```
User Chat Input
    ↓
AI Model (Anthropic/OpenAI)
    ↓
Streaming Response with <boltArtifact> tags
    ↓
StreamingMessageParser (parses in real-time)
    ↓
ActionRunner (executes actions)
    ↓
WebContainer (in-memory filesystem)
    ↓
CodeMirror Editor (shows code)
    ↓
Preview (WebContainer live preview)
```

### VS Code Extension Architecture
```
User Chat Input (Webview)
    ↓
Extension Host (message passing)
    ↓
AI Agent Service (local or API)
    ↓
Streaming Response with <boltArtifact> tags
    ↓
StreamingMessageParser (reuse from Chef)
    ↓
FileWriter Service (VS Code FS API)
    ↓
Real Workspace Files
    ↓
VS Code Editor (native diff view)
    ↓
Terminal/Browser Preview
```

---

## Prerequisites

### Required Knowledge
- TypeScript
- VS Code Extension API basics
- React (for webview UI)
- Node.js and npm/pnpm
- Understanding of AI streaming responses

### Required Tools
- Node.js 18+
- VS Code
- pnpm (or npm/yarn)
- TypeScript 5+

---

## Project Setup

### 1. Create Extension Scaffold

```bash
# Install Yeoman and VS Code extension generator
npm install -g yo generator-code

# Generate extension
yo code

# Select:
# - New Extension (TypeScript)
# - Name: my-code-agent
# - Identifier: my-code-agent
# - Description: AI agent that modifies workspace files
# - Initialize git: Yes
# - Package manager: pnpm
```

### 2. Project Structure

```
my-code-agent/
├── .vscode/
│   ├── launch.json              # Debug configuration
│   └── tasks.json               # Build tasks
├── extension/
│   ├── src/
│   │   ├── extension.ts         # Main entry point
│   │   ├── chatProvider.ts      # Webview provider
│   │   ├── fileWriter.ts        # File modification service
│   │   ├── agentService.ts      # AI agent communication
│   │   └── types.ts             # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── agent/                        # Reuse from Chef
│   ├── message-parser.ts        # Parse streaming artifacts
│   ├── types.ts
│   ├── prompts/
│   │   └── system.ts            # System prompts
│   └── utils/
│       ├── logger.ts
│       └── stripIndent.ts
├── webview-ui/                   # React chat interface
│   ├── src/
│   │   ├── App.tsx
│   │   ├── Chat.tsx
│   │   ├── Message.tsx
│   │   └── CodeBlock.tsx
│   ├── package.json
│   └── vite.config.ts
└── package.json                  # Root package.json
```

### 3. Install Dependencies

```bash
# Root dependencies
pnpm init
pnpm add -D typescript @types/node @types/vscode

# Extension dependencies
cd extension
pnpm add @vscode/webview-ui-toolkit

# Webview UI dependencies
cd ../webview-ui
pnpm add react react-dom
pnpm add -D @vitejs/plugin-react vite
pnpm add -D @types/react @types/react-dom

# Copy agent code from Chef
cd ..
mkdir -p agent
# Copy chef/chef-agent/message-parser.ts and dependencies
```

---

## Core Components

### 1. Extension Entry Point

**`extension/src/extension.ts`**

```typescript
import * as vscode from 'vscode';
import { ChatViewProvider } from './chatProvider';
import { FileWriter } from './fileWriter';
import { AgentService } from './agentService';

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Code Agent is now active');

  // Get workspace root
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  
  if (!workspaceRoot) {
    vscode.window.showErrorMessage('Please open a workspace folder');
    return;
  }

  // Initialize services
  const fileWriter = new FileWriter(workspaceRoot);
  const agentService = new AgentService();

  // Create chat provider
  const chatProvider = new ChatViewProvider(
    context.extensionUri,
    fileWriter,
    agentService
  );

  // Register webview view provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatViewProvider.viewType,
      chatProvider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('myCodeAgent.openChat', () => {
      vscode.commands.executeCommand('myCodeAgent.chatView.focus');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('myCodeAgent.clearChat', () => {
      chatProvider.clearChat();
    })
  );
}

export function deactivate() {}
```

### 2. File Writer Service

**`extension/src/fileWriter.ts`**

```typescript
import * as vscode from 'vscode';
import * as path from 'path';

export interface FileOperation {
  filePath: string;
  content: string;
  type: 'create' | 'update' | 'delete';
}

export class FileWriter {
  private outputChannel: vscode.OutputChannel;

  constructor(private workspaceRoot: string) {
    this.outputChannel = vscode.window.createOutputChannel('AI Agent');
  }

  /**
   * Write a file to the workspace
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = path.join(this.workspaceRoot, filePath);
      const uri = vscode.Uri.file(fullPath);

      // Check if file exists
      const fileExists = await this.fileExists(uri);

      // Create parent directories if needed
      const dirPath = path.dirname(fullPath);
      await this.ensureDirectory(dirPath);

      // Write the file
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));

      this.log(
        `${fileExists ? 'Updated' : 'Created'} file: ${filePath}`
      );

      // Open the file in editor to show changes
      await this.openFileInEditor(uri, fileExists);
    } catch (error) {
      this.logError(`Failed to write file ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Apply an edit to an existing file
   */
  async editFile(
    filePath: string,
    searchText: string,
    replaceText: string
  ): Promise<boolean> {
    try {
      const fullPath = path.join(this.workspaceRoot, filePath);
      const uri = vscode.Uri.file(fullPath);

      // Read current content
      const document = await vscode.workspace.openTextDocument(uri);
      const fullText = document.getText();

      // Find the text to replace
      const startIndex = fullText.indexOf(searchText);

      if (startIndex === -1) {
        this.logError(`Could not find text to replace in ${filePath}`);
        return false;
      }

      // Create edit
      const edit = new vscode.WorkspaceEdit();
      const startPos = document.positionAt(startIndex);
      const endPos = document.positionAt(startIndex + searchText.length);
      const range = new vscode.Range(startPos, endPos);

      edit.replace(uri, range, replaceText);

      // Apply edit
      const success = await vscode.workspace.applyEdit(edit);

      if (success) {
        this.log(`Edited file: ${filePath}`);
        await this.openFileInEditor(uri, true);
      }

      return success;
    } catch (error) {
      this.logError(`Failed to edit file ${filePath}`, error);
      return false;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.workspaceRoot, filePath);
      const uri = vscode.Uri.file(fullPath);

      await vscode.workspace.fs.delete(uri);
      this.log(`Deleted file: ${filePath}`);
    } catch (error) {
      this.logError(`Failed to delete file ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Create directory if it doesn't exist
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    const uri = vscode.Uri.file(dirPath);
    try {
      await vscode.workspace.fs.createDirectory(uri);
    } catch (error) {
      // Directory might already exist, that's okay
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(uri: vscode.Uri): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Open file in editor
   */
  private async openFileInEditor(
    uri: vscode.Uri,
    showDiff: boolean = false
  ): Promise<void> {
    if (showDiff) {
      // Show diff for updated files
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, {
        preview: false,
        viewColumn: vscode.ViewColumn.One,
      });
    } else {
      // Just open new files
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, {
        preview: false,
        viewColumn: vscode.ViewColumn.One,
      });
    }
  }

  /**
   * Batch write multiple files
   */
  async writeFiles(operations: FileOperation[]): Promise<void> {
    const progress = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Writing files...',
        cancellable: false,
      },
      async (progress) => {
        for (let i = 0; i < operations.length; i++) {
          const op = operations[i];
          progress.report({
            message: `${op.filePath} (${i + 1}/${operations.length})`,
            increment: (100 / operations.length),
          });

          switch (op.type) {
            case 'create':
            case 'update':
              await this.writeFile(op.filePath, op.content);
              break;
            case 'delete':
              await this.deleteFile(op.filePath);
              break;
          }
        }
      }
    );
  }

  private log(message: string): void {
    this.outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
  }

  private logError(message: string, error?: any): void {
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    this.outputChannel.appendLine(
      `[${new Date().toISOString()}] ERROR: ${message} - ${errorMsg}`
    );
  }
}
```

### 3. Agent Service

**`extension/src/agentService.ts`**

```typescript
import { StreamingMessageParser, type ActionCallbackData } from '../../agent/message-parser';

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamingCallbacks {
  onContentChunk?: (chunk: string) => void;
  onActionOpen?: (data: ActionCallbackData) => void;
  onActionClose?: (data: ActionCallbackData) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export class AgentService {
  private apiKey: string | undefined;
  private apiEndpoint: string = 'https://api.anthropic.com/v1/messages';
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor() {
    // Get API key from VS Code settings or environment
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setModel(model: string) {
    this.model = model;
  }

  /**
   * Send a message to the AI agent with streaming response
   */
  async sendMessage(
    messages: AgentMessage[],
    systemPrompt: string,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const parser = new StreamingMessageParser({
      callbacks: {
        onActionOpen: callbacks.onActionOpen,
        onActionClose: callbacks.onActionClose,
      },
    });

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 8192,
          system: systemPrompt,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let fullContent = '';
      const partId = Date.now().toString();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                const chunk = parsed.delta?.text || '';
                fullContent += chunk;

                // Parse streaming artifacts
                parser.parse(partId, fullContent);

                // Send content chunk
                callbacks.onContentChunk?.(chunk);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }

      callbacks.onComplete?.();
    } catch (error) {
      callbacks.onError?.(error as Error);
    }
  }

  /**
   * Alternative: Use local agent on a port
   */
  async sendMessageToLocalAgent(
    messages: AgentMessage[],
    localPort: number,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    const parser = new StreamingMessageParser({
      callbacks: {
        onActionOpen: callbacks.onActionOpen,
        onActionClose: callbacks.onActionClose,
      },
    });

    try {
      const response = await fetch(`http://localhost:${localPort}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Local agent error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullContent = '';
      const partId = Date.now().toString();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        // Parse streaming artifacts
        parser.parse(partId, fullContent);

        // Send content chunk
        callbacks.onContentChunk?.(chunk);
      }

      callbacks.onComplete?.();
    } catch (error) {
      callbacks.onError?.(error as Error);
    }
  }
}
```

### 4. Chat Webview Provider

**`extension/src/chatProvider.ts`**

```typescript
import * as vscode from 'vscode';
import { FileWriter } from './fileWriter';
import { AgentService, type AgentMessage } from './agentService';
import type { ActionCallbackData } from '../../agent/message-parser';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myCodeAgent.chatView';
  private _view?: vscode.WebviewView;
  private messages: AgentMessage[] = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly fileWriter: FileWriter,
    private readonly agentService: AgentService
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          await this.handleUserMessage(data.message);
          break;
        case 'clearChat':
          this.clearChat();
          break;
      }
    });
  }

  private async handleUserMessage(userMessage: string) {
    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage,
    });

    // Send to webview
    this._view?.webview.postMessage({
      type: 'userMessage',
      content: userMessage,
    });

    // Create assistant message placeholder
    let assistantMessage = '';

    // Send to agent with streaming
    await this.agentService.sendMessage(
      this.messages,
      this.getSystemPrompt(),
      {
        onContentChunk: (chunk) => {
          assistantMessage += chunk;
          
          // Send chunk to webview
          this._view?.webview.postMessage({
            type: 'assistantChunk',
            content: chunk,
          });
        },
        onActionClose: async (data: ActionCallbackData) => {
          // Handle file write action
          if (data.action.type === 'file') {
            await this.fileWriter.writeFile(
              data.action.filePath,
              data.action.content
            );

            // Notify webview
            this._view?.webview.postMessage({
              type: 'fileWritten',
              filePath: data.action.filePath,
            });
          }
        },
        onComplete: () => {
          // Add assistant message to history
          this.messages.push({
            role: 'assistant',
            content: assistantMessage,
          });

          // Send complete to webview
          this._view?.webview.postMessage({
            type: 'assistantComplete',
          });
        },
        onError: (error) => {
          vscode.window.showErrorMessage(`Agent error: ${error.message}`);
          
          this._view?.webview.postMessage({
            type: 'error',
            message: error.message,
          });
        },
      }
    );
  }

  public clearChat() {
    this.messages = [];
    this._view?.webview.postMessage({
      type: 'clearChat',
    });
  }

  private getSystemPrompt(): string {
    return `You are an AI coding assistant integrated into VS Code.

When writing code, wrap it in <boltArtifact> tags with <boltAction type="file"> tags:

<boltArtifact id="example" title="Example">
  <boltAction type="file" filePath="src/index.ts">
    // Full file content here
  </boltAction>
</boltArtifact>

IMPORTANT: Always write the COMPLETE file content. Never use placeholders.`;
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // In production, load from built webview-ui
    // For now, inline simple HTML
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Code Agent</title>
      <style>
        body {
          padding: 10px;
          font-family: var(--vscode-font-family);
          color: var(--vscode-foreground);
        }
        #chat {
          height: calc(100vh - 100px);
          overflow-y: auto;
          margin-bottom: 10px;
        }
        .message {
          margin: 10px 0;
          padding: 8px;
          border-radius: 4px;
        }
        .user {
          background: var(--vscode-input-background);
        }
        .assistant {
          background: var(--vscode-editor-background);
        }
        #input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      <div id="chat"></div>
      <textarea id="input" rows="3" placeholder="Ask me to write code..."></textarea>
      <button id="send">Send</button>
      <button id="clear">Clear</button>

      <script>
        const vscode = acquireVsCodeApi();
        const chat = document.getElementById('chat');
        const input = document.getElementById('input');
        
        let currentAssistantMessage = null;

        document.getElementById('send').addEventListener('click', () => {
          const message = input.value.trim();
          if (message) {
            vscode.postMessage({ type: 'sendMessage', message });
            input.value = '';
          }
        });

        document.getElementById('clear').addEventListener('click', () => {
          vscode.postMessage({ type: 'clearChat' });
        });

        window.addEventListener('message', (event) => {
          const { type, content, filePath, message } = event.data;

          switch (type) {
            case 'userMessage':
              const userDiv = document.createElement('div');
              userDiv.className = 'message user';
              userDiv.textContent = content;
              chat.appendChild(userDiv);
              chat.scrollTop = chat.scrollHeight;
              
              // Create assistant message placeholder
              currentAssistantMessage = document.createElement('div');
              currentAssistantMessage.className = 'message assistant';
              chat.appendChild(currentAssistantMessage);
              break;

            case 'assistantChunk':
              if (currentAssistantMessage) {
                currentAssistantMessage.textContent += content;
                chat.scrollTop = chat.scrollHeight;
              }
              break;

            case 'assistantComplete':
              currentAssistantMessage = null;
              break;

            case 'fileWritten':
              const fileDiv = document.createElement('div');
              fileDiv.className = 'message assistant';
              fileDiv.textContent = '✅ Wrote file: ' + filePath;
              fileDiv.style.color = 'var(--vscode-terminal-ansiGreen)';
              chat.appendChild(fileDiv);
              chat.scrollTop = chat.scrollHeight;
              break;

            case 'error':
              const errorDiv = document.createElement('div');
              errorDiv.className = 'message assistant';
              errorDiv.textContent = '❌ Error: ' + message;
              errorDiv.style.color = 'var(--vscode-errorForeground)';
              chat.appendChild(errorDiv);
              chat.scrollTop = chat.scrollHeight;
              break;

            case 'clearChat':
              chat.innerHTML = '';
              break;
          }
        });
      </script>
    </body>
    </html>`;
  }
}
```

### 5. Package.json Configuration

**`extension/package.json`**

```json
{
  "name": "my-code-agent",
  "displayName": "My Code Agent",
  "description": "AI agent that modifies workspace files",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onView:myCodeAgent.chatView"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "myCodeAgent",
          "title": "AI Code Agent",
          "icon": "resources/icon.svg"
        }
      ]
    },
    "views": {
      "myCodeAgent": [
        {
          "type": "webview",
          "id": "myCodeAgent.chatView",
          "name": "Chat"
        }
      ]
    },
    "commands": [
      {
        "command": "myCodeAgent.openChat",
        "title": "Open AI Code Agent"
      },
      {
        "command": "myCodeAgent.clearChat",
        "title": "Clear Chat History"
      }
    ],
    "configuration": {
      "title": "AI Code Agent",
      "properties": {
        "myCodeAgent.apiKey": {
          "type": "string",
          "default": "",
          "description": "API key for AI provider"
        },
        "myCodeAgent.model": {
          "type": "string",
          "default": "claude-3-5-sonnet-20241022",
          "description": "AI model to use"
        },
        "myCodeAgent.localAgentPort": {
          "type": "number",
          "default": 3000,
          "description": "Port for local AI agent (if using)"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "pnpm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "pnpm run compile",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js"
  },
  "devDependencies": {
    "@types/node": "^18.x",
    "@types/vscode": "^1.80.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.40.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Implementation Guide

### Step 1: Copy Agent Code from Chef

Copy the following files from Chef to your agent:

```bash
# From chef/chef-agent/
cp message-parser.ts ../my-code-agent/agent/
cp types.ts ../my-code-agent/agent/
cp -r utils ../my-code-agent/agent/
cp -r prompts ../my-code-agent/agent/
```

### Step 2: Modify Message Parser

The message parser from Chef works as-is, but you may want to adjust it:

**`agent/message-parser.ts`** - Keep the streaming logic, just ensure callbacks work

### Step 3: Build and Test

```bash
# Compile TypeScript
cd extension
pnpm run compile

# Press F5 in VS Code to launch Extension Development Host
# Or run:
code --extensionDevelopmentPath=/path/to/my-code-agent
```

### Step 4: Test File Writing

1. Open a workspace folder
2. Open the AI Code Agent sidebar
3. Type: "Create a simple TypeScript hello world in src/hello.ts"
4. Watch as the file is created in real-time!

---

## Advanced Features

### 1. Git Integration

Show files that will be modified before committing:

```typescript
async showPreCommitDiff(filePath: string): Promise<void> {
  const uri = vscode.Uri.file(filePath);
  
  // Get git extension
  const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
  const git = gitExtension?.getAPI(1);
  
  if (git) {
    const repo = git.repositories[0];
    
    // Show diff
    vscode.commands.executeCommand(
      'vscode.diff',
      uri.with({ scheme: 'git' }),
      uri,
      `${path.basename(filePath)} (Working Tree)`
    );
  }
}
```

### 2. Undo/Redo Support

Track file operations for undo:

```typescript
class FileOperationHistory {
  private history: FileOperation[] = [];
  private currentIndex: number = -1;

  add(operation: FileOperation) {
    // Remove any operations after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(operation);
    this.currentIndex++;
  }

  async undo(fileWriter: FileWriter): Promise<void> {
    if (this.currentIndex < 0) return;
    
    const operation = this.history[this.currentIndex];
    // Reverse the operation
    // ...
    
    this.currentIndex--;
  }

  async redo(fileWriter: FileWriter): Promise<void> {
    if (this.currentIndex >= this.history.length - 1) return;
    
    this.currentIndex++;
    const operation = this.history[this.currentIndex];
    // Reapply the operation
    // ...
  }
}
```

### 3. Multi-file Diff View

Show all changes before applying:

```typescript
async showMultiFileDiff(operations: FileOperation[]): Promise<boolean> {
  // Show quick pick with all files
  const items = operations.map(op => ({
    label: op.filePath,
    description: op.type,
    detail: `${op.content.split('\n').length} lines`,
    operation: op,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    placeHolder: 'Select files to preview changes',
  });

  if (!selected) return false;

  // Show diff for each selected file
  for (const item of selected) {
    await this.showDiffPreview(item.operation);
  }

  // Confirm
  const confirm = await vscode.window.showInformationMessage(
    `Apply ${selected.length} file changes?`,
    { modal: true },
    'Apply',
    'Cancel'
  );

  return confirm === 'Apply';
}
```

### 4. Streaming UI Updates

Update editor in real-time as code streams:

```typescript
class StreamingFileWriter {
  private documentUpdates = new Map<string, string>();
  private updateIntervals = new Map<string, NodeJS.Timeout>();

  startStreaming(filePath: string): void {
    this.documentUpdates.set(filePath, '');
    
    // Update every 100ms
    const interval = setInterval(() => {
      this.flushUpdates(filePath);
    }, 100);
    
    this.updateIntervals.set(filePath, interval);
  }

  appendContent(filePath: string, content: string): void {
    const current = this.documentUpdates.get(filePath) || '';
    this.documentUpdates.set(filePath, current + content);
  }

  private async flushUpdates(filePath: string): Promise<void> {
    const content = this.documentUpdates.get(filePath);
    if (!content) return;

    await this.fileWriter.writeFile(filePath, content);
  }

  stopStreaming(filePath: string): void {
    const interval = this.updateIntervals.get(filePath);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(filePath);
    }
    
    // Final flush
    this.flushUpdates(filePath);
    this.documentUpdates.delete(filePath);
  }
}
```

### 5. Context Awareness

Include workspace context in prompts:

```typescript
async getWorkspaceContext(): Promise<string> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceRoot) return '';

  // Get package.json
  const packageJsonUri = vscode.Uri.joinPath(
    workspaceRoot.uri,
    'package.json'
  );
  
  let packageJson = '';
  try {
    const content = await vscode.workspace.fs.readFile(packageJsonUri);
    packageJson = Buffer.from(content).toString('utf8');
  } catch {
    // No package.json
  }

  // Get currently open files
  const openFiles = vscode.workspace.textDocuments
    .filter(doc => !doc.isUntitled)
    .map(doc => ({
      path: vscode.workspace.asRelativePath(doc.uri),
      content: doc.getText().slice(0, 500), // First 500 chars
    }));

  return `
Workspace: ${workspaceRoot.name}
Package.json: ${packageJson}
Open files: ${JSON.stringify(openFiles, null, 2)}
  `.trim();
}
```

### 6. Tool Calling Support

Add additional tools beyond file writing:

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: any;
  handler: (params: any) => Promise<string>;
}

const tools: Tool[] = [
  {
    name: 'runTerminalCommand',
    description: 'Run a command in the integrated terminal',
    parameters: {
      command: 'string',
    },
    handler: async ({ command }) => {
      const terminal = vscode.window.createTerminal('Agent');
      terminal.sendText(command);
      terminal.show();
      return `Executed: ${command}`;
    },
  },
  {
    name: 'searchFiles',
    description: 'Search for text across workspace files',
    parameters: {
      query: 'string',
    },
    handler: async ({ query }) => {
      const files = await vscode.workspace.findFiles('**/*');
      const results = [];
      
      for (const file of files) {
        const content = await vscode.workspace.fs.readFile(file);
        const text = Buffer.from(content).toString('utf8');
        
        if (text.includes(query)) {
          results.push(vscode.workspace.asRelativePath(file));
        }
      }
      
      return `Found in: ${results.join(', ')}`;
    },
  },
  {
    name: 'installPackage',
    description: 'Install an npm package',
    parameters: {
      packageName: 'string',
    },
    handler: async ({ packageName }) => {
      const terminal = vscode.window.createTerminal('Package Install');
      terminal.sendText(`npm install ${packageName}`);
      terminal.show();
      return `Installing ${packageName}...`;
    },
  },
];
```

---

## Best Practices

### 1. Safety First

**Always confirm destructive operations:**

```typescript
async confirmFileWrite(filePath: string, exists: boolean): Promise<boolean> {
  if (!exists) return true; // New files are safe
  
  const answer = await vscode.window.showWarningMessage(
    `Overwrite existing file ${filePath}?`,
    { modal: true },
    'Overwrite',
    'Cancel'
  );
  
  return answer === 'Overwrite';
}
```

**Implement file backups:**

```typescript
async backupFile(filePath: string): Promise<void> {
  const uri = vscode.Uri.file(filePath);
  const backupUri = uri.with({
    path: uri.path + `.backup.${Date.now()}`
  });
  
  const content = await vscode.workspace.fs.readFile(uri);
  await vscode.workspace.fs.writeFile(backupUri, content);
}
```

### 2. Performance

**Batch file operations:**

```typescript
async writeBatch(operations: FileOperation[]): Promise<void> {
  // Group by directory
  const byDirectory = new Map<string, FileOperation[]>();
  
  for (const op of operations) {
    const dir = path.dirname(op.filePath);
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, []);
    }
    byDirectory.get(dir)!.push(op);
  }
  
  // Write directory by directory
  for (const [dir, ops] of byDirectory) {
    await this.ensureDirectory(dir);
    
    await Promise.all(
      ops.map(op => this.writeFile(op.filePath, op.content))
    );
  }
}
```

### 3. Error Handling

**Graceful degradation:**

```typescript
async writeFileWithRetry(
  filePath: string,
  content: string,
  retries: number = 3
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await this.writeFile(filePath, content);
      return true;
    } catch (error) {
      if (i === retries - 1) {
        vscode.window.showErrorMessage(
          `Failed to write ${filePath}: ${error.message}`
        );
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  return false;
}
```

### 4. User Experience

**Show progress for long operations:**

```typescript
await vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: 'AI Agent',
    cancellable: true,
  },
  async (progress, token) => {
    for (let i = 0; i < operations.length; i++) {
      if (token.isCancellationRequested) {
        break;
      }
      
      progress.report({
        message: `Processing ${operations[i].filePath}...`,
        increment: (100 / operations.length),
      });
      
      await this.writeFile(
        operations[i].filePath,
        operations[i].content
      );
    }
  }
);
```

### 5. Testing

**Unit test file operations:**

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import { FileWriter } from '../fileWriter';

suite('FileWriter Tests', () => {
  test('writeFile creates new file', async () => {
    const writer = new FileWriter('/tmp/test');
    await writer.writeFile('test.txt', 'Hello, World!');
    
    const uri = vscode.Uri.file('/tmp/test/test.txt');
    const content = await vscode.workspace.fs.readFile(uri);
    
    assert.strictEqual(
      Buffer.from(content).toString('utf8'),
      'Hello, World!'
    );
  });
});
```

---

## Deployment

### 1. Package Extension

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
cd extension
vsce package

# This creates my-code-agent-0.0.1.vsix
```

### 2. Install Locally

```bash
# Install from VSIX
code --install-extension my-code-agent-0.0.1.vsix
```

### 3. Publish to Marketplace

```bash
# Create publisher account at https://marketplace.visualstudio.com/

# Login
vsce login <publisher-name>

# Publish
vsce publish
```

### 4. Auto-update

Set up GitHub Actions for automatic publishing:

```yaml
# .github/workflows/publish.yml
name: Publish Extension

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd extension
          npm install
      
      - name: Publish to Marketplace
        run: |
          cd extension
          npx vsce publish -p ${{ secrets.VSCE_PAT }}
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution:** Ensure all imports use correct paths:

```typescript
// Wrong
import { Parser } from 'agent/message-parser';

// Right
import { Parser } from '../../agent/message-parser';
```

#### 2. Webview not loading

**Solution:** Check Content Security Policy:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               script-src 'unsafe-inline' vscode-resource:; 
               style-src vscode-resource: 'unsafe-inline';">
```

#### 3. File write permissions

**Solution:** Check workspace trust:

```typescript
if (!vscode.workspace.isTrusted) {
  vscode.window.showErrorMessage(
    'Workspace must be trusted to modify files'
  );
  return;
}
```

#### 4. Streaming not working

**Solution:** Ensure proper buffering:

```typescript
// Bad - loses data
const chunk = decoder.decode(value);

// Good - handles partial UTF-8
const chunk = decoder.decode(value, { stream: true });
```

---

## Next Steps

### Enhancements to Consider

1. **Multi-model support** - Add OpenAI, Google, etc.
2. **Custom prompts** - Let users customize system prompts
3. **File templates** - Pre-built templates for common tasks
4. **Code review** - AI reviews changes before applying
5. **Test generation** - Auto-generate tests for new code
6. **Documentation** - Auto-generate docs from code
7. **Refactoring tools** - Rename, extract, inline, etc.
8. **Collaborative editing** - Multiple users with one agent

### Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Chef Source Code](https://github.com/get-convex/chef)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Anthropic API Docs](https://docs.anthropic.com/)

---

## Conclusion

You now have a complete guide to building a VS Code extension that:
- ✅ Integrates AI agents with real file modification
- ✅ Uses streaming artifact parsing (like Chef)
- ✅ Shows real-time code updates
- ✅ Works with VS Code's native features
- ✅ Provides a great developer experience

This architecture gives you the best of both worlds: Chef's elegant streaming approach with VS Code's powerful file system integration.

Happy coding! 🚀
