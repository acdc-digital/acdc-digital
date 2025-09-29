// SESSION MANAGER INDEX
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/index.ts

/**
 * Session Manager Module Exports
 *
 * Central export point for all session manager components and services
 *
 * NOTES:
 * - Legacy SessionChatAgent removed - use Nexus agents via /api/agents/stream
 * - Legacy mcpClient and nlpMcpParser removed - SessionManagerAgent now uses MCP server HTTP calls
 */

// Core service
export { sessionChatService, SessionChatService } from './sessionChatService';
export type { 
  ChatMessage as ServiceChatMessage, 
  ChatOptions, 
  ChatResponse 
} from './sessionChatService';

// Main components
export { Chat } from './Chat';
export type { ChatProps, ChatState } from './Chat';

// Sub-components
export { ChatMessage } from './_components/ChatMessage';
export type { ChatMessageProps } from './_components/ChatMessage';

export { ChatSettings } from './_components/ChatSettings';
export type { ChatSettingsProps } from './_components/ChatSettings';