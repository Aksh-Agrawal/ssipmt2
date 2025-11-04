/**
 * Vector Embedding Service Tests
 */

import {
  generateEmbedding,
  cosineSimilarity,
  isVectorEmbeddingEnabled,
  resetOpenAIClient,
} from '../vectorEmbedding.js';

describe('Vector Embedding Service', () => {
  beforeEach(() => {
    resetOpenAIClient();
    delete process.env.OPENAI_API_KEY;
    delete process.env.ENABLE_VECTOR_EMBEDDINGS;
  });

  describe('isVectorEmbeddingEnabled', () => {
    it('should return false when feature flag is not set', () => {
      expect(isVectorEmbeddingEnabled()).toBe(false);
    });

    it('should return true when feature flag is set to true', () => {
      process.env.ENABLE_VECTOR_EMBEDDINGS = 'true';
      expect(isVectorEmbeddingEnabled()).toBe(true);
    });

    it('should return false when feature flag is set to false', () => {
      process.env.ENABLE_VECTOR_EMBEDDINGS = 'false';
      expect(isVectorEmbeddingEnabled()).toBe(false);
    });
  });

  describe('generateEmbedding', () => {
    it('should throw error when OPENAI_API_KEY is not set', async () => {
      await expect(generateEmbedding('test text')).rejects.toThrow(
        'OPENAI_API_KEY environment variable must be set'
      );
    });

    it('should throw error when text is empty', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      await expect(generateEmbedding('')).rejects.toThrow(
        'Text cannot be empty'
      );
    });

    it('should throw error when text is only whitespace', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      await expect(generateEmbedding('   ')).rejects.toThrow(
        'Text cannot be empty'
      );
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vec = [1, 2, 3, 4];
      expect(cosineSimilarity(vec, vec)).toBe(1);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      expect(cosineSimilarity(vecA, vecB)).toBe(0);
    });

    it('should return -1 for opposite vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [-1, -2, -3];
      expect(cosineSimilarity(vecA, vecB)).toBe(-1);
    });

    it('should calculate similarity correctly for simple vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 1, 0];
      const similarity = cosineSimilarity(vecA, vecB);
      expect(similarity).toBeCloseTo(0.7071, 4); // cos(45°) ≈ 0.7071
    });

    it('should throw error when vectors have different dimensions', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2];
      expect(() => cosineSimilarity(vecA, vecB)).toThrow(
        'Vectors must have the same dimensions'
      );
    });

    it('should return 0 when one vector is all zeros', () => {
      const vecA = [0, 0, 0];
      const vecB = [1, 2, 3];
      expect(cosineSimilarity(vecA, vecB)).toBe(0);
    });

    it('should handle high-dimensional vectors', () => {
      const vecA = new Array(1536).fill(0.5);
      const vecB = new Array(1536).fill(0.5);
      expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1, 10);
    });

    it('should handle negative values correctly', () => {
      const vecA = [1, -2, 3];
      const vecB = [2, -4, 6];
      expect(cosineSimilarity(vecA, vecB)).toBe(1); // vecB is 2*vecA
    });
  });
});
