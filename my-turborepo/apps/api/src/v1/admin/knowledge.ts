import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.js';
import type { KnowledgeArticle } from '@repo/shared-types';
import { getRedisClient } from '@repo/services-agent';
import {
  getAllArticles,
  createArticle,
  updateArticle,
  getArticleById,
} from '@repo/services-knowledge';

const adminKnowledge = new Hono();

// Validation schemas
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).default([]),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

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
      const redis = getRedisClient();
      const articles = await getAllArticles(redis);

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

/**
 * POST /api/v1/admin/knowledge
 * Protected endpoint to create a new knowledge article in Live DB (Redis).
 */
adminKnowledge.post(
  '/',
  authMiddleware,
  zValidator('json', createArticleSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const redis = getRedisClient();
      
      const article = await createArticle(redis, data);

      return c.json({
        article,
        message: 'Knowledge article created successfully',
      }, 201);
    } catch (error) {
      console.error('Error creating knowledge article:', error);
      
      return c.json(
        { 
          error: 'Failed to create knowledge article',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

/**
 * PATCH /api/v1/admin/knowledge/:id
 * Protected endpoint to update an existing knowledge article in Live DB (Redis).
 */
adminKnowledge.patch(
  '/:id',
  authMiddleware,
  zValidator('json', updateArticleSchema),
  async (c) => {
    try {
      const id = c.req.param('id');
      const data = c.req.valid('json');
      const redis = getRedisClient();
      
      const article = await updateArticle(redis, id, data);

      if (!article) {
        return c.json(
          { 
            error: 'Knowledge article not found',
            message: `Article with ID ${id} does not exist`,
          },
          404
        );
      }

      return c.json({
        article,
        message: 'Knowledge article updated successfully',
      });
    } catch (error) {
      console.error('Error updating knowledge article:', error);
      
      return c.json(
        { 
          error: 'Failed to update knowledge article',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

/**
 * GET /api/v1/admin/knowledge/:id
 * Protected endpoint to fetch a single knowledge article by ID.
 */
adminKnowledge.get(
  '/:id',
  authMiddleware,
  async (c) => {
    try {
      const id = c.req.param('id');
      const redis = getRedisClient();
      
      const article = await getArticleById(redis, id);

      if (!article) {
        return c.json(
          { 
            error: 'Knowledge article not found',
            message: `Article with ID ${id} does not exist`,
          },
          404
        );
      }

      return c.json({
        article,
        message: 'Knowledge article fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching knowledge article:', error);
      
      return c.json(
        { 
          error: 'Failed to fetch knowledge article',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  }
);

export default adminKnowledge;
