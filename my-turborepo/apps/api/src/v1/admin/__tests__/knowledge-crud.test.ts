/**
 * Integration tests for Knowledge Article CRUD endpoints
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import app from '../../../index.js';

// Mock Redis client
const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  del: jest.fn(),
};

// Mock the Redis client getter
jest.mock('@repo/services-agent', () => ({
  getRedisClient: jest.fn(() => mockRedis),
}));

// Mock repository functions
jest.mock('@repo/services-knowledge', () => ({
  getAllArticles: jest.fn(),
  createArticle: jest.fn(),
  updateArticle: jest.fn(),
  getArticleById: jest.fn(),
}));

import { getAllArticles, createArticle, updateArticle, getArticleById } from '@repo/services-knowledge';

describe('Knowledge Article Endpoints', () => {
  let mockAuthToken: string;

  beforeEach(() => {
    mockAuthToken = 'mock-jwt-token-12345';
    jest.clearAllMocks();
  });

  describe('POST /api/v1/admin/knowledge', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.request('/api/v1/admin/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Article',
          content: 'Test content',
          tags: ['test'],
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should create a new article with valid data', async () => {
      const mockArticle = {
        id: 'test-id-123',
        title: 'Traffic Guidelines',
        content: 'Information about traffic rules',
        tags: ['traffic', 'safety'],
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      };

      (createArticle as jest.MockedFunction<typeof createArticle>).mockResolvedValue(mockArticle);

      const response = await app.request('/api/v1/admin/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          title: 'Traffic Guidelines',
          content: 'Information about traffic rules',
          tags: ['traffic', 'safety'],
        }),
      });

      expect(response.status).toBe(201);
      
      const data = await response.json() as { article: unknown; message: string };
      expect(data).toHaveProperty('article');
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Knowledge article created successfully');
      expect(createArticle).toHaveBeenCalledWith(
        mockRedis,
        expect.objectContaining({
          title: 'Traffic Guidelines',
          content: 'Information about traffic rules',
          tags: ['traffic', 'safety'],
        })
      );
    });

    it('should return 400 with invalid data (missing title)', async () => {
      const response = await app.request('/api/v1/admin/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          content: 'Test content',
          tags: ['test'],
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid data (missing content)', async () => {
      const response = await app.request('/api/v1/admin/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          title: 'Test Title',
          tags: ['test'],
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/admin/knowledge/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.request('/api/v1/admin/knowledge/test-id', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should update an existing article', async () => {
      const mockUpdatedArticle = {
        id: 'test-id-123',
        title: 'Updated Traffic Guidelines',
        content: 'Updated information about traffic rules',
        tags: ['traffic', 'safety', 'updates'],
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-15T00:00:00Z'),
      };

      (updateArticle as jest.MockedFunction<typeof updateArticle>).mockResolvedValue(mockUpdatedArticle);

      const response = await app.request('/api/v1/admin/knowledge/test-id-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          title: 'Updated Traffic Guidelines',
          content: 'Updated information about traffic rules',
          tags: ['traffic', 'safety', 'updates'],
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json() as { article: unknown; message: string };
      expect(data).toHaveProperty('article');
      expect(data).toHaveProperty('message');
      expect(data.message).toBe('Knowledge article updated successfully');
      expect(updateArticle).toHaveBeenCalledWith(
        mockRedis,
        'test-id-123',
        expect.objectContaining({
          title: 'Updated Traffic Guidelines',
          content: 'Updated information about traffic rules',
          tags: ['traffic', 'safety', 'updates'],
        })
      );
    });

    it('should return 404 if article not found', async () => {
      (updateArticle as jest.MockedFunction<typeof updateArticle>).mockResolvedValue(null);

      const response = await app.request('/api/v1/admin/knowledge/non-existent-id', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockAuthToken}`,
        },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      });

      expect(response.status).toBe(404);
      
      const data = await response.json() as { error: string };
      expect(data.error).toBe('Knowledge article not found');
    });
  });

  describe('GET /api/v1/admin/knowledge/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await app.request('/api/v1/admin/knowledge/test-id', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });

    it('should fetch a single article by ID', async () => {
      const mockArticle = {
        id: 'test-id-123',
        title: 'Traffic Guidelines',
        content: 'Information about traffic rules',
        tags: ['traffic', 'safety'],
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      };

      (getArticleById as jest.MockedFunction<typeof getArticleById>).mockResolvedValue(mockArticle);

      const response = await app.request('/api/v1/admin/knowledge/test-id-123', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json() as { article: unknown; message: string };
      expect(data).toHaveProperty('article');
      expect(data).toHaveProperty('message');
      expect(getArticleById).toHaveBeenCalledWith(mockRedis, 'test-id-123');
    });

    it('should return 404 if article not found', async () => {
      (getArticleById as jest.MockedFunction<typeof getArticleById>).mockResolvedValue(null);

      const response = await app.request('/api/v1/admin/knowledge/non-existent-id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockAuthToken}`,
        },
      });

      expect(response.status).toBe(404);
      
      const data = await response.json() as { error: string };
      expect(data.error).toBe('Knowledge article not found');
    });
  });
});
