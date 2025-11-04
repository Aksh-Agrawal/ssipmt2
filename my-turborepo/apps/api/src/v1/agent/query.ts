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
  findArticlesByTags,
  formatKnowledgeResponse,
  formatKnowledgeResponseWithLLM,
  isLLMEnabled,
  getRedisClient,
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
      
      if (nlpResult.intent === 'informational_query') {
        const startTime = Date.now();
        try {
          // Step 3: Extract keywords from NLP result
          const keywords = nlpResult.keywords || [];
          
          if (keywords.length === 0) {
            // No keywords extracted - return no results
            const response = isLLMEnabled()
              ? await formatKnowledgeResponseWithLLM([], userQuery)
              : formatKnowledgeResponse([], userQuery);
            
            return c.json({
              response,
            }, 200);
          }
          
          // Step 4: Search knowledge base using extracted keywords
          const redis = getRedisClient();
          const articles = await findArticlesByTags(redis, keywords);
          
          // Step 5: Format response using LLM if enabled, otherwise use basic formatter
          let response: string;
          
          if (isLLMEnabled()) {
            // Use LLM-enhanced formatting with automatic fallback
            response = await formatKnowledgeResponseWithLLM(articles, userQuery);
          } else {
            // Use basic formatter
            response = formatKnowledgeResponse(articles, userQuery);
          }
          
          const latency = Date.now() - startTime;
          console.log(`[Agent Query] Informational query processed in ${latency}ms (LLM: ${isLLMEnabled()})`);
          
          return c.json({
            response,
          }, 200);
        } catch (error) {
          const latency = Date.now() - startTime;
          console.error(`[Agent Query] Knowledge search error after ${latency}ms:`, error);
          return c.json({
            response: `I encountered an error while searching for information. Please try again later.`,
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
