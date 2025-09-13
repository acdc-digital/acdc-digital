# Clerk MCP Server Setup

## Current Status
The Clerk MCP server implementation is complete but temporarily disabled due to OAuth configuration issues.

## Files Implemented
- `/api/[transport]/route.ts` - MCP server with 3 Clerk tools
- `/api/.well-known/oauth-protected-resource/mcp/route.ts` - OAuth metadata endpoint
- `/api/.well-known/oauth-authorization-server/route.ts` - OAuth authorization server

## Tools Available
1. `get-clerk-user-data` - Gets authenticated user data
2. `get-user-sessions` - Gets user sessions
3. `update-user-metadata` - Updates user metadata

## OAuth Issue
Error: "Protected Resource Metadata resource 'http://localhost:5454' does not match MCP server resolved resource 'http://localhost:5454/api/mcp'"

## To Re-enable
1. Uncomment the clerk-mcp server in `.vscode/mcp.json`
2. Ensure Next.js server is running on port 5454
3. The OAuth endpoints should automatically work with proper Clerk credentials

## MCP Configuration (Currently Disabled)
```json
"clerk-mcp": {
  "type": "http",
  "url": "http://localhost:5454/api/mcp"
}
```

## Next Steps
- Investigate OAuth spec compliance for MCP servers
- Consider alternative MCP server implementation
- Test with different port configurations