// SESSION MANAGER INDEX
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/index.ts

/**
 * Session Manager Module Exports
 *
 * Central export point for all session manager components and services
 *
 * ARCHITECTURE:
 * - Uses ACDC Framework with SessionManagerAgent
 * - Streaming via /api/agents/stream endpoint
 * - MCP Server integration for analytics
 * - All chat functionality through ACDCChat component
 */

// Main ACDC Chat Component (Recommended)
export { ACDCChat } from './ACDCChat';
export type { ACDCChatProps } from './ACDCChat';

// Legacy components (DEPRECATED - Use ACDCChat instead)
export { Chat } from './Chat';
export type { ChatProps, ChatState } from './Chat';

export { ChatMessage } from './_components/ChatMessage';
export type { ChatMessageProps } from './_components/ChatMessage';

export { ChatSettings } from './_components/ChatSettings';
export type { ChatSettingsProps } from './_components/ChatSettings';