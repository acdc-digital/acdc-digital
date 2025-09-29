// SESSION MANAGER INDEX
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/index.ts

/**
 * Session Manager Module Exports
 * 
 * Central export point for all session manager components and services
 */

// Core service
export { sessionChatService, SessionChatService } from './sessionChatService';
export type { 
  ChatMessage as ServiceChatMessage, 
  ChatOptions, 
  ChatResponse 
} from './sessionChatService';

// Session Chat Agent with MCP integration
export { SessionChatAgent, sessionChatAgent } from './SessionChatAgent';
export type { SessionChatInput } from './SessionChatAgent';

// MCP Client and NLP Parser
export { mcpClient } from './mcpClient';
export type { MCPToolResult } from './mcpClient';
export { nlpMcpParser } from './nlpMcpParser';
export type { ParsedQuery, NLPResult } from './nlpMcpParser';

// Main components
export { Chat } from './Chat';
export type { ChatProps, ChatState } from './Chat';

// Sub-components
export { ChatMessage } from './_components/ChatMessage';
export type { ChatMessageProps } from './_components/ChatMessage';

export { ChatSettings } from './_components/ChatSettings';
export type { ChatSettingsProps } from './_components/ChatSettings';