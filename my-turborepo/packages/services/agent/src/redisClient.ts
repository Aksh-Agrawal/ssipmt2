import { Redis } from '@upstash/redis';

/**
 * Singleton Redis client instance for the Live DB.
 * This client connects to Upstash Redis using environment variables.
 * 
 * Environment variables required:
 * - REDIS_URL: The REST URL for the Upstash Redis instance
 * - REDIS_TOKEN: The authentication token for the Upstash Redis instance
 */

let redisClient: Redis | null = null;

/**
 * Get or create the Redis client instance.
 * Uses a singleton pattern to ensure only one connection is maintained.
 * 
 * @throws {Error} If REDIS_URL or REDIS_TOKEN environment variables are not set
 * @returns {Redis} The configured Redis client instance
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  const redisToken = process.env.REDIS_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new Error(
      'REDIS_URL and REDIS_TOKEN environment variables must be set'
    );
  }

  redisClient = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return redisClient;
}

/**
 * Reset the Redis client instance.
 * Useful for testing purposes to force recreation of the client.
 */
export function resetRedisClient(): void {
  redisClient = null;
}
