/**
 * Vector Search Service Tests
 * Note: These tests verify the basic structure and error handling.
 * Full integration tests require OpenAI API access.
 */

import { jest } from '@jest/globals';
import { Redis } from '@upstash/redis';
import type { KnowledgeArticle } from '@repo/shared-types';
import {
  indexArticle,
  searchArticlesByVector,
  reindexAllArticles,
} from '../vectorSearch.js';

describe('Vector Search Service', () => {
  let mockRedis: jest.Mocked<Redis>;
  let mockArticle: KnowledgeArticle;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Save original env
    originalEnv = { ...process.env };

    // Create mock Redis client
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      keys: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    // Sample article for testing
    mockArticle = {
      id: 'article-1',
      title: 'Test Article',
      content: 'This is test content',
      tags: ['test', 'sample'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('indexArticle', () => {
    it('should skip indexing when feature is disabled', async () => {
      delete process.env.ENABLE_VECTOR_EMBEDDINGS;

      await indexArticle(mockRedis, mockArticle);

      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should handle feature flag correctly', async () => {
      process.env.ENABLE_VECTOR_EMBEDDINGS = 'false';

      await indexArticle(mockRedis, mockArticle);

      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('searchArticlesByVector', () => {
    it('should return empty array when feature is disabled', async () => {
      delete process.env.ENABLE_VECTOR_EMBEDDINGS;

      const results = await searchArticlesByVector(mockRedis, 'test query');

      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', async () => {
      process.env.ENABLE_VECTOR_EMBEDDINGS = 'true';

      const results = await searchArticlesByVector(mockRedis, '');

      expect(results).toEqual([]);
    });
  });

  describe('reindexAllArticles', () => {
    it('should return 0 when feature is disabled', async () => {
      delete process.env.ENABLE_VECTOR_EMBEDDINGS;

      const count = await reindexAllArticles(mockRedis);

      expect(count).toBe(0);
    });

    it('should return 0 when no articles exist', async () => {
      process.env.ENABLE_VECTOR_EMBEDDINGS = 'true';
      process.env.OPENAI_API_KEY = 'test-key';
      mockRedis.keys.mockResolvedValue([]);

      const count = await reindexAllArticles(mockRedis);

      expect(count).toBe(0);
    });
  });
});
