# Component Mapping Charts - AI-Powered Collaborative Text Editor

## C4 System Context Diagram

```mermaid
C4Context
    title System Context - AI-Powered Collaborative Text Editor

    Person(user, "Content Creator", "Creates and edits documents collaboratively")
    Person(collaborator, "Collaborators", "Other users working on shared documents")
    
    System_Boundary(b1, "ACDC Digital Platform") {
        System(webapp, "AI Text Editor", "Next.js application providing collaborative editing with AI assistance")
    }
    
    System_Ext(convex, "Convex Backend", "Real-time database and serverless functions platform")
    System_Ext(anthropic, "Claude 3.5 Sonnet", "AI content generation and assistance service")
    System_Ext(vercel, "Vercel Platform", "Frontend hosting and deployment")
    
    Rel(user, webapp, "Creates and edits documents", "HTTPS")
    Rel(collaborator, webapp, "Collaborates on documents", "HTTPS")
    Rel(webapp, convex, "Stores data and executes functions", "WebSocket/HTTPS")
    Rel(webapp, anthropic, "Requests AI assistance", "HTTPS API")
    Rel(vercel, webapp, "Hosts application")
    
    UpdateElementStyle(user, $bgColor="#e1f5fe", $fontColor="#0277bd")
    UpdateElementStyle(collaborator, $bgColor="#e1f5fe", $fontColor="#0277bd")
    UpdateElementStyle(webapp, $bgColor="#f3e5f5", $fontColor="#7b1fa2")
    UpdateElementStyle(convex, $bgColor="#e8f5e8", $fontColor="#388e3c")
    UpdateElementStyle(anthropic, $bgColor="#fff3e0", $fontColor="#f57c00")
```

## C4 Container Diagram

```mermaid
C4Container
    title Container Diagram - AI-Powered Collaborative Text Editor

    Person(user, "Content Creator", "Creates and edits documents with AI assistance")
    
    System_Ext(anthropic, "Claude 3.5 Sonnet", "AI content generation service")
    
    Container_Boundary(frontend, "Frontend Application") {
        Container(nextjs, "Next.js App", "React/TypeScript", "Web application providing user interface")
        Container(components, "UI Components", "React/Tiptap", "Chat interface, text editor, artifact management")
    }
    
    Container_Boundary(backend, "Convex Backend") {
        Container(functions, "Convex Functions", "TypeScript", "Serverless functions for data operations")
        Container(agents, "AI Agent System", "TypeScript", "Orchestrates AI interactions and tools")
        ContainerDb(database, "Convex Database", "Real-time Database", "Documents, chat messages, user data")
    }
    
    Rel(user, nextjs, "Interacts with", "HTTPS")
    Rel(nextjs, components, "Renders")
    Rel(components, functions, "Queries/Mutations", "WebSocket")
    Rel(components, agents, "AI Requests", "WebSocket")
    Rel(agents, anthropic, "Content Generation", "HTTPS API")
    Rel(functions, database, "Read/Write", "Internal")
    Rel(agents, database, "Store Results", "Internal")
    
    UpdateElementStyle(user, $bgColor="#e1f5fe", $fontColor="#0277bd")
    UpdateElementStyle(nextjs, $bgColor="#f3e5f5", $fontColor="#7b1fa2")
    UpdateElementStyle(components, $bgColor="#f3e5f5", $fontColor="#7b1fa2")
    UpdateElementStyle(functions, $bgColor="#e8f5e8", $fontColor="#388e3c")
    UpdateElementStyle(agents, $bgColor="#fff3e0", $fontColor="#f57c00")
    UpdateElementStyle(database, $bgColor="#e8f5e8", $fontColor="#388e3c")
    UpdateElementStyle(anthropic, $bgColor="#fff3e0", $fontColor="#f57c00")
```

## Chat Interface Data Flow

```mermaid
sequenceDiagram
    participant User
    participant ChatInterface as Chat Interface
    participant Orchestrator as AI Orchestrator
    participant Intents as Intent Classifier
    participant Tools as Editor Tools
    participant Claude as Claude 3.5 Sonnet
    participant DB as Database
    participant Editor as Text Editor

    User->>ChatInterface: Types message
    ChatInterface->>DB: Store user message
    ChatInterface->>Orchestrator: Send AI request
    Orchestrator->>Intents: Classify intent
    Intents-->>Orchestrator: Return intent type
    Orchestrator->>Tools: Select appropriate tools
    Tools-->>Orchestrator: Return tool definitions
    Orchestrator->>Claude: Send request with context
    Claude-->>Orchestrator: Return AI response
    Orchestrator->>DB: Update document content
    DB-->>Editor: Real-time sync update
    Editor-->>User: Display updated content
    Orchestrator-->>ChatInterface: Return response
    ChatInterface->>DB: Store AI message
    ChatInterface-->>User: Display AI response
```

## Component Interaction Map

```mermaid
graph TD
    subgraph "User Interface Layer"
        A[Dashboard Page] --> B[Artifact Component]
        B --> C[Chat Interface]
        B --> D[Text Editor]
        E[Convex Provider] --> F[Real-time Hooks]
    end
    
    subgraph "State Management"
        G[useQuery Hooks] --> H[Document State]
        I[useMutation Hooks] --> J[Action Dispatch]
        F --> G
        F --> I
    end
    
    subgraph "Backend Functions"
        K[Document Queries] --> L[Database Tables]
        M[Chat Mutations] --> L
        N[AI Agent Actions] --> O[External APIs]
    end
    
    C -.->|Messages| M
    D -.->|Changes| K
    G -.->|Subscribe| K
    I -.->|Execute| M
    I -.->|Execute| N
    
    classDef ui fill:#e3f2fd,stroke:#1976d2
    classDef state fill:#f3e5f5,stroke:#7b1fa2
    classDef backend fill:#e8f5e8,stroke:#388e3c
    
    class A,B,C,D,E,F ui
    class G,H,I,J state
    class K,L,M,N,O backend
```

## File Dependency Graph

```mermaid
graph LR
    subgraph "Pages"
        A[dashboard/page.tsx]
        B[layout.tsx]
    end
    
    subgraph "Components"
        C[artifact.tsx]
        D[chat-interface.tsx]
        E[shared-text-editor.tsx]
        F[ConvexClientProvider.tsx]
    end
    
    subgraph "Convex Functions"
        G[documents.ts]
        H[chatMessages.ts]
        I[schema.ts]
        J[agents/orchestrator.ts]
        K[agents/intents.ts]
        L[agents/tools.ts]
    end
    
    subgraph "Configuration"
        M[next.config.ts]
        N[tailwind.config.ts]
        O[tsconfig.json]
    end
    
    A --> C
    B --> F
    C --> D
    C --> E
    D --> H
    E --> G
    F --> G
    F --> H
    G --> I
    H --> I
    J --> K
    J --> L
    K --> L
    
    classDef pages fill:#e1f5fe
    classDef components fill:#f3e5f5
    classDef convex fill:#e8f5e8
    classDef config fill:#fafafa
    
    class A,B pages
    class C,D,E,F components
    class G,H,I,J,K,L convex
    class M,N,O config
```

## Real-time Collaboration Flow

```mermaid
flowchart TD
    A[User Types in Editor] --> B{Change Type}
    B -->|Text Edit| C[Tiptap Change Event]
    B -->|AI Request| D[Chat Message]
    
    C --> E[debounced Update]
    E --> F[Convex Mutation]
    F --> G[Database Update]
    G --> H[Real-time Broadcast]
    H --> I[Other Clients Update]
    
    D --> J[Store Message]
    J --> K[AI Orchestrator]
    K --> L[Intent Classification]
    L --> M[Tool Selection]
    M --> N[Claude API Call]
    N --> O[Content Generation]
    O --> P[Document Update]
    P --> G
    
    classDef user fill:#e1f5fe,stroke:#0277bd
    classDef process fill:#f3e5f5,stroke:#7b1fa2
    classDef ai fill:#fff3e0,stroke:#f57c00
    classDef db fill:#e8f5e8,stroke:#388e3c
    
    class A user
    class C,E,F,H,I,J process
    class K,L,M,N,O ai
    class G,P db
```

## Technology Stack Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[Next.js 15 App Router]
        B[React Components]
        C[Tailwind CSS]
        D[TypeScript]
    end
    
    subgraph "Client State Layer"
        E[Convex React Hooks]
        F[Real-time Subscriptions]
        G[Optimistic Updates]
    end
    
    subgraph "Business Logic Layer"
        H[Convex Functions]
        I[AI Agent System]
        J[Content Validation]
    end
    
    subgraph "Data Layer"
        K[Convex Database]
        L[Real-time Sync]
        M[Schema Validation]
    end
    
    subgraph "External Services"
        N[Claude 3.5 Sonnet]
        O[Vercel Deployment]
        P[Convex Cloud]
    end
    
    A --> E
    B --> E
    E --> H
    F --> L
    H --> K
    I --> N
    H --> P
    O --> A
    
    classDef presentation fill:#e3f2fd,stroke:#1976d2
    classDef client fill:#f3e5f5,stroke:#7b1fa2
    classDef business fill:#fff3e0,stroke:#f57c00
    classDef data fill:#e8f5e8,stroke:#388e3c
    classDef external fill:#fce4ec,stroke:#c2185b
    
    class A,B,C,D presentation
    class E,F,G client
    class H,I,J business
    class K,L,M data
    class N,O,P external
```

## AI Agent Architecture

```mermaid
flowchart TD
    A[User Message] --> B[Agent Orchestrator]
    B --> C{Message Type}
    
    C -->|Content Request| D[Content Intent]
    C -->|Edit Request| E[Edit Intent]
    C -->|Question| F[Query Intent]
    
    D --> G[Content Generation Tool]
    E --> H[Editor Manipulation Tool]
    F --> I[Information Retrieval Tool]
    
    G --> J[Claude API]
    H --> K[Document Mutation]
    I --> L[Context Search]
    
    J --> M[Generated Content]
    K --> N[Document Update]
    L --> O[Retrieved Information]
    
    M --> P[Response Assembly]
    N --> P
    O --> P
    
    P --> Q[Final Response]
    Q --> R[Chat Interface]
    Q --> S[Document Update]
    
    classDef input fill:#e1f5fe,stroke:#0277bd
    classDef orchestration fill:#f3e5f5,stroke:#7b1fa2
    classDef intent fill:#fff3e0,stroke:#f57c00
    classDef tool fill:#e8f5e8,stroke:#388e3c
    classDef output fill:#fce4ec,stroke:#c2185b
    
    class A,R,S input
    class B,C,P orchestration
    class D,E,F intent
    class G,H,I,J,K,L tool
    class M,N,O,Q output
```

## Database Schema Relationships

```mermaid
erDiagram
    DOCUMENTS {
        id Id PK
        title string
        content string
        creationTime number
        updateTime number
    }
    
    CHAT_MESSAGES {
        id Id PK
        documentId Id FK
        message string
        role string
        timestamp number
        metadata object
    }
    
    USER_SESSIONS {
        id Id PK
        userId string
        documentId Id FK
        lastActivity number
        cursor object
    }
    
    DOCUMENTS ||--o{ CHAT_MESSAGES : "has conversations"
    DOCUMENTS ||--o{ USER_SESSIONS : "has active users"
    
    %% Indexes
    CHAT_MESSAGES ||--|| DOCUMENTS : "by_documentId_and_timestamp"
    USER_SESSIONS ||--|| DOCUMENTS : "by_documentId_and_lastActivity"
```

This comprehensive mapping provides detailed visualization of all system components, their relationships, data flows, and architectural patterns in the AI-powered collaborative text editor.