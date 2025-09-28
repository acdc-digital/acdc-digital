/**
 * Editor Types and Interfaces for SMNB TipTap Editor System
 * Defines all TypeScript interfaces for editor content, states, changes, and AI integration
 */

import { Id } from "../../convex/_generated/dataModel";

// Content and Document Types
export interface EditorContent {
  /** HTML content from TipTap editor */
  html: string;
  /** JSON content for TipTap state persistence */
  json: object;
  /** Markdown export for external systems */
  markdown?: string;
  /** Plain text version for analysis */
  text: string;
  /** Word count for display */
  wordCount: number;
  /** Character count for display */
  characterCount: number;
  /** Creation timestamp */
  createdAt: number;
  /** Last modified timestamp */
  lastModified: number;
}

// Content Type Management
export interface GeneratedContentState {
  /** Whether content has been generated for this type */
  isGenerated: boolean;
  /** Generated HTML content */
  html: string;
  /** Generated JSON content */
  json: any;
  /** Generation timestamp */
  generatedAt: number;
}

// Editor States and Status
export type EditorStatus = 'draft' | 'editing' | 'ai-processing' | 'completed' | 'error';

export interface EditorState {
  /** Current document content */
  content: EditorContent;
  /** Current editing status */
  status: EditorStatus;
  /** Whether editor is focused */
  isFocused: boolean;
  /** Whether content has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether AI is currently processing */
  isAIProcessing: boolean;
  /** Current selection range */
  selection?: {
    from: number;
    to: number;
  };
  /** Collaborative editing metadata */
  collaboration?: {
    userId: string;
    userName: string;
    lastSeenAt: number;
  };
}

// AI Integration Types
export interface AIRequest {
  /** Unique request ID */
  id: string;
  /** Type of AI operation */
  type: AIRequestType;
  /** Input content for AI */
  input: string;
  /** Optional selection context */
  selection?: {
    from: number;
    to: number;
    text: string;
  };
  /** Additional context or instructions */
  context?: string;
  /** Request timestamp */
  timestamp: number;
}

export type AIRequestType = 
  | 'enhance'           // Improve writing quality
  | 'summarize'         // Create summary
  | 'expand'            // Add more detail
  | 'rewrite'           // Rewrite content
  | 'proofread'         // Grammar and spelling
  | 'tone'              // Adjust tone
  | 'translate'         // Language translation
  | 'blog-post'         // Transform to analytical blog post
  | 'newsletter-format' // Format as newsletter
  | 'add-analysis'      // Add analytical depth
  | 'add-context'       // Add background context
  | 'social-insights'   // Analyze social media implications
  | 'custom';           // Custom prompt

export interface AIResponse {
  /** Request ID this responds to */
  requestId: string;
  /** AI-generated content */
  content: string;
  /** Whether response was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** Processing metadata */
  metadata?: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
  /** Response timestamp */
  timestamp: number;
}

// Change Tracking and Version Control
export interface EditorChange {
  /** Unique change ID */
  id: string;
  /** Type of change */
  type: ChangeType;
  /** Content before change */
  before: string;
  /** Content after change */
  after: string;
  /** Position where change occurred */
  position: {
    from: number;
    to: number;
  };
  /** User who made the change */
  author: {
    id: string;
    name: string;
  };
  /** Change timestamp */
  timestamp: number;
  /** Whether change was AI-generated */
  isAIGenerated: boolean;
  /** Associated AI request if applicable */
  aiRequestId?: string;
}

export type ChangeType = 
  | 'insert'    // Text insertion
  | 'delete'    // Text deletion
  | 'replace'   // Text replacement
  | 'format'    // Formatting change
  | 'ai-edit';  // AI-generated edit

export interface ChangeTracker {
  /** All tracked changes */
  changes: EditorChange[];
  /** Current change being tracked */
  currentChange?: EditorChange;
  /** Whether tracking is enabled */
  isTracking: boolean;
  /** Maximum changes to keep in memory */
  maxChanges: number;
}

// Visual Feedback Types
export interface VisualFeedback {
  /** Current status color */
  statusColor: StatusColor;
  /** Status message for user */
  statusMessage: string;
  /** Progress indicator (0-100) */
  progress?: number;
  /** Whether to show typing indicator */
  showTypingIndicator: boolean;
  /** Whether to show AI processing animation */
  showAIAnimation: boolean;
  /** Active change highlights */
  highlights: ChangeHighlight[];
}

export type StatusColor = 
  | 'gray'    // Draft
  | 'blue'    // Editing
  | 'yellow'  // AI Processing
  | 'green'   // Completed
  | 'red';    // Error

export interface ChangeHighlight {
  /** Highlight ID */
  id: string;
  /** Text range to highlight */
  range: {
    from: number;
    to: number;
  };
  /** Highlight color */
  color: 'added' | 'removed' | 'modified' | 'ai-suggestion';
  /** Optional tooltip text */
  tooltip?: string;
  /** Duration to show highlight (ms) */
  duration?: number;
}

// Producer Integration Types
export interface ProducerContent {
  /** Story ID from producer */
  storyId: Id<"story_history">;
  /** Original story content */
  content: string;
  /** Story metadata */
  metadata: {
    title: string;
    summary: string;
    tags: string[];
    sentiment: string;
    priority: number;
  };
  /** Timestamp when handed off to editor */
  handoffTimestamp: number;
}

// Editor Configuration
export interface EditorConfig {
  /** Enable AI features */
  enableAI: boolean;
  /** Enable change tracking */
  enableChangeTracking: boolean;
  /** Enable collaborative editing */
  enableCollaboration: boolean;
  /** Auto-save interval (ms) */
  autoSaveInterval: number;
  /** Maximum content length */
  maxContentLength?: number;
  /** Placeholder text */
  placeholder: string;
  /** Editor theme */
  theme: 'light' | 'dark' | 'auto';
  /** Toolbar configuration */
  toolbar: {
    enabled: boolean;
    items: ToolbarItem[];
  };
}

export type ToolbarItem = 
  | 'bold' | 'italic' | 'underline' | 'strike'
  | 'h1' | 'h2' | 'h3'
  | 'bullet-list' | 'ordered-list'
  | 'blockquote' | 'code-block'
  | 'link' | 'image'
  | 'ai-enhance' | 'ai-rewrite'
  | 'undo' | 'redo';

// Content Type for persistent storage and button identification  
export type ContentType = 'newsletter';

// Store Actions Interface
export interface EditorActions {
  // Content Management
  setContent: (content: Partial<EditorContent>) => void;
  updateContent: (html: string, json: object) => void;
  clearContent: () => void;
  
  // Status Management
  setStatus: (status: EditorStatus) => void;
  setFocused: (focused: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  
  // Persistent Content Management
  setCurrentStory: (storyId: string) => void;
  loadContent: (storyId: string, contentType: ContentType) => Promise<string | null>;
  saveContent: (storyId: string, contentType: ContentType, content: string) => Promise<void>;
  checkContentExists: (storyId: string, contentType: ContentType) => Promise<boolean>;
  
  // Content Type Management
  setCurrentContentType: (contentType: ContentType) => void;
  getContentForType: (contentType: ContentType) => GeneratedContentState | undefined;
  preserveContentForType: (contentType: ContentType, html: string, json: any) => void;
  hasGeneratedContent: (contentType: ContentType) => boolean;
  clearGeneratedContent: (contentType?: ContentType) => void;
  clearStoryState: (storyId?: string) => void;
  
  // AI Integration
  requestAI: (request: Omit<AIRequest, 'id' | 'timestamp'>, textEditorHandler?: any, useStreaming?: boolean) => Promise<void>;
  handleAIResponse: (response: AIResponse) => void;
  setAIProcessing: (processing: boolean) => void;
  
  // Change Tracking
  addChange: (change: Omit<EditorChange, 'id' | 'timestamp'>) => void;
  clearChanges: () => void;
  toggleChangeTracking: () => void;
  
  // Visual Feedback
  updateVisualFeedback: (feedback: Partial<VisualFeedback>) => void;
  addHighlight: (highlight: Omit<ChangeHighlight, 'id'>) => void;
  removeHighlight: (id: string) => void;
  
  // Producer Integration
  receiveFromProducer: (content: ProducerContent) => void;
  completeStory: () => void;
  
  // Configuration
  updateConfig: (config: Partial<EditorConfig>) => void;
  
  // Auto-save Management
  restoreFromAutoSave: (storyId?: string, contentType?: ContentType) => boolean;
  clearAutoSave: (storyId?: string, contentType?: ContentType) => void;
}

// Complete Store State Interface
export interface EditorStore extends EditorState, EditorActions {
  /** Change tracker instance */
  changeTracker: ChangeTracker;
  /** Visual feedback state */
  visualFeedback: VisualFeedback;
  /** Producer content if received */
  producerContent?: ProducerContent;
  /** Editor configuration */
  config: EditorConfig;
  /** AI request/response history */
  aiHistory: {
    requests: AIRequest[];
    responses: AIResponse[];
  };
  /** Current story ID for persistence */
  currentStoryId?: string;
  /** Current content type being edited */
  currentContentType?: ContentType;
  /** Generated content state for each story and content type */
  generatedContent: Map<string, Map<ContentType, GeneratedContentState>>;
  /** Generation status tracking for each story and content type */
  generationStatus: Map<string, Map<ContentType, boolean>>;
  /** Previous story ID for cleanup tracking */
  previousStoryId?: string;
}