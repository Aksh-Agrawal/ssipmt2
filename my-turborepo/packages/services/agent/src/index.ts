// Export Redis client utilities
export { getRedisClient, resetRedisClient } from './redisClient.js';

// Export health check
export { healthCheck } from './healthCheck.js';
export type { HealthCheckResult } from './healthCheck.js';

// Export agent service
export const agentService = {
  async processQuery(query: string): Promise<string> {
    // Placeholder implementation for AI agent query processing
    console.log(`Processing query: ${query}`);
    return `Response to: ${query}`;
  },

  async getTrafficInfo(location: string): Promise<string> {
    // Placeholder implementation for traffic information retrieval
    console.log(`Getting traffic info for: ${location}`);
    return `Traffic info for ${location}`;
  },
};
