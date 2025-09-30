// Vercel serverless function that wraps the MCP server Express app
// Using dynamic import since the bundled file uses ES6 exports
export default async function handler(req, res) {
  const { default: app } = await import('../mcp-server/dist/http-server.js');
  return app(req, res);
}

