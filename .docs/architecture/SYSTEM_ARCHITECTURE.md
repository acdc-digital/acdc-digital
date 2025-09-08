# AI-Powered Collaborative Text Editor - System Architecture

## Overview
This document provides a comprehensive mapping of the AI-powered collaborative text editor system, including detailed file overviews, component relationships, and data flow patterns.

## System Architecture Diagram

```mermaid
flowchart TD
    %% User Interface Layer
    subgraph "Frontend - Next.js"
        A[Dashboard Page<br/>app/dashboard/page.tsx] --> B[Artifact Component<br/>components/artifact.tsx]
        B --> C[Chat Interface<br/>components/chat-interface.tsx]
        B --> D[Shared Text Editor<br/>components/shared-text-editor.tsx]
        
        E[ConvexClientProvider<br/>components/ConvexClientProvider.tsx] --> F[Real-time Data Sync]
    end
    
    %% Backend Layer
    subgraph "Backend - Convex"
        G[Document Operations<br/>convex/documents.ts] --> H[Database Schema<br/>convex/schema.ts]
        I[Chat Messages<br/>convex/chatMessages.ts] --> H
        
        subgraph "AI Agent System"
            J[Agent Orchestrator<br/>convex/agents/orchestrator.ts]
            K[Intent Classifier<br/>convex/agents/intents.ts]
            L[Editor Tools<br/>convex/agents/tools.ts]
            
            J --> K
            K --> L
        end
    end
    
    %% External Services
    subgraph "AI Services"
        M[Claude 3.5 Sonnet<br/>Anthropic API]
    end
    
    %% Database
    subgraph "Database Tables"
        N[(Documents Table<br/>id, title, content)]
        O[(Chat Messages Table<br/>id, message, role, timestamp)]
    end
    
    %% Data Flow Connections
    C -.->|User Messages| I
    I -.->|Store Messages| O
    C -.->|AI Requests| J
    J -.->|API Calls| M
    M -.->|AI Responses| J
    J -.->|Content Updates| G
    G -.->|Document Storage| N
    D -.->|Editor Changes| G
    G -.->|Real-time Updates| D
    F -.->|WebSocket Connection| G
    F -.->|WebSocket Connection| I
    
    %% Configuration Files
    subgraph "Configuration"
        P[Next.js Config<br/>next.config.ts]
        Q[Tailwind Config<br/>tailwind.config.ts]
        R[TypeScript Config<br/>tsconfig.json]
        S[ESLint Config<br/>eslint.config.mjs]
    end
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef ai fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef config fill:#fafafa,stroke:#616161,stroke-width:1px
    
    class A,B,C,D,E,F frontend
    class G,H,I,J,K,L backend
    class M ai
    class N,O database
    class P,Q,R,S config
```

## Detailed File Mapping

### 🎨 Frontend Components (Next.js App Router)

#### Core Pages
- **`app/dashboard/page.tsx`**
  - *Purpose*: Main dashboard entry point with collaborative workspace
  - *Function*: Renders the primary interface with artifact management
  - *Dependencies*: Artifact component, ConvexClientProvider
  - *Key Features*: Document selection, real-time collaboration setup

- **`app/layout.tsx`**
  - *Purpose*: Root layout wrapper for the entire application
  - *Function*: Provides global providers, styling, and HTML structure
  - *Dependencies*: ConvexClientProvider, global CSS, Inter font
  - *Key Features*: Convex integration, responsive design setup

#### Interactive Components
- **`components/artifact.tsx`**
  - *Purpose*: Central artifact container managing chat and editor
  - *Function*: Coordinates between chat interface and text editor
  - *Dependencies*: Chat interface, shared text editor, Convex hooks
  - *Key Features*: State management, component orchestration, real-time sync

- **`components/chat-interface.tsx`**
  - *Purpose*: AI-powered chat interface for content generation
  - *Function*: Handles user messages, AI responses, and context management
  - *Dependencies*: Convex mutations, agent orchestrator
  - *Key Features*: Message history, AI integration, intent recognition

- **`components/shared-text-editor.tsx`**
  - *Purpose*: Collaborative Tiptap-based rich text editor
  - *Function*: Provides HTML editing with real-time collaboration
  - *Dependencies*: Tiptap, Convex document operations
  - *Key Features*: Rich text editing, auto-save, real-time updates

#### Infrastructure
- **`components/ConvexClientProvider.tsx`**
  - *Purpose*: Convex client configuration and context provider
  - *Function*: Establishes WebSocket connection for real-time features
  - *Dependencies*: Convex React client, environment variables
  - *Key Features*: Real-time data sync, client-side state management

### 🔧 Backend Functions (Convex)

#### Database Operations
- **`convex/documents.ts`**
  - *Purpose*: Document CRUD operations and real-time sync
  - *Function*: Manages document storage, retrieval, and updates
  - *Dependencies*: Database schema, Convex validators
  - *Key Features*: Document queries, mutations, content persistence

- **`convex/chatMessages.ts`**
  - *Purpose*: Chat message storage and retrieval system
  - *Function*: Handles message history and conversation context
  - *Dependencies*: Database schema, message validators
  - *Key Features*: Message queries, conversation threading, persistence

- **`convex/schema.ts`**
  - *Purpose*: Database schema definition and table structure
  - *Function*: Defines data models and relationships
  - *Dependencies*: Convex schema validators
  - *Key Features*: Type safety, data validation, indexing

#### AI Agent System
- **`convex/agents/orchestrator.ts`**
  - *Purpose*: Central AI agent coordinator and request handler
  - *Function*: Routes requests, manages AI interactions, coordinates tools
  - *Dependencies*: Intent classifier, editor tools, Anthropic API
  - *Key Features*: Request routing, response handling, tool coordination

- **`convex/agents/intents.ts`**
  - *Purpose*: Intent classification and request parsing
  - *Function*: Analyzes user requests to determine appropriate actions
  - *Dependencies*: AI classification models, intent definitions
  - *Key Features*: Natural language understanding, intent recognition

- **`convex/agents/tools.ts`**
  - *Purpose*: AI tool definitions for content manipulation
  - *Function*: Provides specific tools for document editing and generation
  - *Dependencies*: Document operations, content validators
  - *Key Features*: Content generation, editing operations, tool registry

### 📊 Database Schema

#### Tables Structure
```mermaid
erDiagram
    DOCUMENTS {
        id Id
        title string
        content string
        creationTime number
    }
    
    CHAT_MESSAGES {
        id Id
        message string
        role string
        timestamp number
        documentId Id
    }
    
    DOCUMENTS ||--o{ CHAT_MESSAGES : "has conversations"
```

### 🔄 Data Flow Patterns

#### User Interaction Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat Interface
    participant O as Orchestrator
    participant AI as Claude 3.5
    participant E as Text Editor
    participant DB as Database
    
    U->>C: Types message
    C->>DB: Store user message
    C->>O: Send AI request
    O->>AI: Process with context
    AI->>O: Return response
    O->>DB: Update document
    DB->>E: Real-time sync
    E->>U: Display updated content
    O->>C: Return AI response
    C->>DB: Store AI message
    C->>U: Display response
```

#### Real-time Collaboration Flow
```mermaid
flowchart LR
    A[User Edit] --> B[Tiptap Editor]
    B --> C[Convex Mutation]
    C --> D[Database Update]
    D --> E[Real-time Sync]
    E --> F[Other Clients]
    F --> G[Editor Updates]
```

### ⚙️ Configuration Files

#### Development Configuration
- **`next.config.ts`**
  - *Purpose*: Next.js application configuration
  - *Function*: Build settings, optimizations, environment setup
  - *Key Features*: TypeScript support, build optimizations

- **`tailwind.config.ts`**
  - *Purpose*: Tailwind CSS configuration and theming
  - *Function*: Design system setup, custom utilities
  - *Key Features*: Design tokens, responsive breakpoints

- **`tsconfig.json`**
  - *Purpose*: TypeScript compiler configuration
  - *Function*: Type checking, compilation settings
  - *Key Features*: Strict typing, path mapping

- **`eslint.config.mjs`**
  - *Purpose*: Code quality and style enforcement
  - *Function*: Linting rules, code standards
  - *Key Features*: Next.js rules, TypeScript integration

### 🎯 Key Integration Points

#### Frontend ↔ Backend
- **Real-time Updates**: Convex WebSocket connections for live collaboration
- **State Management**: React hooks integrated with server state
- **Type Safety**: Shared TypeScript types between frontend and backend

#### AI Integration
- **Intent Recognition**: Natural language processing for user requests
- **Content Generation**: AI-powered document creation and editing
- **Context Awareness**: Conversation history and document context

#### Database Operations
- **Real-time Queries**: Live data subscriptions for collaboration
- **Optimistic Updates**: Client-side predictions for smooth UX
- **Conflict Resolution**: Automatic handling of concurrent edits

## Technology Stack Summary

### Frontend Technologies
- **Next.js 15+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Tiptap**: Rich text editor framework
- **Convex React**: Real-time data hooks

### Backend Technologies
- **Convex**: Real-time backend platform
- **TypeScript**: Server-side type safety
- **Anthropic Claude**: AI content generation
- **WebSocket**: Real-time communication

### Development Tools
- **ESLint**: Code quality enforcement
- **PostCSS**: CSS processing
- **pnpm**: Package management
- **Git**: Version control

## Deployment Architecture

```mermaid
flowchart TD
    A[GitHub Repository] --> B[Vercel Deployment]
    A --> C[Convex Cloud]
    
    B --> D[Next.js Frontend]
    C --> E[Convex Backend]
    C --> F[Real-time Database]
    
    G[Anthropic API] --> E
    
    classDef deployment fill:#e3f2fd,stroke:#1976d2
    classDef service fill:#f3e5f5,stroke:#7b1fa2
    classDef external fill:#fff3e0,stroke:#f57c00
    
    class A,B,C deployment
    class D,E,F service
    class G external
```

This architecture provides a robust foundation for AI-powered collaborative editing with real-time synchronization, intelligent content generation, and seamless user experience.