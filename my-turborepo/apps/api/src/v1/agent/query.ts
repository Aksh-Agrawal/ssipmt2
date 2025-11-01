import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  processQuery,
  getTrafficData,
  formatTrafficResponse,
  formatTrafficFallback,
  formatNoLocationResponse,
  formatUnknownIntentResponse,
} from '@repo/services-agent';

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
      
      // Step 1: Call NLP service to understand the query
      const nlpResult = await processQuery(userQuery);
      
      // Step 2: Route based on detected intent
      if (nlpResult.intent === 'check_traffic') {
        // Check if we have a location entity
        const destination = nlpResult.entities.location;
        
        if (!destination) {
          // No location provided - ask for one
          return c.json({
            response: formatNoLocationResponse(),
          }, 200);
        }
        
        try {
          // Step 3: Call traffic service with location
          // For MVP, we'll use a default origin (can be enhanced later with user location)
          const trafficData = await getTrafficData({
            origin: 'current location', // Placeholder - would use actual user location
            destination,
          });
          
          // Step 4: Format response into natural language
          const response = formatTrafficResponse(trafficData);
          
          return c.json({
            response,
          }, 200);
        } catch (error) {
          // Traffic service failed - return fallback response
          console.error('Traffic service error:', error);
          return c.json({
            response: formatTrafficFallback(destination),
          }, 200);
        }
      }
      
      // Unknown intent - provide helpful message
      return c.json({
        response: formatUnknownIntentResponse(userQuery),
      }, 200);
      
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
