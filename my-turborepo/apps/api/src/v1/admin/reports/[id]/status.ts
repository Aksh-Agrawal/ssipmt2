import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { authMiddleware } from '../../../../middleware/auth.js';
import { reportRepository } from '@repo/services-reporting';
import type { ReportStatus } from '@repo/shared-types';

const adminReportStatusUpdate = new Hono();

// Validation schema for status update
const statusUpdateSchema = validator('json', (value, c) => {
  const { status } = value;
  
  if (!status) {
    return c.json({ error: 'Status is required' }, 400);
  }
  
  const validStatuses: ReportStatus[] = ['Submitted', 'In Progress', 'Resolved', 'Rejected'];
  if (!validStatuses.includes(status)) {
    return c.json({ 
      error: 'Invalid status', 
      validStatuses,
      received: status 
    }, 400);
  }
  
  return { status: status as ReportStatus };
});

/**
 * PATCH /api/v1/admin/reports/[id]/status
 * Protected endpoint to update a report's status.
 * Accepts: { "status": "In Progress" | "Resolved" | "Rejected" | "Submitted" }
 */
adminReportStatusUpdate.patch(
  '/',
  authMiddleware,
  statusUpdateSchema,
  async (c) => {
    try {
      const reportId = c.req.param('id');
      const { status } = c.req.valid('json');
      
      if (!reportId) {
        return c.json({ error: 'Report ID is required' }, 400);
      }

      // Check if report exists first
      const existingReport = await reportRepository.findById(reportId);
      if (!existingReport) {
        return c.json({ error: 'Report not found' }, 404);
      }

      // Update the report status
      const updatedReport = await reportRepository.update(reportId, { status });

      if (!updatedReport) {
        return c.json({ error: 'Failed to update report status' }, 500);
      }

      return c.json({
        report: updatedReport,
        message: 'Report status updated successfully',
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      
      return c.json(
        { 
          error: 'Failed to update report status',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

export default adminReportStatusUpdate;