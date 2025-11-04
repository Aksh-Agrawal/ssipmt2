/**
 * Vector Embedding Service
 * Handles creation and management of vector embeddings for document indexing
 * Uses OpenAI's text-embedding-3-small model for cost-effective embeddings
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Feature flag to enable/disable vector embeddings
 * Can be used for rollback if issues arise
 */
export function isVectorEmbeddingEnabled(): boolean {
  return process.env.ENABLE_VECTOR_EMBEDDINGS === 'true';
}

/**
 * Get or create the OpenAI client instance
 * Uses singleton pattern to maintain one connection
 * 
 * @throws {Error} If OPENAI_API_KEY environment variable is not set
 * @returns {OpenAI} The configured OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable must be set');
  }

  openaiClient = new OpenAI({
    apiKey: apiKey,
  });

  return openaiClient;
}

/**
 * Reset the OpenAI client instance
 * Useful for testing purposes
 */
export function resetOpenAIClient(): void {
  openaiClient = null;
}

/**
 * Generate vector embedding for a text string
 * Uses OpenAI's text-embedding-3-small model (1536 dimensions)
 * 
 * @param text - The text to generate an embedding for
 * @returns Promise resolving to the embedding vector (array of numbers)
 * @throws {Error} If the API call fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  const client = getOpenAIClient();

  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0]?.embedding ?? [];
  } catch (error) {
    throw new Error(
      `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical
 * 
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Cosine similarity score
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i]! * vecB[i]!;
    normA += vecA[i]! * vecA[i]!;
    normB += vecB[i]! * vecB[i]!;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
