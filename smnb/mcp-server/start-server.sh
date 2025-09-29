#!/bin/bash

cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✅ Environment variables loaded"
else
  echo "❌ No .env file found"
  exit 1
fi

# Start the server
echo "🚀 Starting MCP server..."
node /Users/matthewsimon/Projects/acdc-digital/smnb/mcp-server/dist/http-server.js
