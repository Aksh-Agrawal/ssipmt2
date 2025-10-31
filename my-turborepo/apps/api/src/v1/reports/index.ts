import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { submitReport } from '@repo/services-reporting';

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

export default reports;