/**
 * Integration tests for NLP service keyword extraction and intent detection
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { processQuery } from '../nlpService.js';

// Store original env
const originalEnv = process.env.GOOGLE_CLOUD_API_KEY;

describe('NLP Service - Keyword Extraction', () => {
  beforeEach(() => {
    // Set mock API key for tests
    process.env.GOOGLE_CLOUD_API_KEY = 'mock-api-key';
  });

  afterEach(() => {
    // Restore original env
    process.env.GOOGLE_CLOUD_API_KEY = originalEnv;
    
    // Clear fetch mocks
    global.fetch = fetch;
  });

  it('should extract keywords from informational query', async () => {
    // Mock Google NLP API response
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          entities: [
            { name: 'garbage', type: 'OTHER', salience: 0.8 },
            { name: 'schedule', type: 'OTHER', salience: 0.6 },
            { name: 'holiday', type: 'EVENT', salience: 0.5 },
          ],
        }),
      } as Response;
    };

    const result = await processQuery('What is the garbage schedule for holiday?');

    expect(result.intent).toBe('informational_query');
    expect(result.keywords).toBeDefined();
    expect(result.keywords).toContain('garbage');
    expect(result.keywords).toContain('schedule');
    expect(result.keywords).toContain('holiday');
  });

  it('should detect informational_query intent for what questions', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ entities: [] }),
      } as Response;
    };

    const result = await processQuery('What are the park hours?');
    expect(result.intent).toBe('informational_query');
  });

  it('should detect informational_query intent for when questions', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ entities: [] }),
      } as Response;
    };

    const result = await processQuery('When is the library open?');
    expect(result.intent).toBe('informational_query');
  });

  it('should detect informational_query intent for schedule queries', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ entities: [] }),
      } as Response;
    };

    const result = await processQuery('Tell me about the bus schedule');
    expect(result.intent).toBe('informational_query');
  });

  it('should still detect check_traffic intent for traffic queries', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({ entities: [] }),
      } as Response;
    };

    const result = await processQuery('How is traffic to downtown?');
    expect(result.intent).toBe('check_traffic');
  });

  it('should normalize keywords to lowercase', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          entities: [
            { name: 'Garbage', type: 'OTHER', salience: 0.8 },
            { name: 'SCHEDULE', type: 'OTHER', salience: 0.6 },
          ],
        }),
      } as Response;
    };

    const result = await processQuery('What is the Garbage SCHEDULE?');

    expect(result.keywords).toContain('garbage');
    expect(result.keywords).toContain('schedule');
    expect(result.keywords).not.toContain('Garbage');
    expect(result.keywords).not.toContain('SCHEDULE');
  });

  it('should remove duplicate keywords', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          entities: [
            { name: 'park', type: 'LOCATION', salience: 0.8 },
            { name: 'park', type: 'OTHER', salience: 0.5 },
          ],
        }),
      } as Response;
    };

    const result = await processQuery('Tell me about the park');

    expect(result.keywords).toHaveLength(1);
    expect(result.keywords).toContain('park');
  });

  it('should handle queries with no extractable keywords', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          entities: [],
        }),
      } as Response;
    };

    const result = await processQuery('What is it?');

    expect(result.intent).toBe('informational_query');
    expect(result.keywords).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = async () => {
      return {
        ok: false,
        text: async () => 'API Error',
      } as Response;
    };

    const result = await processQuery('What is the schedule?');

    expect(result.intent).toBe('informational_query');
    expect(result.keywords).toBeUndefined();
  });

  it('should extract location entities from queries', async () => {
    global.fetch = async () => {
      return {
        ok: true,
        json: async () => ({
          entities: [
            { name: 'Central Park', type: 'LOCATION', salience: 0.9 },
            { name: 'schedule', type: 'OTHER', salience: 0.5 },
          ],
        }),
      } as Response;
    };

    const result = await processQuery('What is the Central Park schedule?');

    expect(result.entities.location).toBe('Central Park');
    expect(result.keywords).toContain('central park');
    expect(result.keywords).toContain('schedule');
  });
});
