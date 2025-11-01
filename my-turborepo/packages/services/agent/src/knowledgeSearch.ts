/**
 * Knowledge Search Service
 * Handles searching knowledge articles by tags using Redis SINTER
 */

import { Redis } from '@upstash/redis';
import type { KnowledgeArticle } from '@repo/shared-types';

const ARTICLE_KEY_PREFIX = 'kb:article:';
const TAG_KEY_PREFIX = 'kb:tag:';

export interface RankedArticle extends KnowledgeArticle {
  matchScore: number; // Number of matching tags
}

/**
 * Find knowledge articles by tags using Redis SINTER
 * Returns articles ranked by number of matching tags
 * 
 * @param redis - Redis client instance
 * @param tags - Array of tag strings to search for
 * @returns Array of articles sorted by relevance (most matching tags first)
 */
export async function findArticlesByTags(
  redis: Redis,
  tags: string[]
): Promise<RankedArticle[]> {
  // Handle empty tags
  if (!tags || tags.length === 0) {
    return [];
  }

  // Normalize tags to lowercase
  const normalizedTags = tags.map((tag) => tag.toLowerCase().trim());

  // Build Redis keys for tag sets
  const tagKeys = normalizedTags.map((tag) => `${TAG_KEY_PREFIX}${tag}`);

  // If only one tag, use SMEMBERS; otherwise use SINTER for intersection
  let articleIds: string[] = [];

  if (tagKeys.length === 1) {
    const members = await redis.smembers(tagKeys[0]!);
    articleIds = (members as string[]) || [];
  } else {
    // Use SINTER to find articles that have ALL tags
    const intersection = await redis.sinter(tagKeys[0]!, ...tagKeys.slice(1));
    articleIds = (intersection as string[]) || [];
  }

  // Handle no matches
  if (articleIds.length === 0) {
    return [];
  }

  // Fetch full article data for each ID
  const articles: KnowledgeArticle[] = [];

  for (const id of articleIds) {
    const data = await redis.get<string>(`${ARTICLE_KEY_PREFIX}${id}`);
    if (data) {
      articles.push(JSON.parse(data));
    }
  }

  // Calculate match score and rank articles
  const rankedArticles: RankedArticle[] = articles.map((article) => {
    // Count how many of the search tags match the article's tags
    const matchingTags = normalizedTags.filter((tag) =>
      article.tags.map((t) => t.toLowerCase()).includes(tag)
    );

    return {
      ...article,
      matchScore: matchingTags.length,
    };
  });

  // Sort by match score (highest first), then by creation date (newest first)
  rankedArticles.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return rankedArticles;
}
