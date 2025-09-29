#!/usr/bin/env node

/**
 * Test script for SMNB MCP Server
 * Run this to verify the server starts correctly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing SMNB MCP Server...\n');

// Start the MCP server
const serverPath = join(__dirname, '../dist/index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});

let serverOutput = '';
let serverError = '';

server.stdout?.on('data', (data) => {
  serverOutput += data.toString();
  console.log('📤 Server output:', data.toString().trim());
});

server.stderr?.on('data', (data) => {
  serverError += data.toString();
  console.log('📡 Server status:', data.toString().trim());
});

// Test timeout
setTimeout(() => {
  console.log('\n⏰ Test timeout reached');
  if (serverError.includes('SMNB MCP Server running')) {
    console.log('✅ MCP Server started successfully!');
    console.log('🎯 Ready for Claude Desktop integration');
  } else {
    console.log('❌ MCP Server failed to start');
    console.log('Server output:', serverOutput);
    console.log('Server error:', serverError);
  }
  
  server.kill('SIGTERM');
  process.exit(serverError.includes('SMNB MCP Server running') ? 0 : 1);
}, 5000);

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (signal !== 'SIGTERM') {
    console.log(`\n📊 Server exited with code ${code}, signal ${signal}`);
  }
});