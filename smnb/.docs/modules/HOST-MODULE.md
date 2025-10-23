# Host Module - Content Selection & Narration System

## Overview

The Host Agent is an AI-powered news narrator that processes Reddit posts from your live feed and generates intelligent, context-aware narrations. It uses Claude AI (Anthropic's Haiku model) to create engaging news commentary that streams in real-time.

---

## 📊 Content Selection Process

### Entry Point: How Posts Reach the Host

Posts flow to the Host Agent through the following pipeline:

```
Live Feed (Reddit) → simpleLiveFeedStore → Host Agent Store → Host Agent Service
```

**Key File:** `lib/stores/livefeed/simpleLiveFeedStore.ts` (line ~279)

When new posts arrive, the live feed automatically notifies the Host Agent:

```typescript
// From simpleLiveFeedStore.ts
hostStore.processLiveFeedPost(enhancedPost);
```

### Duplicate Detection System

The Host Agent has **3 layers of duplicate detection** to prevent repetitive content:

#### Layer 1: ID-Based Tracking
```typescript
// From hostAgentService.ts line ~272
if (this.state.processedItems.has(item.id)) {
  console.log(`⏭️ Skipping already processed item: ${item.id}`);
  return;
}
```

#### Layer 2: Content Signature Matching
```typescript
// From hostAgentService.ts line ~279-286
const contentSignature = this.generateNewsItemSignature(item);
const isDuplicate = this.checkForDuplicateContent(contentSignature, itemTitle);

if (isDuplicate) {
  console.log(`🚫 HOST DUPLICATE DETECTED: Skipping duplicate NewsItem`);
  this.state.processedItems.add(item.id);
  return;
}
```

The content signature is generated from:
- Post title (normalized)
- Content snippet (first 100 chars)
- Subreddit
- Author

#### Layer 3: Smart Caching (30-minute TTL)
```typescript
// From hostAgentService.ts line ~82-84
private narrationCache: Map<string, { content: string; timestamp: number; hash: string }>;
private contentHashes: Set<string>; // Track unique content signatures
private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
```

---

## 🎯 Priority Scoring System

**File:** `lib/services/host/hostAgentService.ts` (line ~1292)

The Host Agent calculates a priority score (0-100) for each post based on:

### Priority Calculation Formula

```typescript
let score = 0;

// 1. ENGAGEMENT FACTOR (0-30 points)
const engagementScore = likes + (comments * 2) + (shares * 3);
if (engagementScore > 100000) score += 30;
else if (engagementScore > 10000) score += 20;
else if (engagementScore > 1000) score += 10;

// 2. URGENCY FACTOR (0-25 points)
// Based on Claude's content analysis
if (analysis?.urgency === 'high') score += 25;
else if (analysis?.urgency === 'medium') score += 15;

// 3. RELEVANCE FACTOR (0-20 points)
// Determined by Claude's relevance score
if (analysis?.relevance) {
  score += Math.round(analysis.relevance * 20);
}

// 4. BREAKING NEWS FACTOR (0-25 points)
if (content.includes('breaking')) score += 25;

// FINAL PRIORITY
if (score >= 60) return 'high';
if (score >= 30) return 'medium';
return 'low';
```

### Priority Impact

- **High Priority (60+)**: Urgent/Breaking news tone, processed immediately
- **Medium Priority (30-59)**: Important developments
- **Low Priority (<30)**: Standard news coverage

---

## 🎙️ Narration Generation Process

### Step 1: Content Analysis

**File:** `lib/services/host/claudeLLMService.ts` (line ~298)

Before generating narration, Claude analyzes the content:

```typescript
const analysis = await this.llmService.analyzeContent(item.content);

// Returns:
{
  sentiment: 'positive' | 'negative' | 'neutral',
  topics: ['topic1', 'topic2', ...],
  summary: 'Brief summary of content',
  urgency: 'low' | 'medium' | 'high',
  relevance: 0.0 - 1.0 // How relevant/important
}
```

**Analysis Prompt:**
```
Analyze this content and provide:
1. Sentiment (positive/negative/neutral)
2. 3-5 main topics/themes
3. Brief 1-sentence summary
4. Urgency level (low/medium/high)
5. Relevance score (0-1)

Content: [Reddit post content]
```

### Step 2: Tone Determination

**File:** `lib/services/host/hostAgentService.ts` (line ~1252)

Based on the analysis, the Host assigns a narration tone:

```typescript
function determineTone(item: NewsItem, analysis?: LLMAnalysis): Tone {
  // Breaking news indicators
  if (content.includes('breaking') || title.includes('breaking')) {
    return 'breaking';
  }
  
  // High engagement = developing story
  const engagementScore = likes + (comments * 2) + (shares * 3);
  if (engagementScore > 50000) {
    return 'developing';
  }
  
  // Use Claude's urgency assessment
  if (analysis?.urgency === 'high') {
    return 'breaking';
  }
  
  // Opinion pieces
  if (content.includes('opinion') || content.includes('think')) {
    return 'opinion';
  }
  
  // Human interest stories
  if (analysis?.sentiment === 'positive' && 
      (content.includes('help') || content.includes('community'))) {
    return 'human-interest';
  }
  
  // Default to analytical coverage
  return 'analysis';
}
```

**Available Tones:**
- `breaking` - Urgent, time-sensitive news
- `developing` - Ongoing stories with updates
- `analysis` - In-depth examination (default)
- `opinion` - Editorial/commentary pieces
- `human-interest` - Uplifting/community stories

### Step 3: Prompt Construction

**File:** `lib/services/host/hostAgentService.ts` (line ~1153)

#### Standard Narration Prompt

```typescript
function buildPrompt(item: NewsItem): string {
  const contextSummary = this.summarizeContext(); // Recent topics covered
  const personality = HOST_PERSONALITIES[this.config.personality];
  const verbosity = VERBOSITY_LEVELS[this.config.verbosity];
  
  return `
Context: ${contextSummary}

New item to report:
Platform: ${item.platform}
Author: ${item.author}
Title: ${item.title}
Content: ${item.content}
Engagement: ${item.engagement.likes} likes, ${item.engagement.comments} comments, ${item.engagement.shares} shares
Hashtags: ${item.hashtags?.join(', ')}
Subreddit: r/${item.subreddit}

Generate a ${this.config.verbosity} news narration (${verbosity.targetLength}).
Style: ${personality.style}
Focus on: key information, context, and significance.
${contextSummary !== "No previous context" ? "Maintain continuity with previous stories if relevant." : ""}
  `.trim();
}
```

#### Thread Update Prompt (for continuing stories)

**File:** `lib/services/host/hostAgentService.ts` (line ~1743)

When a post is identified as an **update** to an existing story thread, the Host uses an enhanced prompt:

```typescript
function buildEnhancedThreadUpdatePrompt(
  newsItem: NewsItem,
  thread: StoryThread,
  updateType: 'new_development' | 'follow_up' | 'clarification' | 'correction',
  updateNumber: number,
  urgencyTone: string
): string {
  const threadHistory = thread.updates.slice(-2).map(update =>
    `• ${update.timestamp}: ${update.summary}`
  ).join('\n');

  return `
STORY THREAD UPDATE NARRATION

Context: You are providing update #${updateNumber} for the ongoing story: "${thread.topic}"

Previous Coverage:
${threadHistory}

New Development:
Title: ${newsItem.title}
Content: ${newsItem.content}
Update Type: ${updateType}

Instructions:
1. Start with "${urgencyTone}" (e.g., "Breaking developments in", "Important follow-up to")
2. Build directly on previous coverage - reference what was covered before
3. Highlight what's new/different in this development
4. Use varied language to avoid repetition
5. Keep it under 150 words and engaging
6. DO NOT repeat information from previous updates
7. Focus on progression: how this advances the story

Tone: ${this.config.personality} with appropriate urgency for ${updateType}
  `.trim();
}
```

**Update Indicators:**
- 🚨 NEW DEVELOPMENT #1: (new_development)
- 📰 CLARIFICATION #2: (clarification)
- ✏️ CORRECTION #3: (correction)
- 🔄 FOLLOW-UP #4: (follow_up)

### Step 4: Streaming Generation

**File:** `lib/services/host/claudeLLMService.ts` (line ~164)

The Host uses **Server-Sent Events (SSE)** to stream narration in real-time:

```typescript
// Request to Claude API
POST /api/claude
{
  action: 'stream',
  prompt: '[constructed prompt]',
  options: {
    model: 'claude-3-5-haiku-20241022',
    systemPrompt: '[personality-based system prompt]',
    temperature: 0.6 - 0.9,
    maxTokens: 150 - 500
  }
}

// Response streams chunks:
onChunk: (chunk) => {
  // Character-by-character streaming at 314 WPM
  // 38ms delay between characters for precise pacing
}

onComplete: (fullText) => {
  // Save to database
  // Move to next item in queue
}
```

---

## 🎨 Personality & Verbosity Configurations

**File:** `lib/types/hostAgent.ts` (line ~100)

### Available Personalities

#### 1. Formal (Default)
```typescript
{
  systemPrompt: "You are a professional news anchor. Use formal language and maintain objectivity. Focus on facts and maintain a serious, authoritative tone.",
  style: "Professional and objective",
  temperature: 0.6
}
```

#### 2. Conversational
```typescript
{
  systemPrompt: "You are a friendly news host. Be engaging and relatable while maintaining credibility. Use conversational language but stay professional.",
  style: "Friendly and engaging",
  temperature: 0.7
}
```

#### 3. Analytical
```typescript
{
  systemPrompt: "You are a news analyst. Provide in-depth insights and context. Break down complex topics and explain their implications clearly.",
  style: "Analytical and insightful",
  temperature: 0.65
}
```

#### 4. Energetic
```typescript
{
  systemPrompt: "You are an energetic news presenter. Be dynamic and enthusiastic. Keep the energy high while delivering clear information.",
  style: "Dynamic and energetic",
  temperature: 0.8
}
```

### Verbosity Levels

#### 1. Concise
- **Target Length:** "1-2 sentences"
- **Max Tokens:** 150
- **Use Case:** Quick headlines, fast-paced coverage

#### 2. Detailed (Default)
- **Target Length:** "3-4 sentences"
- **Max Tokens:** 300
- **Use Case:** Standard news coverage

#### 3. Comprehensive
- **Target Length:** "1 paragraph"
- **Max Tokens:** 500
- **Use Case:** In-depth analysis, complex stories

---

## ⏱️ Timing & Pacing Configuration

**File:** `lib/services/host/hostAgentService.ts` (line ~42)

The Host Agent uses precise timing controls for professional news delivery:

```typescript
TIMING_CONFIG = {
  // Cooldown between narrations
  NARRATION_COOLDOWN_MS: 4000, // 4 seconds (professional preset)
  
  // Queue processing delays
  QUEUE_RETRY_DELAY_MS: 1500, // 1.5 seconds
  
  // Streaming speed for 314 WPM (professional news delivery)
  CHARACTER_STREAMING_DELAY_MS: 38, // 38ms between characters
  
  // Additional phase delays
  PRE_NARRATION_DELAY_MS: 1000, // 1 second pause before starting
  POST_NARRATION_DELAY_MS: 1800, // 1.8 seconds after completion
}
```

**Preset Timing Modes:**
- **Fast:** 2s cooldown, 450 WPM
- **Normal:** 3s cooldown, 380 WPM
- **Professional:** 4s cooldown, 314 WPM (default)
- **Slow:** 5s cooldown, 250 WPM
- **Deliberate:** 6s cooldown, 200 WPM

---

## 🧵 Story Thread Integration

**File:** `lib/services/host/hostAgentService.ts` (line ~323)

The Host Agent integrates with the **Story Thread System** to track continuing stories:

### Thread Detection Process

```typescript
async processRedditPostWithThreads(post: EnhancedRedditPost) {
  // 1. Check for content duplicates
  const contentSignature = generateContentSignature(post);
  const isDuplicate = checkForDuplicateContent(contentSignature, post.title);
  
  // 2. Process through thread system
  const threadResult = await storyThreadStore.processPostForThreads(post);
  
  // 3. Determine narration type
  if (threadResult.isUpdate && !threadResult.isNewThread) {
    // CONTINUING STORY → Use thread-aware prompt
    narrationId = await generateThreadUpdateNarration(
      post, 
      threadResult.threadId, 
      threadResult.updateType
    );
  } else {
    // NEW STORY → Use standard prompt
    await generateStreamingNarration(newsItem);
  }
  
  // 4. Track in Convex database
  await trackHostStats({
    threadId: threadResult.threadId,
    isNewThread: threadResult.isNewThread,
    isUpdate: threadResult.isUpdate
  });
}
```

### Update Types Handled

1. **new_development** - Significant new information
2. **follow_up** - Additional details/context
3. **clarification** - Corrects misunderstandings
4. **correction** - Fixes errors in previous coverage

---

## 📝 Example Narration Flow

### Example 1: Breaking News (High Priority)

**Input:**
```json
{
  "title": "Breaking: Major earthquake hits California",
  "content": "A 7.2 magnitude earthquake has struck...",
  "subreddit": "news",
  "score": 45000,
  "num_comments": 3200
}
```

**Processing:**
1. **Priority Score:** 75 (High)
   - Engagement: 30 points (45k + 6.4k comments)
   - Breaking keyword: 25 points
   - Urgency (from Claude): 25 points
   
2. **Tone:** `breaking`

3. **Prompt:**
```
Context: Recent topics: r/news, r/worldnews

New item to report:
Platform: reddit
Author: user123
Title: Breaking: Major earthquake hits California
Content: A 7.2 magnitude earthquake has struck...
Engagement: 45000 likes, 3200 comments, 0 shares
Subreddit: r/news

Generate a detailed news narration (3-4 sentences).
Style: Professional and objective
Focus on: key information, context, and significance.
```

4. **Generated Narration:**
> "🚨 Breaking news from California: A powerful 7.2 magnitude earthquake has struck the region, causing widespread concern and prompting emergency responses. Early reports indicate significant structural damage in urban areas, with authorities urging residents to take immediate safety precautions. Emergency services are actively responding, and we'll continue to monitor this developing situation as more information becomes available."

5. **Streaming:** Characters appear at 38ms intervals (314 WPM)

6. **Database:** Saved to `host_documents` table with session linkage

---

### Example 2: Thread Update (Medium Priority)

**Input:**
```json
{
  "title": "Update: Earthquake death toll rises to 15",
  "content": "Officials report the death toll has increased...",
  "subreddit": "news",
  "score": 12000,
  "num_comments": 850
}
```

**Processing:**
1. **Thread Detection:** Matches existing "California Earthquake" thread

2. **Priority Score:** 45 (Medium)
   - Engagement: 20 points
   - Urgency: 15 points
   - Relevance: 10 points

3. **Tone:** `developing`

4. **Enhanced Thread Prompt:**
```
STORY THREAD UPDATE NARRATION

Context: You are providing update #3 for the ongoing story: "California Earthquake Coverage"

Previous Coverage:
• 2:15 PM: Initial 7.2 magnitude earthquake reported
• 2:45 PM: Emergency response teams deployed

New Development:
Title: Update: Earthquake death toll rises to 15
Content: Officials report the death toll has increased...
Update Type: new_development

Instructions:
1. Start with "Breaking developments in"
2. Reference previous coverage
3. Highlight what's new: rising death toll
4. Keep under 150 words
5. Focus on how this advances the story
```

5. **Generated Narration:**
> "🔄 Breaking developments in our ongoing California earthquake coverage: Officials have confirmed the death toll has tragically risen to 15, marking a significant escalation from our earlier reports. Search and rescue operations continue throughout affected areas as emergency teams work around the clock to locate survivors. This update underscores the severity of the 7.2 magnitude quake we first reported earlier today, with authorities warning that numbers may continue to change as rescue efforts progress."

---

## 🔧 Configuration Options

### Host Agent Store Configuration

**File:** `lib/stores/host/hostAgentStore.ts`

```typescript
// Initialize with custom config
const hostAgent = new HostAgentService({
  personality: 'formal',           // 'formal' | 'conversational' | 'analytical' | 'energetic'
  verbosity: 'detailed',            // 'concise' | 'detailed' | 'comprehensive'
  updateFrequency: 5000,            // Milliseconds between checks
  contextWindow: 5,                 // Number of previous stories to remember
  waterfallSpeed: 50,               // Characters per second for display
  enableMockMode: false             // Use mock LLM for testing
});

// Start broadcasting with session
hostAgent.start(sessionId);

// Process individual posts
hostAgent.processNewsItem(newsItem);

// Apply timing presets
hostAgent.applyTimingPreset('professional');
```

### API Integration

The Host Agent communicates with Claude through a secure API route:

**Endpoint:** `/api/claude`

**Authentication:**
- Environment variable: `ANTHROPIC_API_KEY` (server-side)
- OR user-provided key through UI (stored securely)

**Rate Limiting:**
- Tier 1: 50 requests per minute
- Protection: 1.2s minimum between requests
- Automatic retry on 429 errors

---

## 📊 Database Schema

**File:** `convex/schema.ts`

### host_documents Table

```typescript
{
  session_id: string,              // Links to broadcast session
  content_type: 'narration',       // Type of content
  content_text: string,            // Full narration text
  current_narration_id: string,    // Unique narration ID
  narration_type: 'breaking' | 'developing' | 'analysis' | 'summary' | 'commentary',
  tone: 'urgent' | 'informative' | 'conversational' | 'dramatic',
  priority: 'high' | 'medium' | 'low',
  source_posts: string[],          // Original Reddit post IDs
  generation_metadata: string      // JSON with sentiment, topics, etc.
}
```

### Sessions Table

```typescript
{
  session_id: string,
  agent_type: 'host',
  session_type: 'broadcast',
  status: 'active' | 'completed' | 'paused',
  host_narrations_count: number,  // Incremented per narration
  host_words_count: number,        // Total words narrated
  total_narrations: number         // Cross-session count
}
```

---

## 🎯 Key Metrics Tracked

**File:** `lib/types/hostAgent.ts`

```typescript
stats: {
  itemsProcessed: number,        // Total posts processed
  totalNarrations: number,       // Total narrations generated
  averageReadTime: number,       // Average narration duration
  queueLength: number,           // Current queue size
  uptime: number                 // Seconds since started
}
```

---

## 🚀 Usage Examples

### Basic Setup

```typescript
import { useHostAgentStore } from '@/lib/stores/host/hostAgentStore';

// Initialize host agent
const { initializeHostAgent, startBroadcasting, stopBroadcasting } = useHostAgentStore();

// 1. Initialize with session
await initializeHostAgent();

// 2. Start broadcasting
startBroadcasting(sessionId);

// 3. Posts automatically flow from live feed
// Host agent processes and narrates in real-time

// 4. Stop when done
stopBroadcasting();
```

### Custom Configuration

```typescript
// Initialize with analytical personality
const hostAgent = new HostAgentService({
  personality: 'analytical',
  verbosity: 'comprehensive',
  updateFrequency: 3000
});

// Apply slow, deliberate pacing
hostAgent.applyTimingPreset('deliberate');

// Start with session tracking
await hostAgent.start(sessionId);
```

### Manual Post Processing

```typescript
// Process a specific post
const newsItem: NewsItem = {
  id: 'post123',
  content: 'Breaking news content...',
  title: 'Major Development',
  author: 'reporter',
  platform: 'reddit',
  timestamp: new Date(),
  engagement: { likes: 5000, comments: 200, shares: 0 },
  subreddit: 'news'
};

await hostAgent.processNewsItem(newsItem);
```

---

## 🔍 Debugging & Monitoring

### Console Log Format

The Host Agent provides detailed console logging:

```
🤖 [HOST STORE] Host agent service initialized
📡 Starting host broadcast... with session: sess_abc123
🔄 Processing news item: Breaking: Major earthquake... [Current narration: none]
🎬 Starting narration: narration-1234567890-abc [Queue length: 0]
⏳ Pre-narration pause (1000ms)...
📞 Calling LLM service generateStream for narration-1234567890-abc...
✅ First chunk received for narration-1234567890-abc, clearing timeout
📡 Starting character-by-character streaming at 314 WPM...
✅ Character streaming completed (245 characters)
✅ Live streaming completed for: narration-1234567890-abc
💾 Saved narration to database: sess_abc123
```

### Common Issues

#### 1. No Narrations Generated
**Check:**
- Is host agent initialized? (`hostAgent !== null`)
- Is host agent active? (`isActive === true`)
- Does live feed have posts? (`postsCount > 0`)
- Is Claude API key configured?

#### 2. Duplicate Content
**Check:**
- Content signature generation
- Cache TTL (30 minutes)
- processedItems Set size

#### 3. Slow Streaming
**Check:**
- CHARACTER_STREAMING_DELAY_MS setting
- Network latency to Claude API
- Rate limiting (50 RPM on Tier 1)

---

## 📚 Related Files

### Core Service Files
- `lib/services/host/hostAgentService.ts` - Main service logic
- `lib/services/host/claudeLLMService.ts` - Claude API integration
- `lib/services/host/mockLLMService.ts` - Mock service for testing

### Store Files
- `lib/stores/host/hostAgentStore.ts` - Zustand state management
- `lib/stores/livefeed/simpleLiveFeedStore.ts` - Live feed integration
- `lib/stores/livefeed/storyThreadStore.ts` - Thread tracking

### Type Definitions
- `lib/types/hostAgent.ts` - All Host Agent types
- `lib/types/enhancedRedditPost.ts` - Reddit post structure
- `lib/types/storyThread.ts` - Story thread types

### Database
- `convex/schema.ts` - Database schema
- `convex/reddit/feed.ts` - Host document mutations

---

## 🎓 Advanced Topics

### Custom LLM Integration

You can swap out Claude for another LLM:

```typescript
class CustomLLMService {
  async generate(prompt: string, options: LLMOptions): Promise<string> {
    // Your custom LLM implementation
  }
  
  async generateStream(
    prompt: string,
    options: LLMOptions,
    onChunk: (chunk: string) => void,
    onComplete: (text: string) => void
  ): Promise<void> {
    // Your custom streaming implementation
  }
  
  async analyzeContent(content: string): Promise<LLMAnalysis> {
    // Your custom analysis
  }
}

// Use custom service
const hostAgent = new HostAgentService({}, new CustomLLMService());
```

### Token Usage Tracking

**File:** `lib/services/core/tokenCountingService.ts`

The Host Agent tracks all token usage:

```typescript
// Metrics tracked per request
interface TokenUsageMetrics {
  requestId: string,
  model: string,
  action: 'generate' | 'stream' | 'analyze',
  inputTokens: number,
  outputTokens: number,
  requestType: 'host',
  duration: number,
  success: boolean,
  sessionId?: string,
  error?: string
}

// Access usage data
const usage = tokenCountingService.getUsageMetrics();
const sessionUsage = tokenCountingService.getSessionUsage(sessionId);
```

### Producer Context Integration

The Host Agent can receive enriched context from the Producer Agent:

```typescript
// Producer provides enhanced metadata
interface ProducerContextData {
  postId: string,
  engagementMetrics: {
    totalScore: number,
    viralityScore: number
  },
  trendData: {
    isBreaking: boolean,
    momentumScore: number
  },
  topicAnalysis: {
    primaryTopic: string,
    relatedTopics: string[]
  }
}

// Host uses this in prompt construction
hostAgent.updateProducerContext(producerContext);
```

---

## 🎉 Summary

The Host Agent is a sophisticated AI narration system that:

1. **Intelligently selects content** using multi-layered duplicate detection
2. **Prioritizes posts** based on engagement, urgency, and relevance
3. **Generates context-aware narrations** using Claude AI
4. **Tracks story threads** for continuing coverage
5. **Streams content** at professional news delivery speeds (314 WPM)
6. **Persists everything** to Convex database with session tracking

**Key Strengths:**
- ✅ Zero duplicate narrations (3-layer detection)
- ✅ Thread-aware updates (references previous coverage)
- ✅ Precise timing control (professional 314 WPM)
- ✅ Multiple personalities & verbosity levels
- ✅ Full token usage tracking
- ✅ Automatic priority scoring
- ✅ Real-time streaming with waterfall display

---

**Last Updated:** October 8, 2025  
**Version:** 2.1.0  
**Author:** ACDC Digital Team
