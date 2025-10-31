import { Hono } from 'hono';
import reports from './v1/reports/index.js';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api' });
});

// API v1 routes
app.route('/api/v1/reports', reports);

export default app;
