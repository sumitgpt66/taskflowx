// server.js - TaskFlowX Main Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*', // Allow all origins for dev; restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve Static Files ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TaskFlowX API is running',
    version: '1.0.0',
    endpoints: {
      login:    'POST /api/login',
      signup:   'POST /api/signup',
      tasks:    'GET/POST /api/tasks',
      projects: 'GET/POST /api/projects',
      users:    'GET /api/users',
      stats:    'GET /api/stats'
    }
  });
});

// ─── Catch-All Handler for React Router ───────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║      🚀 TaskFlowX Server Started        ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  URL: {PORT}           ║`);
  console.log(`║  ENV:  development                      ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});
