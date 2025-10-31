import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { submitReport } from '@repo/services-reporting';
import { reportRepository } from '@repo/services-reporting';

const reports = new Hono();

// Validation schema for report submission
const reportSubmissionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be under 1000 characters'),
  photoUrl: z.string().url('Invalid photo URL').optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
});

// POST /api/v1/reports - Create a new report
reports.post(
  '/',
  zValidator('json', reportSubmissionSchema),
  async (c) => {
    try {
      const validatedData = c.req.valid('json');
      
      // Call business logic in services layer
      const newReport = await submitReport({
        description: validatedData.description,
        photoUrl: validatedData.photoUrl,
        location: validatedData.location,
      });

      return c.json(
        { 
          trackingId: newReport.id,
          message: 'Report submitted successfully' 
        },
        201
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      return c.json(
        { error: 'Internal server error' },
        500
      );
    }
  }
);

// GET /api/v1/reports/:id - Public endpoint for citizens to check report status
reports.get('/:id', async (c) => {
  try {
    const reportId = c.req.param('id');
    
    const report = await reportRepository.findByIdPublic(reportId);
    
    if (!report) {
      return c.json({
        success: false,
        error: 'Report not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report status:', error);
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
});

export default reports;