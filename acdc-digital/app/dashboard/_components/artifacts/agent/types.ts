import { Id } from "@/convex/_generated/dataModel";

export type AgentIntent = 
  | "create_document"
  | "edit_document"
  | "append_content"
  | "replace_content"
  | "format_content"
  | "clear_document"
  | "general_chat";

export interface AgentContext {
  sessionId: string;
  documentId: Id<"documents">;
  userId?: string;
  conversationHistory: ChatMessage[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>, context: AgentContext) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: Record<string, unknown> | string | number | boolean;
  error?: string;
  sideEffects?: SideEffect[];
}

export interface SideEffect {
  type: "document_update" | "notification" | "log";
  payload: Record<string, unknown> | string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    intent?: AgentIntent;
    toolsUsed?: string[];
    documentChanges?: boolean;
  };
}

export interface AgentResponse {
  response: string;
  intent: AgentIntent;
  documentUpdated: boolean;
  confidence?: number;
  toolsUsed?: string[];
}

export interface DocumentUpdate {
  type: "create" | "edit" | "append" | "replace" | "format" | "clear";
  content: string;
  blocks?: BlockNoteBlock[];
  metadata?: {
    source: "agent";
    intent: AgentIntent;
    timestamp: number;
  };
}

export interface BlockNoteBlock {
  id: string;
  type: string;
  props: Record<string, string | number | boolean>;
  content: Array<{
    type: string;
    text?: string;
    styles?: Record<string, string | number | boolean>;
  }>;
  children: BlockNoteBlock[];
}

export interface AgentStatus {
  isProcessing: boolean;
  currentAction?: string;
  progress?: number;
  error?: string;
}

export interface AgentState {
  isProcessing: boolean;
  currentIntent?: AgentIntent;
  lastDocumentUpdate?: boolean;
  confidence?: number;
  reasoning?: string;
  error?: string;
}