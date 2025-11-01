/**
 * Integration tests for agent query endpoint with knowledge retrieval
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the agent service
jest.mock('@repo/services-agent', () => ({
  processQuery: jest.fn(),
  getTrafficData: jest.fn(),
  formatTrafficResponse: jest.fn(),
  formatTrafficFallback: jest.fn(),
  formatNoLocationResponse: jest.fn(),
  formatUnknownIntentResponse: jest.fn(),
  findArticlesByTags: jest.fn(),
  formatKnowledgeResponse: jest.fn(),
  getRedisClient: jest.fn(),
}));

import agentQuery from '../query.js';
import {
  processQuery,
  findArticlesByTags,
  formatKnowledgeResponse,
  getRedisClient,
} from '@repo/services-agent';

describe('Agent Query - Knowledge Retrieval Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle informational query with keywords', async () => {
    // Mock NLP service to return informational intent with keywords
    (processQuery as jest.MockedFunction<typeof processQuery>).mockResolvedValue({
      intent: 'informational_query',
      entities: {},
      keywords: ['garbage', 'schedule'],
    });

    // Mock Redis client
    const mockRedis = {};
    (getRedisClient as jest.MockedFunction<typeof getRedisClient>).mockReturnValue(mockRedis as any);

    // Mock findArticlesByTags to return relevant articles
    const mockArticles = [
      {
        id: 'article-1',
        title: 'Garbage Collection Schedule',
        content: 'Garbage is collected every Tuesday and Friday.',
        tags: ['garbage', 'schedule'],
        createdAt: new Date(),
        updatedAt: new Date(),
        matchScore: 2,
      },
    ];
    (findArticlesByTags as jest.MockedFunction<typeof findArticlesByTags>).mockResolvedValue(mockArticles);

    // Mock formatKnowledgeResponse
    (formatKnowledgeResponse as jest.MockedFunction<typeof formatKnowledgeResponse>).mockReturnValue(
      'Garbage Collection Schedule\n\nGarbage is collected every Tuesday and Friday.'
    );

    // Make request
    const req = new Request('http://localhost/api/v1/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is the garbage schedule?' }),
    });

    const res = await agentQuery.request(req);
    const data = await res.json();

    // Assertions
    expect(res.status).toBe(200);
    expect(processQuery).toHaveBeenCalledWith('What is the garbage schedule?');
    expect(findArticlesByTags).toHaveBeenCalledWith(mockRedis, ['garbage', 'schedule']);
    expect(formatKnowledgeResponse).toHaveBeenCalledWith(mockArticles, 'What is the garbage schedule?');
    expect(data).toHaveProperty('response');
  });

  it('should handle informational query with no keywords', async () => {
    // Mock NLP service to return informational intent with empty keywords
    (processQuery as jest.MockedFunction<typeof processQuery>).mockResolvedValue({
      intent: 'informational_query',
      entities: {},
      keywords: [],
    });

    // Mock formatKnowledgeResponse for no results
    (formatKnowledgeResponse as jest.MockedFunction<typeof formatKnowledgeResponse>).mockReturnValue(
      'I couldn\'t find any information about "vague query". Please try rephrasing your question.'
    );

    // Make request
    const req = new Request('http://localhost/api/v1/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'vague query' }),
    });

    const res = await agentQuery.request(req);
    const data = await res.json();

    // Assertions
    expect(res.status).toBe(200);
    expect(processQuery).toHaveBeenCalledWith('vague query');
    expect(findArticlesByTags).not.toHaveBeenCalled();
    expect(formatKnowledgeResponse).toHaveBeenCalledWith([], 'vague query');
    expect(data).toHaveProperty('response');
  });

  it('should handle knowledge search errors gracefully', async () => {
    // Mock NLP service to return informational intent
    (processQuery as jest.MockedFunction<typeof processQuery>).mockResolvedValue({
      intent: 'informational_query',
      entities: {},
      keywords: ['test'],
    });

    // Mock Redis client
    const mockRedis = {};
    (getRedisClient as jest.MockedFunction<typeof getRedisClient>).mockReturnValue(mockRedis as any);

    // Mock findArticlesByTags to throw error
    (findArticlesByTags as jest.MockedFunction<typeof findArticlesByTags>).mockRejectedValue(
      new Error('Redis connection error')
    );

    // Make request
    const req = new Request('http://localhost/api/v1/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test query' }),
    });

    const res = await agentQuery.request(req);
    const data = await res.json() as { response: string };

    // Assertions
    expect(res.status).toBe(200);
    expect(data.response).toContain('error while searching for information');
  });

  it('should not trigger knowledge search for traffic intent', async () => {
    // Mock NLP service to return traffic intent
    (processQuery as jest.MockedFunction<typeof processQuery>).mockResolvedValue({
      intent: 'check_traffic',
      entities: { location: 'downtown' },
      keywords: ['traffic', 'downtown'],
    });

    // Note: We're not testing full traffic flow here, just ensuring knowledge search is not called

    const req = new Request('http://localhost/api/v1/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'How is traffic to downtown?' }),
    });

    await agentQuery.request(req);

    // Knowledge search functions should not be called
    expect(findArticlesByTags).not.toHaveBeenCalled();
    expect(formatKnowledgeResponse).not.toHaveBeenCalled();
  });

  it('should rank articles by relevance', async () => {
    // Mock NLP service
    (processQuery as jest.MockedFunction<typeof processQuery>).mockResolvedValue({
      intent: 'informational_query',
      entities: {},
      keywords: ['park', 'hours'],
    });

    // Mock Redis client
    const mockRedis = {};
    (getRedisClient as jest.MockedFunction<typeof getRedisClient>).mockReturnValue(mockRedis as any);

    // Mock findArticlesByTags to return multiple articles with different match scores
    const mockArticles = [
      {
        id: 'article-2',
        title: 'Park Hours and Information',
        content: 'Parks are open from 6am to 10pm daily.',
        tags: ['park', 'hours'],
        createdAt: new Date(),
        updatedAt: new Date(),
        matchScore: 2,
      },
      {
        id: 'article-1',
        title: 'Park Information',
        content: 'General park information.',
        tags: ['park'],
        createdAt: new Date(),
        updatedAt: new Date(),
        matchScore: 1,
      },
    ];
    (findArticlesByTags as jest.MockedFunction<typeof findArticlesByTags>).mockResolvedValue(mockArticles);

    // Mock formatKnowledgeResponse
    (formatKnowledgeResponse as jest.MockedFunction<typeof formatKnowledgeResponse>).mockReturnValue(
      'Park Hours and Information\n\nParks are open from 6am to 10pm daily.\n\n(1 more related article available)'
    );

    // Make request
    const req = new Request('http://localhost/api/v1/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What are the park hours?' }),
    });

    const res = await agentQuery.request(req);
    const data = await res.json() as { response: string };

    // Assertions
    expect(res.status).toBe(200);
    expect(findArticlesByTags).toHaveBeenCalledWith(mockRedis, ['park', 'hours']);
    expect(formatKnowledgeResponse).toHaveBeenCalledWith(mockArticles, 'What are the park hours?');
    expect(data.response).toContain('Park Hours and Information');
  });
});
