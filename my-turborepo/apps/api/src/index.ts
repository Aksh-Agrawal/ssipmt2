import { Hono } from 'hono';
import reports from './v1/reports/index.js';
import analyzeReport from './v1/internal/analyze-report.js';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api' });
});

// API v1 routes
app.route('/api/v1/reports', reports);
app.route('/api/v1/internal/analyze-report', analyzeReport);

export default app;
