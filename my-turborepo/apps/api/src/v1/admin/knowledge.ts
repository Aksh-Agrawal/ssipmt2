import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import type { KnowledgeArticle } from '@repo/shared-types';

const adminKnowledge = new Hono();

/**
 * GET /api/v1/admin/knowledge
 * Protected endpoint to fetch all knowledge articles from Live DB (Redis).
 * Returns articles sorted by creation date (newest first).
 */
adminKnowledge.get(
  '/',
  authMiddleware,
  async (c) => {
    try {
      // TODO: Implement Redis client and fetch articles from Live DB
      // For now, return empty array as placeholder
      const articles: KnowledgeArticle[] = [];

      return c.json({
        articles,
        total: articles.length,
        message: 'Knowledge articles fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching knowledge articles:', error);
      
      return c.json(
        { 
          error: 'Failed to fetch knowledge articles',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

export default adminKnowledge;
