import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { analyzeReportContent } from '@repo/services-reporting';

const analyzeReport = new Hono();

// Validation schema for analyze-report payload
const analyzeReportSchema = z.object({
  reportId: z.string().uuid('Invalid report ID format'),
  description: z.string().min(1, 'Description is required'),
});

/**
 * POST /api/v1/internal/analyze-report
 * Internal API endpoint for analyzing report content using NLP
 * This endpoint should only be called by Supabase webhooks or internal services
 */
analyzeReport.post(
  '/',
  zValidator('json', analyzeReportSchema),
  async (c) => {
    try {
      const { reportId, description } = c.req.valid('json');

      // Call the analysis service
      const analysisResult = await analyzeReportContent({
        reportId,
        description,
      });

      return c.json({
        reportId,
        category: analysisResult.category,
        priority: analysisResult.priority,
        message: 'Report analyzed successfully',
      });
    } catch (error) {
      console.error('Error analyzing report:', error);
      
      // Return error but don't crash the process
      return c.json(
        { 
          error: 'Failed to analyze report',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

export default analyzeReport;