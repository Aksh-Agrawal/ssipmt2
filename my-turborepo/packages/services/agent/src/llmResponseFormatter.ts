/**
 * LLM Response Formatter
 * Enhanced response formatting using LLM for natural, context-aware responses
 * Falls back to basic formatting if LLM is disabled or fails
 */

import { generateLLMResponse, isLLMEnabled } from './llmService.js';
import { formatKnowledgeResponse } from './responseFormatter.js';

export interface Article {
  title: string;
  content: string;
  matchScore?: number;
  similarityScore?: number;
}

/**
 * Normalize articles for basic formatter compatibility
 * The basic formatter expects matchScore to be present
 */
function normalizeArticles(articles: Article[]): Array<{ title: string; content: string; matchScore: number }> {
  return articles.map((article) => ({
    title: article.title,
    content: article.content,
    matchScore: article.matchScore ?? article.similarityScore ?? 0,
  }));
}

/**
 * Format knowledge articles into a natural language response using LLM
 * Falls back to basic formatting if LLM is disabled or encounters an error
 * 
 * @param articles - Array of retrieved articles (tag-based or vector-based)
 * @param query - The original user query
 * @returns Promise resolving to formatted response string
 */
export async function formatKnowledgeResponseWithLLM(
  articles: Article[],
  query: string
): Promise<string> {
  // If no articles found, use basic formatter
  if (!articles || articles.length === 0) {
    return formatKnowledgeResponse([], query);
  }

  // If LLM is not enabled, fall back to basic formatter
  if (!isLLMEnabled()) {
    const normalized = normalizeArticles(articles);
    return formatKnowledgeResponse(normalized, query);
  }

  try {
    // Prepare documents for LLM
    const documents = articles.map((article) => ({
      title: article.title,
      content: article.content,
    }));

    // Generate LLM response
    const llmResponse = await generateLLMResponse({
      userQuery: query,
      retrievedDocuments: documents,
    });

    return llmResponse.content;
  } catch (error) {
    // Log error and fall back to basic formatter
    console.error('[LLM Formatter] Error generating LLM response, falling back to basic formatter:', error);
    const normalized = normalizeArticles(articles);
    return formatKnowledgeResponse(normalized, query);
  }
}

/**
 * Format knowledge articles with explicit fallback behavior
 * Useful for testing and debugging the fallback mechanism
 * 
 * @param articles - Array of retrieved articles
 * @param query - The original user query
 * @param forceFallback - If true, skip LLM and use basic formatter
 * @returns Promise resolving to formatted response string
 */
export async function formatKnowledgeResponseWithFallback(
  articles: Article[],
  query: string,
  forceFallback: boolean = false
): Promise<string> {
  if (forceFallback) {
    const normalized = normalizeArticles(articles);
    return formatKnowledgeResponse(normalized, query);
  }

  return formatKnowledgeResponseWithLLM(articles, query);
}
