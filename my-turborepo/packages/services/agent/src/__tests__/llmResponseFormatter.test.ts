/**
 * LLM Response Formatter Tests
 */

import {
  formatKnowledgeResponseWithLLM,
  formatKnowledgeResponseWithFallback,
} from '../llmResponseFormatter.js';
import * as llmService from '../llmService.js';
import * as responseFormatter from '../responseFormatter.js';

// Mock the dependencies
jest.mock('../llmService.js');
jest.mock('../responseFormatter.js');

const mockedIsLLMEnabled = llmService.isLLMEnabled as jest.MockedFunction<typeof llmService.isLLMEnabled>;
const mockedGenerateLLMResponse = llmService.generateLLMResponse as jest.MockedFunction<typeof llmService.generateLLMResponse>;
const mockedFormatKnowledgeResponse = responseFormatter.formatKnowledgeResponse as jest.MockedFunction<typeof responseFormatter.formatKnowledgeResponse>;

describe('LLM Response Formatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatKnowledgeResponseWithLLM', () => {
    it('should use basic formatter when no articles found', async () => {
      mockedFormatKnowledgeResponse.mockReturnValue('No information found');

      const result = await formatKnowledgeResponseWithLLM([], 'test query');

      expect(result).toBe('No information found');
      expect(mockedFormatKnowledgeResponse).toHaveBeenCalledWith([], 'test query');
      expect(mockedGenerateLLMResponse).not.toHaveBeenCalled();
    });

    it('should use basic formatter when LLM is disabled', async () => {
      mockedIsLLMEnabled.mockReturnValue(false);
      mockedFormatKnowledgeResponse.mockReturnValue('Basic response');

      const articles = [
        { title: 'Test Article', content: 'Test content', matchScore: 1 },
      ];

      const result = await formatKnowledgeResponseWithLLM(articles, 'test query');

      expect(result).toBe('Basic response');
      expect(mockedIsLLMEnabled).toHaveBeenCalled();
      expect(mockedFormatKnowledgeResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Article',
            content: 'Test content',
            matchScore: 1,
          }),
        ]),
        'test query'
      );
      expect(mockedGenerateLLMResponse).not.toHaveBeenCalled();
    });

    it('should use LLM formatter when enabled and articles provided', async () => {
      mockedIsLLMEnabled.mockReturnValue(true);
      mockedGenerateLLMResponse.mockResolvedValue({
        content: 'LLM generated response',
        model: 'gpt-3.5-turbo',
        tokensUsed: 100,
        latencyMs: 500,
      });

      const articles = [
        { title: 'Test Article', content: 'Test content', matchScore: 1 },
      ];

      const result = await formatKnowledgeResponseWithLLM(articles, 'test query');

      expect(result).toBe('LLM generated response');
      expect(mockedIsLLMEnabled).toHaveBeenCalled();
      expect(mockedGenerateLLMResponse).toHaveBeenCalledWith({
        userQuery: 'test query',
        retrievedDocuments: [
          { title: 'Test Article', content: 'Test content' },
        ],
      });
      expect(mockedFormatKnowledgeResponse).not.toHaveBeenCalled();
    });

    it('should fall back to basic formatter when LLM fails', async () => {
      mockedIsLLMEnabled.mockReturnValue(true);
      mockedGenerateLLMResponse.mockRejectedValue(new Error('API error'));
      mockedFormatKnowledgeResponse.mockReturnValue('Fallback response');

      const articles = [
        { title: 'Test Article', content: 'Test content', matchScore: 1 },
      ];

      const result = await formatKnowledgeResponseWithLLM(articles, 'test query');

      expect(result).toBe('Fallback response');
      expect(mockedGenerateLLMResponse).toHaveBeenCalled();
      expect(mockedFormatKnowledgeResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Article',
            content: 'Test content',
            matchScore: 1,
          }),
        ]),
        'test query'
      );
    });

    it('should handle articles with similarityScore instead of matchScore', async () => {
      mockedIsLLMEnabled.mockReturnValue(false);
      mockedFormatKnowledgeResponse.mockReturnValue('Basic response');

      const articles = [
        { title: 'Test Article', content: 'Test content', similarityScore: 0.95 },
      ];

      const result = await formatKnowledgeResponseWithLLM(articles, 'test query');

      expect(result).toBe('Basic response');
      expect(mockedFormatKnowledgeResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Article',
            content: 'Test content',
            matchScore: 0.95, // Should normalize similarityScore to matchScore
          }),
        ]),
        'test query'
      );
    });

    it('should handle multiple articles', async () => {
      mockedIsLLMEnabled.mockReturnValue(true);
      mockedGenerateLLMResponse.mockResolvedValue({
        content: 'Multi-article LLM response',
        model: 'gpt-3.5-turbo',
        tokensUsed: 200,
        latencyMs: 600,
      });

      const articles = [
        { title: 'Article 1', content: 'Content 1', matchScore: 2 },
        { title: 'Article 2', content: 'Content 2', matchScore: 1 },
      ];

      const result = await formatKnowledgeResponseWithLLM(articles, 'test query');

      expect(result).toBe('Multi-article LLM response');
      expect(mockedGenerateLLMResponse).toHaveBeenCalledWith({
        userQuery: 'test query',
        retrievedDocuments: [
          { title: 'Article 1', content: 'Content 1' },
          { title: 'Article 2', content: 'Content 2' },
        ],
      });
    });
  });

  describe('formatKnowledgeResponseWithFallback', () => {
    it('should use basic formatter when forceFallback is true', async () => {
      mockedFormatKnowledgeResponse.mockReturnValue('Forced fallback');

      const articles = [
        { title: 'Test Article', content: 'Test content', matchScore: 1 },
      ];

      const result = await formatKnowledgeResponseWithFallback(
        articles,
        'test query',
        true
      );

      expect(result).toBe('Forced fallback');
      expect(mockedFormatKnowledgeResponse).toHaveBeenCalled();
      expect(mockedIsLLMEnabled).not.toHaveBeenCalled();
      expect(mockedGenerateLLMResponse).not.toHaveBeenCalled();
    });

    it('should use LLM formatter when forceFallback is false', async () => {
      mockedIsLLMEnabled.mockReturnValue(true);
      mockedGenerateLLMResponse.mockResolvedValue({
        content: 'LLM response',
        model: 'gpt-3.5-turbo',
        tokensUsed: 100,
        latencyMs: 500,
      });

      const articles = [
        { title: 'Test Article', content: 'Test content', matchScore: 1 },
      ];

      const result = await formatKnowledgeResponseWithFallback(
        articles,
        'test query',
        false
      );

      expect(result).toBe('LLM response');
      expect(mockedIsLLMEnabled).toHaveBeenCalled();
      expect(mockedGenerateLLMResponse).toHaveBeenCalled();
    });
  });
});
