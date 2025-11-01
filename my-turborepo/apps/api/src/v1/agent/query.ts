import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { processQuery } from '@repo/services-agent';

const agentQuery = new Hono();

// Validation schema for agent query
const querySchema = z.object({
  query: z.string().min(1, 'Query is required').max(500, 'Query must be under 500 characters'),
});

// POST /api/v1/agent/query - Process natural language queries
agentQuery.post(
  '/',
  zValidator('json', querySchema),
  async (c) => {
    try {
      const validatedData = c.req.valid('json');
      const userQuery = validatedData.query;
      
      // Call NLP service to process query
      const nlpResult = await processQuery(userQuery);
      
      const response = {
        intent: nlpResult.intent,
        entities: nlpResult.entities,
        originalQuery: userQuery,
      };

      return c.json(response, 200);
    } catch (error) {
      console.error('Error processing agent query:', error);
      return c.json(
        { error: 'Internal server error' },
        500
      );
    }
  }
);

export default agentQuery;
