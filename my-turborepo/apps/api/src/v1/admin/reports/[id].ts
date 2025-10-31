import { Hono } from 'hono';
import { authMiddleware } from '../../../middleware/auth.js';
import { reportRepository } from '@repo/services-reporting';

const adminReportDetail = new Hono();

/**
 * GET /api/v1/admin/reports/[id]
 * Protected endpoint to fetch a single report by ID for admin dashboard.
 * Returns 404 if report not found.
 */
adminReportDetail.get(
  '/',
  authMiddleware,
  async (c) => {
    try {
      const reportId = c.req.param('id');
      
      if (!reportId) {
        return c.json({ error: 'Report ID is required' }, 400);
      }

      // Fetch single report using repository
      const report = await reportRepository.findById(reportId);

      if (!report) {
        return c.json({ error: 'Report not found' }, 404);
      }

      return c.json({
        report,
        message: 'Report fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      
      return c.json(
        { 
          error: 'Failed to fetch report',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

export default adminReportDetail;