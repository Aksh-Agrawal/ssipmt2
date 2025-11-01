import { Redis } from '@upstash/redis';
import type { KnowledgeArticle } from '@repo/shared-types';
import { randomUUID } from 'crypto';

/**
 * Repository for managing KnowledgeArticle data in Redis (Live DB).
 * 
 * Redis Data Structure:
 * - kb:article:<id> -> JSON serialized KnowledgeArticle
 * - kb:tag:<tag> -> Set of article IDs that have this tag
 * - kb:all_articles -> Set of all article IDs
 */

const ARTICLE_KEY_PREFIX = 'kb:article:';
const TAG_KEY_PREFIX = 'kb:tag:';
const ALL_ARTICLES_KEY = 'kb:all_articles';

/**
 * Create a new knowledge article in Redis.
 * Updates both the article data and the tag indexes.
 */
export async function createArticle(
  redis: Redis,
  data: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<KnowledgeArticle> {
  const id = randomUUID();
  const now = new Date();
  
  const article: KnowledgeArticle = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  // Store the article
  await redis.set(`${ARTICLE_KEY_PREFIX}${id}`, JSON.stringify(article));
  
  // Add to all articles set
  await redis.sadd(ALL_ARTICLES_KEY, id);
  
  // Add to tag indexes
  for (const tag of article.tags) {
    await redis.sadd(`${TAG_KEY_PREFIX}${tag}`, id);
  }
  
  return article;
}

/**
 * Update an existing knowledge article in Redis.
 * Handles updating tag indexes (removing from old tags, adding to new tags).
 */
export async function updateArticle(
  redis: Redis,
  id: string,
  data: Partial<Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<KnowledgeArticle | null> {
  // Fetch existing article
  const existingData = await redis.get<string>(`${ARTICLE_KEY_PREFIX}${id}`);
  
  if (!existingData) {
    return null;
  }
  
  const existingArticle: KnowledgeArticle = JSON.parse(existingData);
  
  // Update article
  const updatedArticle: KnowledgeArticle = {
    ...existingArticle,
    ...data,
    id, // Ensure id cannot be changed
    createdAt: existingArticle.createdAt,
    updatedAt: new Date(),
  };
  
  // Store updated article
  await redis.set(`${ARTICLE_KEY_PREFIX}${id}`, JSON.stringify(updatedArticle));
  
  // Update tag indexes if tags changed
  if (data.tags) {
    const oldTags = existingArticle.tags;
    const newTags = data.tags;
    
    // Remove from old tags that are no longer present
    const tagsToRemove = oldTags.filter(tag => !newTags.includes(tag));
    for (const tag of tagsToRemove) {
      await redis.srem(`${TAG_KEY_PREFIX}${tag}`, id);
    }
    
    // Add to new tags
    const tagsToAdd = newTags.filter(tag => !oldTags.includes(tag));
    for (const tag of tagsToAdd) {
      await redis.sadd(`${TAG_KEY_PREFIX}${tag}`, id);
    }
  }
  
  return updatedArticle;
}

/**
 * Get all knowledge articles from Redis.
 */
export async function getAllArticles(redis: Redis): Promise<KnowledgeArticle[]> {
  // Get all article IDs
  const articleIds = await redis.smembers<string[]>(ALL_ARTICLES_KEY);
  
  if (!articleIds || articleIds.length === 0) {
    return [];
  }
  
  // Fetch all articles
  const articles: KnowledgeArticle[] = [];
  
  for (const id of articleIds) {
    const data = await redis.get<string>(`${ARTICLE_KEY_PREFIX}${id}`);
    if (data) {
      articles.push(JSON.parse(data));
    }
  }
  
  // Sort by creation date (newest first)
  articles.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return articles;
}

/**
 * Get a single knowledge article by ID.
 */
export async function getArticleById(
  redis: Redis,
  id: string
): Promise<KnowledgeArticle | null> {
  const data = await redis.get<string>(`${ARTICLE_KEY_PREFIX}${id}`);
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}

/**
 * Delete a knowledge article from Redis.
 * Removes from all tag indexes and the all articles set.
 */
export async function deleteArticle(
  redis: Redis,
  id: string
): Promise<boolean> {
  // Fetch existing article to get tags
  const existingData = await redis.get<string>(`${ARTICLE_KEY_PREFIX}${id}`);
  
  if (!existingData) {
    return false;
  }
  
  const existingArticle: KnowledgeArticle = JSON.parse(existingData);
  
  // Remove from tag indexes
  for (const tag of existingArticle.tags) {
    await redis.srem(`${TAG_KEY_PREFIX}${tag}`, id);
  }
  
  // Remove from all articles set
  await redis.srem(ALL_ARTICLES_KEY, id);
  
  // Delete the article itself
  await redis.del(`${ARTICLE_KEY_PREFIX}${id}`);
  
  return true;
}
