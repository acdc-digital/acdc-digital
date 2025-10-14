# FEDS Vector Search - Testing Guide

## Prerequisites

Before testing, ensure:

1. **Convex Deployment**: Deploy the updated code to Convex
   ```bash
   cd smnb/smnb
   npx convex dev
   ```

2. **OpenAI API Key**: Set environment variable in Convex dashboard
   - Go to Settings → Environment Variables
   - Add: `OPENAI_API_KEY=your_key_here`

3. **Deploy Schema**: The schema must be pushed to Convex
   ```bash
   npx convex dev  # This will deploy the schema
   ```

## Step 1: Seed the Corpus

Populate the FEDS corpus with sample documents:

```bash
# Via Convex dashboard
npx convex run feds/seed:seedCorpus '{"clearExisting": false}'
```

**Expected Output:**
```
Seeding FEDS corpus with 10 documents...
Creating document: Mental Health Statistics: Depression and Anxiety Rates
✓ Created document <document_id>
...
=== Seeding Complete ===
Created: 10
Failed: 0
Total tokens used: ~5000
```

**Cost:** Approximately $0.0005 for 10 documents

## Step 2: Test Vector Search

Test semantic search functionality:

```bash
# Test query 1: Mental health
npx convex run feds/seed:testVectorSearch '{"query": "How much sleep do adults need?", "limit": 3}'

# Test query 2: Productivity
npx convex run feds/seed:testVectorSearch '{"query": "What are effective productivity techniques?", "limit": 3}'

# Test query 3: Exercise
npx convex run feds/seed:testVectorSearch '{"query": "How does exercise affect mental health?", "limit": 3}'
```

**Expected Output:**
```
=== Testing Vector Search ===
Query: "How much sleep do adults need?"

Found 3 results:

1. Sleep and Cognitive Performance Guidelines
   Category: health
   Similarity: 92.3%
   Summary: Adults need 7-9 hours of sleep; even 1 hour loss can reduce cognitive performance by 25%.

2. Mental Health Statistics: Depression and Anxiety Rates
   Category: mental-health
   Similarity: 78.5%
   ...
```

## Step 3: Verify Schema Deployment

Check that the schema is correctly deployed:

```bash
# List documents
npx convex run feds/documents:list '{}'

# Get statistics
npx convex run feds/documents:getStats '{}'
```

**Expected Stats:**
```json
{
  "totalDocuments": 10,
  "byCategory": [
    {"category": "mental-health", "count": 4},
    {"category": "productivity", "count": 2},
    {"category": "health", "count": 2},
    {"category": "digital-wellness", "count": 1},
    {"category": "workplace", "count": 1}
  ],
  "byType": [
    {"type": "statistic", "count": 6},
    {"type": "guideline", "count": 4}
  ],
  "byVerification": {
    "verified": 10,
    "pending": 0,
    "draft": 0
  }
}
```

## Step 4: Test Nexus Agent Integration

Test the vector search tool through the Nexus agent:

```bash
# Test agent execution
npx convex run nexus/agents:executeAgent '{
  "agentId": "session-manager-agent",
  "toolId": "vector_search_feds",
  "input": {
    "query": "What are the statistics on remote work?",
    "limit": 3
  }
}'
```

**Expected Output:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "documentId": "<id>",
        "title": "Productivity Statistics: Remote Work Impact",
        "similarityScore": 0.89,
        ...
      }
    ],
    "query": "What are the statistics on remote work?",
    "totalFound": 3,
    "tokenUsage": 8
  },
  "toolId": "vector_search_feds",
  "executedAt": 1234567890
}
```

## Step 5: Test Full-Text Search

Compare vector search with traditional search:

```bash
# Full-text search
npx convex run feds/documents:search '{
  "searchQuery": "depression anxiety",
  "limit": 5
}'
```

## Step 6: Test Document CRUD

Test creating, updating, and deleting documents:

```bash
# Create a new document
npx convex run feds/embeddings:createWithEmbedding '{
  "title": "Test Document",
  "content": "This is a test document about mental health and wellness.",
  "documentType": "fact",
  "category": "mental-health",
  "tags": ["test"],
  "verificationStatus": "draft"
}'

# Get document by ID (use ID from previous step)
npx convex run feds/documents:get '{"documentId": "<document_id>"}'

# Update document
npx convex run feds/documents:update '{
  "documentId": "<document_id>",
  "verificationStatus": "verified"
}'

# Delete document
npx convex run feds/documents:deleteDocument '{"documentId": "<document_id>"}'
```

## Step 7: Monitor Performance

Check token usage and costs:

1. **View in Convex Dashboard:**
   - Go to Functions → feds/embeddings:semanticSearch
   - View execution history and performance

2. **Monitor Logs:**
   - Check for any errors in function execution
   - Verify embedding generation is working

## Validation Checklist

- [ ] Schema deployed successfully
- [ ] 10 sample documents seeded
- [ ] Vector search returns relevant results
- [ ] Similarity scores are reasonable (> 0.7 for good matches)
- [ ] Nexus agent can call vector_search_feds tool
- [ ] Full-text search works
- [ ] CRUD operations work
- [ ] Access tracking increments
- [ ] Token usage is tracked
- [ ] No errors in logs

## Common Issues

### 1. OpenAI API Key Not Set
**Error:** "OPENAI_API_KEY environment variable not set"
**Solution:** Set the environment variable in Convex dashboard Settings

### 2. Schema Not Deployed
**Error:** Table 'feds_documents' not found
**Solution:** Run `npx convex dev` to deploy schema

### 3. Low Similarity Scores
**Issue:** All results have similarity < 0.5
**Solution:** 
- Check that embeddings were generated correctly
- Try more specific queries
- Lower the minScore threshold

### 4. Empty Results
**Issue:** semanticSearch returns no results
**Possible Causes:**
- No documents in corpus (run seed)
- Verification filter too strict (try without verificationStatus)
- minScore too high (try 0.5 or lower)

## Performance Benchmarks

Expected performance for typical queries:

- **Embedding Generation:** 100-200ms per query
- **Vector Search:** 50-100ms
- **Total Semantic Search:** 150-300ms
- **Token Cost per Query:** ~$0.0001

## Next Steps

After successful testing:

1. **Expand Corpus:**
   - Add more documents in relevant categories
   - Ensure diverse content coverage

2. **Integrate with Session Manager UI:**
   - Add UI for testing vector search
   - Display search results in chat interface

3. **Monitor Usage:**
   - Track which queries are most common
   - Identify gaps in corpus coverage

4. **Optimize:**
   - Tune similarity thresholds
   - Adjust result limits based on use case
   - Cache frequent queries

5. **Quality Assurance:**
   - Review returned results for relevance
   - Collect user feedback
   - Iterate on document content

## Support

For issues or questions:
- Check Convex dashboard logs
- Review function execution history
- Verify environment variables
- Consult FEDS README.md for API reference
