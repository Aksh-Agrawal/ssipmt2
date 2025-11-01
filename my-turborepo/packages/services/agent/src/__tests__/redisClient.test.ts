import { getRedisClient, resetRedisClient } from '../redisClient.js';
import { Redis } from '@upstash/redis';

// Mock the @upstash/redis module
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(),
}));

describe('redisClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    resetRedisClient();
    // Create a fresh copy of process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    resetRedisClient();
  });

  describe('getRedisClient', () => {
    it('should create a Redis client with valid environment variables', () => {
      // Arrange
      process.env.REDIS_URL = 'https://example.upstash.io';
      process.env.REDIS_TOKEN = 'test-token-123';
      const mockRedisInstance = {};
      (Redis as unknown as jest.Mock).mockReturnValue(mockRedisInstance);

      // Act
      const client = getRedisClient();

      // Assert
      expect(Redis).toHaveBeenCalledWith({
        url: 'https://example.upstash.io',
        token: 'test-token-123',
      });
      expect(client).toBe(mockRedisInstance);
    });

    it('should return the same instance on subsequent calls (singleton)', () => {
      // Arrange
      process.env.REDIS_URL = 'https://example.upstash.io';
      process.env.REDIS_TOKEN = 'test-token-123';
      const mockRedisInstance = {};
      (Redis as unknown as jest.Mock).mockReturnValue(mockRedisInstance);

      // Act
      const client1 = getRedisClient();
      const client2 = getRedisClient();

      // Assert
      expect(client1).toBe(client2);
      expect(Redis).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if REDIS_URL is not set', () => {
      // Arrange
      delete process.env.REDIS_URL;
      process.env.REDIS_TOKEN = 'test-token-123';

      // Act & Assert
      expect(() => getRedisClient()).toThrow(
        'REDIS_URL and REDIS_TOKEN environment variables must be set'
      );
      expect(Redis).not.toHaveBeenCalled();
    });

    it('should throw an error if REDIS_TOKEN is not set', () => {
      // Arrange
      process.env.REDIS_URL = 'https://example.upstash.io';
      delete process.env.REDIS_TOKEN;

      // Act & Assert
      expect(() => getRedisClient()).toThrow(
        'REDIS_URL and REDIS_TOKEN environment variables must be set'
      );
      expect(Redis).not.toHaveBeenCalled();
    });

    it('should throw an error if both REDIS_URL and REDIS_TOKEN are not set', () => {
      // Arrange
      delete process.env.REDIS_URL;
      delete process.env.REDIS_TOKEN;

      // Act & Assert
      expect(() => getRedisClient()).toThrow(
        'REDIS_URL and REDIS_TOKEN environment variables must be set'
      );
      expect(Redis).not.toHaveBeenCalled();
    });
  });

  describe('resetRedisClient', () => {
    it('should allow creating a new client after reset', () => {
      // Arrange
      process.env.REDIS_URL = 'https://example.upstash.io';
      process.env.REDIS_TOKEN = 'test-token-123';
      const mockRedisInstance1 = { instance: 1 };
      const mockRedisInstance2 = { instance: 2 };
      (Redis as unknown as jest.Mock)
        .mockReturnValueOnce(mockRedisInstance1)
        .mockReturnValueOnce(mockRedisInstance2);

      // Act
      const client1 = getRedisClient();
      resetRedisClient();
      const client2 = getRedisClient();

      // Assert
      expect(client1).toBe(mockRedisInstance1);
      expect(client2).toBe(mockRedisInstance2);
      expect(client1).not.toBe(client2);
      expect(Redis).toHaveBeenCalledTimes(2);
    });
  });
});
