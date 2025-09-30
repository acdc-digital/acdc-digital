// Vercel serverless function that wraps the MCP server Express app
const app = require('../mcp-server/dist/http-server.js');

// Export a handler function that Vercel can call
module.exports = (req, res) => {
  // Handle the request with the Express app
  app(req, res);
};

