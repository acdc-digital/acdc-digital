# FEDS Vector Search Architecture

## System Overview

The FEDS (Federal/Expert Document System) vector search is a RAG (Retrieval-Augmented Generation) system that provides the session manager AI with access to verified statistics, guidelines, and expert information through semantic search.

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│  (Session Manager Chat / API Client)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Nexus Session Manager Agent                │
│  - Orchestrates tool calls                                  │
│  - Decides when to search FEDS corpus                       │
│  - Formats results for user                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ vector_search_feds tool
                  ▼
┌─────────────────────────────────────────────────────────────┐
│            FEDS Embeddings Service (Action)                 │
│  1. Receive natural language query                          │
│  2. Generate embedding via OpenAI API                       │
│  3. Execute vector search                                   │
│  4. Return ranked results with scores                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  OpenAI API      │  │ Convex Database  │
│  - Embeddings    │  │ - Vector Index   │
│  - 1536 dims     │  │ - Documents      │
│  - Cost: $0.0001 │  │ - Metadata       │
└──────────────────┘  └──────────────────┘
```

## Data Flow

### 1. Document Creation Flow

```
User/Admin creates document
          ↓
createWithEmbedding (Action)
          ↓
     ┌────┴────┐
     ▼         ▼
OpenAI API   Convex DB
(generate    (wait for
embedding)    embedding)
     │         ↑
     └────┬────┘
          ▼
    Store document
    with embedding
          ↓
   Document ready
   for search
```

**Code:**
```typescript
// Action: feds/embeddings.ts
export const createWithEmbedding = action({
  handler: async (ctx, args) => {
    // 1. Generate embedding
    const embedding = await generateEmbedding(args.content);
    
    // 2. Store document
    const docId = await ctx.runMutation(api.feds.documents.create, {
      ...args,
      embedding: embedding.vector,
      embeddingModel: "text-embedding-3-small"
    });
    
    return docId;
  }
});
```

### 2. Search Flow

```
User query
    ↓
Agent receives query
    ↓
Calls vector_search_feds tool
    ↓
semanticSearch (Action)
    ↓
Generate query embedding (OpenAI)
    ↓
vectorSearch (Query)
    ↓
Convex Vector Index
    ↓
Returns top K results
    ↓
Filter by similarity score
    ↓
Track document access
    ↓
Return formatted results
    ↓
Agent uses in response
    ↓
User sees answer with citations
```

**Code:**
```typescript
// Action: feds/embeddings.ts
export const semanticSearch = action({
  handler: async (ctx, args) => {
    // 1. Generate embedding for query
    const embedding = await generateEmbedding(args.query);
    
    // 2. Search with vector index
    const results = await ctx.runQuery(api.feds.documents.vectorSearch, {
      embedding: embedding.vector,
      limit: args.limit || 10,
      category: args.category
    });
    
    // 3. Filter by similarity threshold
    const filtered = results.filter(r => r._score >= args.minScore);
    
    // 4. Track access
    for (const result of filtered) {
      await ctx.runMutation(internal.feds.documents.trackAccess, {
        documentId: result._id
      });
    }
    
    return { results: filtered, query: args.query };
  }
});
```

## Database Schema

### feds_documents Table

```typescript
{
  // Content
  title: string,
  content: string,              // Full text
  summary?: string,             // Brief summary
  
  // Classification
  documentType: "statistic" | "report" | "guideline" | "policy" | "fact",
  category: string,             // "mental-health", "productivity", etc.
  tags: string[],
  
  // Embedding
  embedding: number[],          // 1536 dimensions
  embeddingModel: string,       // "text-embedding-3-small"
  
  // Quality
  relevanceScore?: number,      // 0-100
  verificationStatus: "verified" | "pending" | "draft",
  source?: string,
  
  // Metadata
  createdAt: number,
  updatedAt: number,
  lastAccessedAt?: number,
  accessCount?: number
}
```

### Indexes

1. **Vector Index**: `by_embedding`
   - Field: `embedding` (1536 dimensions)
   - Filters: `category`, `documentType`, `verificationStatus`
   - Used for: Semantic similarity search

2. **Search Index**: `search_content`
   - Field: `content`
   - Filters: `category`, `documentType`, `verificationStatus`
   - Used for: Full-text keyword search

3. **Standard Indexes**:
   - `by_category`: Quick filter by category
   - `by_type`: Quick filter by document type
   - `by_verification`: Quick filter by status
   - `by_created`: Sort by creation date

## API Layers

### Layer 1: Queries (Direct Database)
```typescript
// Fast, cacheable, reactive
api.feds.documents.get()           // Get by ID
api.feds.documents.list()          // Browse with filters
api.feds.documents.search()        // Full-text search
api.feds.documents.vectorSearch()  // Vector search (needs embedding)
api.feds.documents.getStats()      // Corpus statistics
```

### Layer 2: Mutations (Database Writes)
```typescript
// Modify database state
api.feds.documents.create()        // Add document (needs embedding)
api.feds.documents.update()        // Update document
api.feds.documents.deleteDocument() // Remove document

// Internal only
internal.feds.documents.trackAccess() // Update access stats
```

### Layer 3: Actions (External APIs)
```typescript
// Call external services (OpenAI)
api.feds.embeddings.generateEmbedding()      // Generate embedding
api.feds.embeddings.createWithEmbedding()    // Create doc + embedding
api.feds.embeddings.semanticSearch()         // Query + embedding + search
api.feds.embeddings.batchGenerateEmbeddings() // Bulk update
```

### Layer 4: Agent Tools (User Interface)
```typescript
// Called by Nexus agent
vector_search_feds: {
  input: { query, category?, limit?, minScore? },
  output: { results[], query, totalFound, tokenUsage }
}
```

## Vector Search Algorithm

### Similarity Calculation

Convex uses **cosine similarity** for vector search:

```
similarity = (A · B) / (||A|| × ||B||)

where:
- A = query embedding vector
- B = document embedding vector
- · = dot product
- ||·|| = vector magnitude
```

Results are ranked by similarity score (0-1):
- **0.9-1.0**: Highly relevant
- **0.7-0.9**: Relevant
- **0.5-0.7**: Somewhat relevant
- **< 0.5**: Not relevant

### Search Process

1. **Query Embedding**
   ```typescript
   query = "How does exercise affect mental health?"
   embedding = openai.embeddings.create(query)
   // → [0.123, -0.456, 0.789, ..., 0.321] (1536 numbers)
   ```

2. **Vector Search**
   ```typescript
   results = db.vectorSearch(
     index: "by_embedding",
     vector: embedding,
     limit: 10,
     filters: { verificationStatus: "verified" }
   )
   ```

3. **Ranking**
   - Documents sorted by cosine similarity
   - Only returns top K results
   - Scores typically range 0.6-0.95 for good matches

4. **Filtering**
   ```typescript
   filtered = results.filter(r => r._score >= minScore)
   ```

## Integration Points

### 1. Session Manager Agent
```typescript
// convex/nexus/agents.ts
case 'vector_search_feds': {
  const result = await ctx.runAction(api.feds.embeddings.semanticSearch, {
    query: input.query,
    verificationStatus: 'verified',
    limit: input.limit || 5
  });
  return { success: true, data: result };
}
```

### 2. React Components
```typescript
// lib/hooks/useFedsVectorSearch.tsx
const { search } = useFedsVectorSearch();

const results = await search("sleep requirements", {
  category: "health",
  limit: 5,
  minScore: 0.7
});
```

### 3. Direct API Calls
```typescript
// From any Convex function
const results = await ctx.runAction(api.feds.embeddings.semanticSearch, {
  query: userQuery,
  limit: 3
});
```

## Performance Characteristics

### Latency Breakdown
```
Total: 150-300ms
├── OpenAI API: 100-200ms (embedding generation)
├── Convex Query: 30-50ms (vector search)
├── Post-processing: 10-20ms (filtering, formatting)
└── Network: 10-30ms (client-server)
```

### Scaling
- **Documents**: Supports 10K+ documents efficiently
- **Concurrent Searches**: Unlimited (Convex auto-scales)
- **Vector Dimensions**: Fixed at 1536 (OpenAI standard)
- **Index Size**: ~6KB per document (1536 × 4 bytes)

### Cost Model
```
Per 1000 searches:
├── Embedding generation: $0.10 (1000 × $0.0001)
├── Convex compute: Included
├── Convex storage: Included
└── Total: ~$0.10/1000 searches
```

## Security & Access Control

### Document Verification
- **draft**: Not searchable by default
- **pending**: Admin review required
- **verified**: Available in searches

### Agent Access
- Only verified documents returned to agents
- Access tracking for audit trail
- No direct user access to raw embeddings

### API Keys
- OpenAI API key stored in environment variables
- Never exposed to client
- Used only in server-side actions

## Future Enhancements

### Planned
- [ ] Hybrid search (vector + full-text combined)
- [ ] Multi-language support
- [ ] Document versioning
- [ ] Automatic relevance feedback
- [ ] Caching for frequent queries
- [ ] A/B testing different embedding models

### Possible
- [ ] Custom embedding models (fine-tuned)
- [ ] Multi-modal search (text + images)
- [ ] Federated search across multiple corpora
- [ ] Real-time document updates
- [ ] Collaborative filtering based on usage

## Monitoring & Observability

### Key Metrics
```
Document Corpus:
- Total documents
- By category, type, status
- Average access count

Search Performance:
- Query latency (p50, p95, p99)
- Token usage
- Cost per search
- Cache hit rate

Quality Metrics:
- Average similarity scores
- Low-score query rate
- User feedback on results
```

### Logging
```typescript
// Automatic logging in Convex
console.log('Vector search:', {
  query,
  resultsFound: results.length,
  topScore: results[0]?._score,
  tokensUsed: embedding.tokenUsage
});
```

### Alerts
- OpenAI API failures
- Low similarity scores (< 0.5)
- High token usage
- Search errors

---

This architecture provides a scalable, cost-effective RAG system that enhances the session manager with expert knowledge retrieval capabilities.
