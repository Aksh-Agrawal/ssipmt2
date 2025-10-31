import { Hono } from 'hono';
import reports from './v1/reports/index.js';
import analyzeReport from './v1/internal/analyze-report.js';
import adminReports from './v1/admin/reports.js';
import adminReportDetail from './v1/admin/reports/[id].js';
import adminReportStatusUpdate from './v1/admin/reports/[id]/status.js';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api' });
});

// API v1 routes
app.route('/api/v1/reports', reports);
app.route('/api/v1/internal/analyze-report', analyzeReport);
app.route('/api/v1/admin/reports', adminReports);
app.route('/api/v1/admin/reports/:id', adminReportDetail);
app.route('/api/v1/admin/reports/:id/status', adminReportStatusUpdate);

export default app;
