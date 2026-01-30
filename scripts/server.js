#!/usr/bin/env node
/**
 * Clawdbot Kanban Server
 * A minimal server that serves a kanban dashboard and syncs with a markdown file.
 * 
 * Usage: node server.js [path/to/PROJECTS.md]
 * Default: ./PROJECTS.md
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.KANBAN_PORT || 3456;
const PROJECTS_FILE = process.argv[2] || path.join(process.cwd(), 'PROJECTS.md');
const COLUMNS = ['Backlog', 'Active', 'Done'];

// Asset paths
const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'dashboard');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

// Parse markdown into structured data
function parseMarkdown(content) {
  const board = {};
  COLUMNS.forEach(col => board[col] = []);
  
  let currentColumn = null;
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Check for column header (## Column Name)
    const headerMatch = line.match(/^## (.+)$/);
    if (headerMatch) {
      const colName = headerMatch[1].trim();
      if (COLUMNS.includes(colName)) {
        currentColumn = colName;
      }
      continue;
    }
    
    // Check for task (- [ ] or - [x])
    const taskMatch = line.match(/^- \[([ x])\] (.+)$/);
    if (taskMatch && currentColumn) {
      board[currentColumn].push({
        done: taskMatch[1] === 'x',
        text: taskMatch[2].trim(),
        id: generateId(),
      });
    }
  }
  
  return board;
}

// Convert structured data back to markdown
function toMarkdown(board) {
  let md = '# Projects\n\n';
  
  for (const col of COLUMNS) {
    md += `## ${col}\n`;
    const tasks = board[col] || [];
    for (const task of tasks) {
      const checkbox = task.done ? '[x]' : '[ ]';
      md += `- ${checkbox} ${task.text}\n`;
    }
    md += '\n';
  }
  
  return md.trim() + '\n';
}

// Generate simple ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Read board from file
function readBoard() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return parseMarkdown(content);
    }
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
  
  // Return empty board if file doesn't exist
  const board = {};
  COLUMNS.forEach(col => board[col] = []);
  return board;
}

// Write board to file
function writeBoard(board) {
  try {
    const md = toMarkdown(board);
    fs.writeFileSync(PROJECTS_FILE, md, 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing file:', err.message);
    return false;
  }
}

// Serve static files
function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
}

// Handle API requests
function handleApi(req, res, url) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // GET /api/board - Read current board state
  if (url.pathname === '/api/board' && req.method === 'GET') {
    const board = readBoard();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ columns: COLUMNS, board }));
    return;
  }
  
  // POST /api/board - Save board state
  if (url.pathname === '/api/board' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { board } = JSON.parse(body);
        const success = writeBoard(board);
        res.writeHead(success ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  // GET /api/config - Get configuration
  if (url.pathname === '/api/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      columns: COLUMNS,
      file: PROJECTS_FILE,
    }));
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
}

// Create server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // API routes
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url);
    return;
  }
  
  // Static files
  let filePath = url.pathname === '/' 
    ? path.join(ASSETS_DIR, 'index.html')
    : path.join(ASSETS_DIR, url.pathname);
  
  serveStatic(res, filePath);
});

// Start server
server.listen(PORT, () => {
  console.log(`🗂️  Kanban server running at http://localhost:${PORT}`);
  console.log(`📄 Syncing with: ${PROJECTS_FILE}`);
  console.log(`📊 Columns: ${COLUMNS.join(' → ')}`);
});
