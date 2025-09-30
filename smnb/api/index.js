// Vercel serverless function that wraps the MCP server Express app
const { default: app } = require('../mcp-server/dist/http-server.js');

// Export the Express app directly for Vercel
module.exports = app;

