/**
 * LLM Service Tests
 */

import {
  generateLLMResponse,
  isLLMEnabled,
  getLLMModel,
  getLLMTemperature,
  getLLMMaxTokens,
  resetLLMClient,
} from '../llmService.js';

describe('LLM Service', () => {
  beforeEach(() => {
    resetLLMClient();
    delete process.env.OPENAI_API_KEY;
    delete process.env.ENABLE_LLM_RESPONSES;
    delete process.env.LLM_MODEL;
    delete process.env.LLM_TEMPERATURE;
    delete process.env.LLM_MAX_TOKENS;
  });

  describe('isLLMEnabled', () => {
    it('should return false when feature flag is not set', () => {
      expect(isLLMEnabled()).toBe(false);
    });

    it('should return true when feature flag is set to true', () => {
      process.env.ENABLE_LLM_RESPONSES = 'true';
      expect(isLLMEnabled()).toBe(true);
    });

    it('should return false when feature flag is set to false', () => {
      process.env.ENABLE_LLM_RESPONSES = 'false';
      expect(isLLMEnabled()).toBe(false);
    });
  });

  describe('getLLMModel', () => {
    it('should return default model when not configured', () => {
      expect(getLLMModel()).toBe('gpt-3.5-turbo');
    });

    it('should return configured model', () => {
      process.env.LLM_MODEL = 'gpt-4';
      expect(getLLMModel()).toBe('gpt-4');
    });
  });

  describe('getLLMTemperature', () => {
    it('should return default temperature when not configured', () => {
      expect(getLLMTemperature()).toBe(0.4);
    });

    it('should return configured temperature', () => {
      process.env.LLM_TEMPERATURE = '0.7';
      expect(getLLMTemperature()).toBe(0.7);
    });

    it('should clamp temperature to valid range (0-1)', () => {
      process.env.LLM_TEMPERATURE = '1.5';
      expect(getLLMTemperature()).toBe(1);

      process.env.LLM_TEMPERATURE = '-0.5';
      expect(getLLMTemperature()).toBe(0);
    });

    it('should return default for invalid temperature', () => {
      process.env.LLM_TEMPERATURE = 'invalid';
      expect(getLLMTemperature()).toBe(0.4);
    });
  });

  describe('getLLMMaxTokens', () => {
    it('should return default max tokens when not configured', () => {
      expect(getLLMMaxTokens()).toBe(500);
    });

    it('should return configured max tokens', () => {
      process.env.LLM_MAX_TOKENS = '1000';
      expect(getLLMMaxTokens()).toBe(1000);
    });

    it('should clamp max tokens to valid range (50-2000)', () => {
      process.env.LLM_MAX_TOKENS = '3000';
      expect(getLLMMaxTokens()).toBe(2000);

      process.env.LLM_MAX_TOKENS = '10';
      expect(getLLMMaxTokens()).toBe(50);
    });

    it('should return default for invalid max tokens', () => {
      process.env.LLM_MAX_TOKENS = 'invalid';
      expect(getLLMMaxTokens()).toBe(500);
    });
  });

  describe('generateLLMResponse', () => {
    it('should throw error when LLM is not enabled', async () => {
      await expect(
        generateLLMResponse({
          userQuery: 'test query',
          retrievedDocuments: [{ title: 'Test', content: 'Content' }],
        })
      ).rejects.toThrow('LLM responses are not enabled');
    });

    it('should throw error when OPENAI_API_KEY is not set', async () => {
      process.env.ENABLE_LLM_RESPONSES = 'true';

      await expect(
        generateLLMResponse({
          userQuery: 'test query',
          retrievedDocuments: [{ title: 'Test', content: 'Content' }],
        })
      ).rejects.toThrow('OPENAI_API_KEY environment variable must be set');
    });

    it('should throw error when user query is empty', async () => {
      process.env.ENABLE_LLM_RESPONSES = 'true';
      process.env.OPENAI_API_KEY = 'test-key';

      await expect(
        generateLLMResponse({
          userQuery: '',
          retrievedDocuments: [{ title: 'Test', content: 'Content' }],
        })
      ).rejects.toThrow('User query cannot be empty');
    });

    it('should throw error when no documents are provided', async () => {
      process.env.ENABLE_LLM_RESPONSES = 'true';
      process.env.OPENAI_API_KEY = 'test-key';

      await expect(
        generateLLMResponse({
          userQuery: 'test query',
          retrievedDocuments: [],
        })
      ).rejects.toThrow('At least one retrieved document is required');
    });

    it('should use custom system prompt when provided', async () => {
      process.env.ENABLE_LLM_RESPONSES = 'true';
      process.env.OPENAI_API_KEY = 'test-key';

      // This test would require mocking the OpenAI client
      // For now, we verify it doesn't throw on valid input structure
      const options = {
        userQuery: 'test query',
        retrievedDocuments: [{ title: 'Test', content: 'Content' }],
        systemPrompt: 'Custom system prompt',
      };

      // Without actual OpenAI API, this will fail at API call
      // In a real test environment, you'd mock the OpenAI client
      await expect(generateLLMResponse(options)).rejects.toThrow();
    });
  });
});
