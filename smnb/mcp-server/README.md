# SMNB MCP Server

Model Context Protocol server for SMNB Session Manager that provides AI assistants with secure access to platform analytics, session metrics, and operational data.

## 🎯 What This Enables

Your Session Manager chat can now ask questions like:
- "What's our token usage today?"
- "Show me active sessions and their metrics"
- "Search for messages containing 'optimization'"
- "How are our costs trending this week?"
- "What's the system health status?"

## 🏗️ Architecture

```
Claude Desktop ←→ MCP Server ←→ Convex Database
                       ↓
            Session Manager Chat Interface
```

## 🚀 Setup Instructions

### 1. Environment Configuration

Copy `.env` file and update with your Convex deployment URL:

```bash
cd /Users/matthewsimon/Projects/acdc-digital/smnb/mcp-server
cp .env .env.local
```

Edit `.env.local` with your actual Convex URL:
```
CONVEX_URL=https://your-deployment.convex.cloud
```

### 2. Build the Server

```bash
npm run build
```

### 3. Configure Claude Desktop

Add this to your Claude Desktop configuration file:

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "smnb-news-studio": {
      "command": "node",
      "args": ["/Users/matthewsimon/Projects/acdc-digital/smnb/mcp-server/dist/index.js"],
      "env": {
        "CONVEX_URL": "https://your-deployment.convex.cloud"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

Restart Claude Desktop app to load the MCP server.

## 🛠️ Available Tools

The MCP server provides these tools to AI assistants:

### `get_session_metrics`
Get comprehensive session analytics including activity, duration, and engagement.

**Parameters:**
- `sessionId` (optional): Specific session ID
- `timeRange`: "today", "week", "month", "all"

### `get_token_usage`
Analyze token usage and costs across the platform.

**Parameters:**
- `groupBy`: "session", "model", "day", "hour" 
- `timeRange`: "today", "week", "month", "all"

### `search_messages`
Search through chat messages and conversations.

**Parameters:**
- `query`: Search text
- `sessionId` (optional): Limit to specific session
- `limit` (optional): Max results (default 10)

### `get_active_sessions`
Get currently active sessions and their status.

**Parameters:**
- `includeDetails`: Include detailed metrics

### `analyze_engagement`
Analyze user engagement patterns and trends.

**Parameters:**
- `metric`: "messages", "duration", "retention", "cost_efficiency"
- `timeRange`: "today", "week", "month"

### `get_system_health`
Check overall system health and performance metrics.

### `get_cost_breakdown`
Detailed cost analysis and budget tracking.

**Parameters:**
- `period`: "daily", "weekly", "monthly"

## 🧪 Testing

### Test MCP Server Connection
```bash
npm run dev
```

The server should start and display: "🚀 SMNB MCP Server running and ready for connections"

### Test Individual Tools
In Claude Desktop, try:
```
"Can you check our current system health?"
"What are our active sessions?"
"Show me token usage for this week"
```

## 🔧 Development

### File Structure
```
mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Built JavaScript files
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment template
└── README.md            # This file
```

### Development Commands
```bash
npm run dev               # Watch mode for development
npm run build            # Build TypeScript to JavaScript
npm run clean            # Remove build files
```

### Adding New Tools

1. Add tool definition in `ListToolsRequestSchema` handler
2. Add case in `CallToolRequestSchema` handler  
3. Implement handler method
4. Add corresponding Convex query in `../smnb/convex/analytics.ts`

## 🐛 Troubleshooting

### MCP Server Not Connecting
- Check Claude Desktop configuration file syntax
- Verify CONVEX_URL is correct
- Ensure server builds without errors: `npm run build`
- Restart Claude Desktop

### Tools Not Working
- Check Convex deployment is running
- Verify analytics.ts functions are deployed
- Check server logs in Claude Desktop developer console

### Permission Errors
- Ensure file paths in claude_desktop_config.json are correct
- Check that built files exist in `/dist` directory

## 🔒 Security

- **Read-Only Access**: MCP server only queries data, never modifies
- **Environment Variables**: Sensitive data stored in .env files
- **Convex Security**: Uses existing Convex authentication and permissions
- **No External Network**: Server only communicates with your Convex deployment

## 📊 Expected Performance

- **Latency**: Sub-second responses for most queries
- **Throughput**: Handles dozens of concurrent requests
- **Memory**: ~50MB for typical workloads
- **CPU**: Minimal impact on system resources

Your Session Manager is now a **data-aware AI assistant** that can provide real-time insights about your news platform! 🚀