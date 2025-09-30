// Vercel serverless function that wraps the MCP server Express app
module.exports = async (req, res) => {
  try {
    // Test if we can load the module
    const app = require('../mcp-server/dist/http-server.js');
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('Error loading MCP server:', error);
    return res.status(500).json({ 
      error: 'Failed to load MCP server',
      message: error.message,
      stack: error.stack 
    });
  }
};

