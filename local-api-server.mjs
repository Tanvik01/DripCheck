// local-api-server.mjs
// Run this with: node local-api-server.mjs
// It starts a small HTTP server on :3001 that serves the /api/style endpoint
// so you can test it locally without Vercel CLI.
// The Vite dev server proxies /api/* → http://localhost:3001/api/* (see vite.config.js).

import http from 'http';
import { readFileSync } from 'fs';

// Load .env.local manually
try {
  const envFile = readFileSync('.env.local', 'utf-8');
  for (const line of envFile.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
  console.log('✅ Loaded .env.local');
} catch {
  console.warn('⚠️  No .env.local found — make sure GEMINI_API_KEY is set in env');
}

// Dynamically import the handler (it's ESM)
const { default: handler } = await import('./api/style.js');

const server = http.createServer((req, res) => {
  // Parse JSON body
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', async () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      req.body = {};
    }

    // Simulate Vercel's res object
    const headers = {};
    let statusCode = 200;

    const mockRes = {
      setHeader: (k, v) => { headers[k] = v; },
      status: (code) => {
        statusCode = code;
        return mockRes;
      },
      json: (data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify(data));
      },
      end: () => {
        res.writeHead(statusCode, headers);
        res.end();
      },
    };

    try {
      await handler(req, mockRes);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(3001, () => {
  console.log('🚀 Local API server running on http://localhost:3001');
  console.log('   Handles: POST /api/style');
});
