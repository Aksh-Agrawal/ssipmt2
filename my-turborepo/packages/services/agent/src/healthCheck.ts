import { getRedisClient } from './redisClient.js';

export interface HealthCheckResult {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Performs a health check on the Live DB (Redis) connection.
 * Executes a PING command to verify the connection is working.
 * 
 * @returns {Promise<HealthCheckResult>} Health check result with success status and message
 */
export async function healthCheck(): Promise<HealthCheckResult> {
  try {
    const redis = getRedisClient();
    const response = await redis.ping();
    
    if (response === 'PONG') {
      return {
        success: true,
        message: 'Live DB connection is healthy',
        timestamp: new Date().toISOString(),
      };
    }
    
    return {
      success: false,
      message: `Unexpected ping response: ${response}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Live DB connection failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
  }
}
