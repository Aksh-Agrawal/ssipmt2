/**
 * Vector Search Service
 * Handles document indexing and retrieval using vector embeddings
 * Integrates with Redis for storage and the existing knowledge system
 */

import { Redis } from '@upstash/redis';
import type { KnowledgeArticle } from '@repo/shared-types';
import { generateEmbedding, cosineSimilarity, isVectorEmbeddingEnabled } from './vectorEmbedding.js';

const VECTOR_KEY_PREFIX = 'kb:vector:';
const ARTICLE_KEY_PREFIX = 'kb:article:';

export interface VectorSearchResult extends KnowledgeArticle {
  similarityScore: number;
}

/**
 * Index a knowledge article by generating and storing its vector embedding
 * Stores the embedding in Redis with key kb:vector:{articleId}
 * 
 * @param redis - Redis client instance
 * @param article - The knowledge article to index
 * @returns Promise resolving when indexing is complete
 */
export async function indexArticle(
  redis: Redis,
  article: KnowledgeArticle
): Promise<void> {
  if (!isVectorEmbeddingEnabled()) {
    return; // Silently skip if feature is disabled
  }

  // Combine title and content for embedding
  const textToEmbed = `${article.title}\n\n${article.content}`;

  try {
    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);

    // Store embedding in Redis
    const vectorKey = `${VECTOR_KEY_PREFIX}${article.id}`;
    await redis.set(vectorKey, JSON.stringify(embedding));
  } catch (error) {
    // Log error but don't fail the operation
    console.error(`Failed to index article ${article.id}:`, error);
  }
}

/**
 * Search for relevant articles using vector similarity
 * Falls back to empty results if feature is disabled or errors occur
 * 
 * @param redis - Redis client instance
 * @param query - The search query text
 * @param limit - Maximum number of results to return (default: 5)
 * @param minSimilarity - Minimum similarity threshold (default: 0.7)
 * @returns Promise resolving to array of articles sorted by relevance
 */
export async function searchArticlesByVector(
  redis: Redis,
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.7
): Promise<VectorSearchResult[]> {
  if (!isVectorEmbeddingEnabled()) {
    return []; // Return empty if feature is disabled
  }

  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Get all vector keys
    const vectorKeys = await redis.keys(`${VECTOR_KEY_PREFIX}*`);
    
    if (!vectorKeys || vectorKeys.length === 0) {
      return [];
    }

    // Calculate similarity for each stored vector
    const similarities: Array<{ articleId: string; score: number }> = [];

    for (const vectorKey of vectorKeys) {
      const embeddingData = await redis.get<string>(vectorKey);
      
      if (!embeddingData) continue;

      const embedding = JSON.parse(embeddingData) as number[];
      const similarity = cosineSimilarity(queryEmbedding, embedding);

      if (similarity >= minSimilarity) {
        // Extract article ID from key (remove prefix)
        const articleId = vectorKey.replace(VECTOR_KEY_PREFIX, '');
        similarities.push({ articleId, score: similarity });
      }
    }

    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.score - a.score);

    // Limit results
    const topResults = similarities.slice(0, limit);

    // Fetch full article data
    const results: VectorSearchResult[] = [];

    for (const { articleId, score } of topResults) {
      const articleData = await redis.get<string>(`${ARTICLE_KEY_PREFIX}${articleId}`);
      
      if (articleData) {
        const article = JSON.parse(articleData) as KnowledgeArticle;
        results.push({
          ...article,
          similarityScore: score,
        });
      }
    }

    return results;
  } catch (error) {
    // Log error and return empty results to maintain service availability
    console.error('Vector search failed:', error);
    return [];
  }
}

/**
 * Re-index all knowledge articles in the database
 * Useful for initial setup or after embedding model changes
 * 
 * @param redis - Redis client instance
 * @returns Promise resolving to count of indexed articles
 */
export async function reindexAllArticles(redis: Redis): Promise<number> {
  if (!isVectorEmbeddingEnabled()) {
    return 0;
  }

  try {
    // Get all article keys
    const articleKeys = await redis.keys(`${ARTICLE_KEY_PREFIX}*`);
    
    if (!articleKeys || articleKeys.length === 0) {
      return 0;
    }

    let indexedCount = 0;

    // Index each article
    for (const articleKey of articleKeys) {
      const articleData = await redis.get<string>(articleKey);
      
      if (articleData) {
        const article = JSON.parse(articleData) as KnowledgeArticle;
        await indexArticle(redis, article);
        indexedCount++;
      }
    }

    return indexedCount;
  } catch (error) {
    console.error('Failed to reindex articles:', error);
    throw error;
  }
}
