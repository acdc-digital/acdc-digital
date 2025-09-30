// Vercel serverless function that wraps the MCP server
import app from '../mcp-server/dist/http-server.js';

// Export the Express app for Vercel's serverless runtime
export default app;

