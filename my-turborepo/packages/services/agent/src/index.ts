// Export Redis client utilities
export { getRedisClient, resetRedisClient } from './redisClient.js';

// Export health check
export { healthCheck } from './healthCheck.js';
export type { HealthCheckResult } from './healthCheck.js';

// Export NLP service
export { processQuery } from './nlpService.js';
export type { NLPResult } from './nlpService.js';

// Export traffic service
export { getTrafficData } from './trafficService.js';
export type { TrafficData, TrafficRequest } from './trafficService.js';

// Export response formatter
export {
  formatTrafficResponse,
  formatTrafficFallback,
  formatNoLocationResponse,
  formatUnknownIntentResponse,
  formatKnowledgeResponse,
} from './responseFormatter.js';

// Export knowledge search
export { findArticlesByTags } from './knowledgeSearch.js';
export type { RankedArticle } from './knowledgeSearch.js';

// Export vector embedding
export {
  generateEmbedding,
  cosineSimilarity,
  isVectorEmbeddingEnabled,
  resetOpenAIClient,
} from './vectorEmbedding.js';

// Export vector search
export { indexArticle, searchArticlesByVector, reindexAllArticles } from './vectorSearch.js';
export type { VectorSearchResult } from './vectorSearch.js';

// Export LLM service
export {
  generateLLMResponse,
  isLLMEnabled,
  getLLMModel,
  getLLMTemperature,
  getLLMMaxTokens,
  resetLLMClient,
} from './llmService.js';
export type { LLMResponseOptions, LLMResponse } from './llmService.js';

// Export LLM response formatter
export {
  formatKnowledgeResponseWithLLM,
  formatKnowledgeResponseWithFallback,
} from './llmResponseFormatter.js';
export type { Article } from './llmResponseFormatter.js';

// Export PipeCat processors (language detection + STT)
export { processAudioPipeline } from './pipecatProcessors.js';
