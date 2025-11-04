import { jest } from '@jest/globals';
import { healthCheck } from '../healthCheck.js';
import { getRedisClient, resetRedisClient } from '../redisClient.js';

// Mock the Redis client
jest.mock('../redisClient', () => ({
  getRedisClient: jest.fn(),
  resetRedisClient: jest.fn(),
}));

describe('healthCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetRedisClient();
  });

  it('should return success when Redis ping returns PONG', async () => {
    // Arrange
    const mockPing = jest.fn().mockResolvedValue('PONG');
    (getRedisClient as jest.Mock).mockReturnValue({
      ping: mockPing,
    });

    // Act
    const result = await healthCheck();

    // Assert
    expect(result.success).toBe(true);
    expect(result.message).toBe('Live DB connection is healthy');
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    expect(mockPing).toHaveBeenCalledTimes(1);
  });

  it('should return failure when Redis ping returns unexpected response', async () => {
    // Arrange
    const mockPing = jest.fn().mockResolvedValue('UNEXPECTED');
    (getRedisClient as jest.Mock).mockReturnValue({
      ping: mockPing,
    });

    // Act
    const result = await healthCheck();

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unexpected ping response');
    expect(result.timestamp).toBeDefined();
  });

  it('should return failure when Redis connection throws an error', async () => {
    // Arrange
    const errorMessage = 'Connection refused';
    const mockPing = jest.fn().mockRejectedValue(new Error(errorMessage));
    (getRedisClient as jest.Mock).mockReturnValue({
      ping: mockPing,
    });

    // Act
    const result = await healthCheck();

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain('Live DB connection failed');
    expect(result.message).toContain(errorMessage);
    expect(result.timestamp).toBeDefined();
  });

  it('should return failure when getRedisClient throws an error', async () => {
    // Arrange
    (getRedisClient as jest.Mock).mockImplementation(() => {
      throw new Error('REDIS_URL and REDIS_TOKEN environment variables must be set');
    });

    // Act
    const result = await healthCheck();

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain('Live DB connection failed');
    expect(result.message).toContain('REDIS_URL and REDIS_TOKEN');
    expect(result.timestamp).toBeDefined();
  });

  it('should handle non-Error exceptions gracefully', async () => {
    // Arrange
    const mockPing = jest.fn().mockRejectedValue('string error');
    (getRedisClient as jest.Mock).mockReturnValue({
      ping: mockPing,
    });

    // Act
    const result = await healthCheck();

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown error');
    expect(result.timestamp).toBeDefined();
  });
});
