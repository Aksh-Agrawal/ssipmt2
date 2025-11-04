import { Hono } from 'hono';
import reports from './v1/reports/index.js';
import analyzeReport from './v1/internal/analyze-report.js';
import adminReports from './v1/admin/reports.js';
import adminReportDetail from './v1/admin/reports/[id].js';
import adminReportStatusUpdate from './v1/admin/reports/[id]/status.js';
import adminKnowledge from './v1/admin/knowledge.js';
import agentQuery from './v1/agent/query.js';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = new Hono();

// Create a standard HTTP server for Hono
const server = createServer(app.fetch);

// Create a WebSocket server instance
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected for voice chat.');

  ws.on('message', (message) => {
    // Handle incoming audio data from the client
    console.log('Received audio data:', message);
    // TODO: Process audio data with PipeCat pipeline
    // For now, echo back a placeholder response
    ws.send('Agent received your audio. Processing...');
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected from voice chat.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api' });
});

// API v1 routes
app.route('/api/v1/reports', reports);
app.route('/api/v1/internal/analyze-report', analyzeReport);
app.route('/api/v1/admin/reports', adminReports);
app.route('/api/v1/admin/reports/:id', adminReportDetail);
app.route('/api/v1/admin/reports/:id/status', adminReportStatusUpdate);
app.route('/api/v1/admin/knowledge', adminKnowledge);
app.route('/api/v1/agent/query', agentQuery);

export default server;
