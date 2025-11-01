/**
 * Integration tests for GET /api/v1/admin/knowledge endpoint
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import app from '../../../index.js';

describe('GET /api/v1/admin/knowledge', () => {
  let mockAuthToken: string;

  beforeEach(() => {
    // Mock auth token for testing
    mockAuthToken = 'mock-jwt-token-12345';
  });

  it('should return 401 without authentication', async () => {
    const response = await app.request('/api/v1/admin/knowledge', {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });

  it('should return empty array when no articles exist', async () => {
    // Note: This test assumes the endpoint returns empty array initially
    // In a real implementation, we would seed Redis with test data
    
    const response = await app.request('/api/v1/admin/knowledge', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockAuthToken}`,
      },
    });

    expect(response.status).toBe(200);
    
    const data = await response.json() as { articles: unknown[]; total: number; message: string };
    expect(data).toHaveProperty('articles');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('message');
    expect(Array.isArray(data.articles)).toBe(true);
    expect(data.total).toBe(0);
  });

  // TODO: Add test with seeded Redis data once Redis integration is complete
  // it('should return articles from Redis', async () => {
  //   // Seed test Redis with articles
  //   // Make authenticated request
  //   // Assert articles are returned correctly
  // });
});
