# FEDS Corpus - Vector Search System

## Overview

The FEDS (Federal/Expert Document System) corpus provides semantic search capabilities for the session manager agent. It stores and retrieves expert knowledge, statistics, and guidelines using vector embeddings for semantic similarity matching.

## Features

- **Vector Search**: Semantic search using OpenAI embeddings (1536 dimensions)
- **Full-Text Search**: Traditional keyword-based search
- **Document Management**: CRUD operations for documents
- **Categorization**: Documents organized by type and category
- **Access Tracking**: Monitor document usage patterns
- **Verification Status**: Track document quality and approval

## Document Types

- `statistic`: Statistical data and research findings
- `report`: Comprehensive reports and analyses
- `guideline`: Recommendations and best practices
- `policy`: Policies and regulations
- `fact`: Verified factual information

## Categories

- `mental-health`: Mental health statistics and guidelines
- `productivity`: Productivity research and techniques
- `health`: General health and wellness
- `digital-wellness`: Screen time and digital health
- `workplace`: Work-related stress and environment

## Usage

### 1. Seed the Corpus

First, populate the corpus with sample documents:

```typescript
// In Convex dashboard or via API
await convex.action(api.feds.seed.seedCorpus, {
  clearExisting: false // Set to true to clear existing documents
});
```

### 2. Add New Documents

Create a document with auto-generated embedding:

```typescript
await convex.action(api.feds.embeddings.createWithEmbedding, {
  title: "Your Document Title",
  content: "Full text content of the document...",
  summary: "Brief summary",
  documentType: "statistic",
  category: "mental-health",
  tags: ["depression", "statistics"],
  source: "Source name",
  relevanceScore: 90,
  verificationStatus: "verified"
});
```

### 3. Semantic Search

Search using natural language queries:

```typescript
const results = await convex.action(api.feds.embeddings.semanticSearch, {
  query: "How does exercise affect mental health?",
  category: "mental-health", // Optional filter
  limit: 5,
  minScore: 0.7 // Similarity threshold (0-1)
});

// Results include:
// - documentId: Document ID
// - title: Document title
// - content: Full content
// - summary: Brief summary
// - similarityScore: Semantic similarity (0-1)
// - category: Document category
// - tags: Associated tags
```

### 4. Full-Text Search

Traditional keyword search:

```typescript
const results = await convex.query(api.feds.documents.search, {
  searchQuery: "depression anxiety",
  category: "mental-health",
  limit: 10
});
```

### 5. List Documents

Browse documents with filters:

```typescript
const docs = await convex.query(api.feds.documents.list, {
  category: "productivity",
  documentType: "guideline",
  verificationStatus: "verified",
  limit: 50
});
```

### 6. Get Statistics

View corpus statistics:

```typescript
const stats = await convex.query(api.feds.documents.getStats, {});

// Returns:
// - totalDocuments: Total number of documents
// - byCategory: Document count per category
// - byType: Document count per type
// - byVerification: Verification status breakdown
```

## Integration with Session Manager

The FEDS vector search is integrated into the Nexus session manager agent as a tool:

```typescript
// The agent can now call:
{
  toolId: "vector_search_feds",
  input: {
    query: "What are the statistics on remote work productivity?",
    category: "productivity",
    limit: 3,
    minScore: 0.75
  }
}
```

The agent will use this tool to:
- Provide evidence-based answers to user questions
- Reference statistics and guidelines
- Offer contextually relevant information
- Support claims with verified sources

## Environment Variables

Ensure the following environment variable is set in your Convex deployment:

```
OPENAI_API_KEY=your_openai_api_key_here
```

This is required for generating embeddings.

## Testing

Test vector search functionality:

```typescript
await convex.action(api.feds.seed.testVectorSearch, {
  query: "How much sleep do adults need?",
  limit: 3
});
```

## Best Practices

1. **Verification**: Always verify documents before setting `verificationStatus` to `verified`
2. **Relevance Scores**: Use relevance scores (0-100) to prioritize high-quality content
3. **Categories**: Use consistent category names for better organization
4. **Tags**: Add specific tags for improved discoverability
5. **Summaries**: Include concise summaries for quick reference
6. **Sources**: Always cite sources for credibility
7. **Content Length**: Optimal content length is 200-1000 words for embeddings
8. **Updates**: Regenerate embeddings when content changes significantly

## Cost Considerations

- Embedding generation: ~$0.0001 per 1K tokens (OpenAI text-embedding-3-small)
- Sample corpus (10 documents): ~5K tokens = ~$0.0005
- Vector search queries: ~$0.0001 per query
- Storage: Minimal (vectors stored efficiently in Convex)

## API Reference

### Queries

- `api.feds.documents.get` - Get single document by ID
- `api.feds.documents.list` - List documents with filters
- `api.feds.documents.search` - Full-text search
- `api.feds.documents.vectorSearch` - Vector similarity search
- `api.feds.documents.getStats` - Get corpus statistics

### Mutations

- `api.feds.documents.create` - Create document (requires pre-generated embedding)
- `api.feds.documents.update` - Update document
- `api.feds.documents.deleteDocument` - Delete document

### Actions

- `api.feds.embeddings.generateEmbedding` - Generate embedding for text
- `api.feds.embeddings.createWithEmbedding` - Create document with auto-generated embedding
- `api.feds.embeddings.semanticSearch` - Semantic search with natural language
- `api.feds.embeddings.batchGenerateEmbeddings` - Regenerate embeddings for multiple documents
- `api.feds.seed.seedCorpus` - Populate corpus with sample documents
- `api.feds.seed.testVectorSearch` - Test search functionality

## Future Enhancements

- [ ] Support for multiple embedding models
- [ ] Hybrid search (combining vector and full-text)
- [ ] Document versioning
- [ ] Automatic relevance feedback
- [ ] Multi-language support
- [ ] Document similarity clustering
- [ ] Periodic embedding updates
- [ ] Citation tracking
- [ ] Quality scoring based on usage

## Support

For issues or questions about the FEDS corpus system, please refer to the main project documentation or open an issue in the repository.
