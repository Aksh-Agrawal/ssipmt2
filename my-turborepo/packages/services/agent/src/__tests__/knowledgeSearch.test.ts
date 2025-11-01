/**
 * Integration tests for knowledge search functionality
 * Tests the findArticlesByTags function with various tag combinations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { findArticlesByTags } from '../knowledgeSearch.js';
import type { Redis } from '@upstash/redis';

// Mock Redis client
const createMockRedis = (): Redis => {
  const mockData = new Map<string, any>();
  
  return {
    smembers: async (key: string) => {
      return mockData.get(key) || [];
    },
    sinter: async (...keys: string[]) => {
      if (keys.length === 0) return [];
      
      // Get all sets
      const sets = keys.map(key => new Set(mockData.get(key) || []));
      
      // Find intersection
      const firstSet = sets[0];
      if (!firstSet) return [];
      
      const intersection = Array.from(firstSet).filter(item =>
        sets.every(set => set.has(item))
      );
      
      return intersection;
    },
    get: async (key: string) => {
      return mockData.get(key) || null;
    },
    set: (key: string, value: any) => {
      mockData.set(key, value);
    },
    clear: () => {
      mockData.clear();
    },
  } as unknown as Redis;
};

describe('findArticlesByTags', () => {
  let mockRedis: Redis;

  beforeEach(() => {
    mockRedis = createMockRedis();
  });

  afterEach(() => {
    (mockRedis as any).clear();
  });

  it('should return empty array when no tags provided', async () => {
    const result = await findArticlesByTags(mockRedis, []);
    expect(result).toEqual([]);
  });

  it('should return empty array when no articles match tags', async () => {
    // Setup: No articles in tag sets
    const result = await findArticlesByTags(mockRedis, ['nonexistent']);
    expect(result).toEqual([]);
  });

  it('should find articles with single tag', async () => {
    // Setup: Article 1 with tag 'a'
    (mockRedis as any).set('kb:tag:a', ['article-1']);
    (mockRedis as any).set('kb:article:article-1', JSON.stringify({
      id: 'article-1',
      title: 'Article 1',
      content: 'Content 1',
      tags: ['a'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    const result = await findArticlesByTags(mockRedis, ['a']);
    
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('article-1');
    expect(result[0]?.matchScore).toBe(1);
  });

  it('should find articles with multiple matching tags using SINTER', async () => {
    // Setup: Article 1 with tags [a, b], Article 2 with [b, c], Article 3 with [a, b, c]
    (mockRedis as any).set('kb:tag:a', ['article-1', 'article-3']);
    (mockRedis as any).set('kb:tag:b', ['article-1', 'article-2', 'article-3']);
    (mockRedis as any).set('kb:tag:c', ['article-2', 'article-3']);

    (mockRedis as any).set('kb:article:article-1', JSON.stringify({
      id: 'article-1',
      title: 'Article 1',
      content: 'Content 1',
      tags: ['a', 'b'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    (mockRedis as any).set('kb:article:article-2', JSON.stringify({
      id: 'article-2',
      title: 'Article 2',
      content: 'Content 2',
      tags: ['b', 'c'],
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    }));

    (mockRedis as any).set('kb:article:article-3', JSON.stringify({
      id: 'article-3',
      title: 'Article 3',
      content: 'Content 3',
      tags: ['a', 'b', 'c'],
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03'),
    }));

    // Test: Search for [a, b] should return Article 1 and 3
    const result1 = await findArticlesByTags(mockRedis, ['a', 'b']);
    expect(result1).toHaveLength(2);
    expect(result1.map(a => a.id).sort()).toEqual(['article-1', 'article-3']);

    // Test: Search for [b, c] should return Article 2 and 3
    const result2 = await findArticlesByTags(mockRedis, ['b', 'c']);
    expect(result2).toHaveLength(2);
    expect(result2.map(a => a.id).sort()).toEqual(['article-2', 'article-3']);

    // Test: Search for [a, c] should return only Article 3
    const result3 = await findArticlesByTags(mockRedis, ['a', 'c']);
    expect(result3).toHaveLength(1);
    expect(result3[0]?.id).toBe('article-3');
  });

  it('should rank articles by number of matching tags', async () => {
    // Setup: Article 1 with [garbage], Article 2 with [garbage, schedule]
    (mockRedis as any).set('kb:tag:garbage', ['article-1', 'article-2']);
    (mockRedis as any).set('kb:tag:schedule', ['article-2', 'article-3']);
    (mockRedis as any).set('kb:tag:holiday', ['article-3']);

    (mockRedis as any).set('kb:article:article-1', JSON.stringify({
      id: 'article-1',
      title: 'Article 1',
      content: 'Content 1',
      tags: ['garbage'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    (mockRedis as any).set('kb:article:article-2', JSON.stringify({
      id: 'article-2',
      title: 'Article 2',
      content: 'Content 2',
      tags: ['garbage', 'schedule'],
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    }));

    (mockRedis as any).set('kb:article:article-3', JSON.stringify({
      id: 'article-3',
      title: 'Article 3',
      content: 'Content 3',
      tags: ['garbage', 'schedule', 'holiday'],
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03'),
    }));

    // Test: Search for [garbage, schedule, holiday] - should find article-3 first (3 matches)
    const result = await findArticlesByTags(mockRedis, ['garbage', 'schedule', 'holiday']);
    
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('article-3');
    expect(result[0]?.matchScore).toBe(3);
  });

  it('should sort by creation date when match scores are equal', async () => {
    // Setup: Two articles with same tags but different dates
    (mockRedis as any).set('kb:tag:test', ['article-1', 'article-2']);

    (mockRedis as any).set('kb:article:article-1', JSON.stringify({
      id: 'article-1',
      title: 'Article 1',
      content: 'Content 1',
      tags: ['test'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    (mockRedis as any).set('kb:article:article-2', JSON.stringify({
      id: 'article-2',
      title: 'Article 2',
      content: 'Content 2',
      tags: ['test'],
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05'),
    }));

    const result = await findArticlesByTags(mockRedis, ['test']);
    
    expect(result).toHaveLength(2);
    // Newer article should be first
    expect(result[0]?.id).toBe('article-2');
    expect(result[1]?.id).toBe('article-1');
  });

  it('should normalize tags to lowercase', async () => {
    // Setup: Article with lowercase tags
    (mockRedis as any).set('kb:tag:garbage', ['article-1']);
    (mockRedis as any).set('kb:article:article-1', JSON.stringify({
      id: 'article-1',
      title: 'Article 1',
      content: 'Content 1',
      tags: ['garbage'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    // Test: Search with uppercase should still find the article
    const result = await findArticlesByTags(mockRedis, ['GARBAGE']);
    
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('article-1');
  });

  it('should handle missing article data gracefully', async () => {
    // Setup: Tag set references an article that doesn't exist
    (mockRedis as any).set('kb:tag:test', ['article-1', 'missing-article']);
    (mockRedis as any).set('kb:article:article-1', JSON.stringify({
      id: 'article-1',
      title: 'Article 1',
      content: 'Content 1',
      tags: ['test'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }));

    const result = await findArticlesByTags(mockRedis, ['test']);
    
    // Should only return the article that exists
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('article-1');
  });
});
