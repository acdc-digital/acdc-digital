#!/usr/bin/env node

import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copy Convex generated API files into mcp-server for bundling
console.log('📦 Copying Convex generated API files...');
const sourcePath = join(__dirname, '../smnb/convex/_generated');
const destPath = join(__dirname, 'convex/_generated');

if (existsSync(sourcePath)) {
  // Create destination directory if it doesn't exist
  mkdirSync(join(__dirname, 'convex'), { recursive: true });
  
  // Copy the entire _generated folder
  cpSync(sourcePath, destPath, { recursive: true });
  console.log('✅ Copied Convex API files');
} else {
  console.warn('⚠️  Warning: Convex _generated folder not found at', sourcePath);
}

// Build the HTTP server (for Vercel - no shebang)
await build({
  entryPoints: ['src/http-server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist/http-server.js',
  external: [],
  sourcemap: true,
});

console.log('✅ HTTP server built successfully');

// Build the MCP protocol server
await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/index.js',
  external: [],
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});

console.log('✅ MCP protocol server built successfully');
