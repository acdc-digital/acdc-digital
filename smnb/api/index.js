// Vercel serverless function that wraps the MCP server Express app
const app = require('../mcp-server/dist/http-server.js');

module.exports = app;

