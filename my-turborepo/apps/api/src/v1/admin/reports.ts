import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { reportRepository } from '@repo/services-reporting';

const adminReports = new Hono();

/**
 * GET /api/v1/admin/reports
 * Protected endpoint to fetch all reports for admin dashboard.
 * Returns reports sorted by priority (High > Medium > Low) then by creation date (newest first).
 */
adminReports.get(
  '/',
  authMiddleware,
  async (c) => {
    try {
      // Fetch all reports using repository (includes proper sorting)
      const reports = await reportRepository.findAllSorted();

      return c.json({
        reports,
        total: reports.length,
        message: 'Reports fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      
      return c.json(
        { 
          error: 'Failed to fetch reports',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

export default adminReports;