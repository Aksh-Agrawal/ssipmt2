# Agent Service

This package contains the agent service logic for the AI-Powered Civic Voice Assistant, including the Live DB (Redis) connection and query processing capabilities.

## Overview

The agent service is responsible for:
- Managing the connection to the Live DB (Upstash Redis)
- Processing citizen queries through the information agent
- Providing real-time access to civic information

## Setup

### Prerequisites

1. An Upstash Redis instance (Live DB)
2. Environment variables configured

### Environment Variables

Add the following to your `.env` file:

```bash
# Required: Live DB (Redis) connection
REDIS_URL=your_upstash_redis_rest_url
REDIS_TOKEN=your_upstash_redis_rest_token

# Optional: Vector embeddings for advanced document search
ENABLE_VECTOR_EMBEDDINGS=true
OPENAI_API_KEY=your_openai_api_key

# Optional: LLM-powered response generation (Story 6.2)
ENABLE_LLM_RESPONSES=true              # Feature flag to enable/disable LLM responses
LLM_MODEL=gpt-3.5-turbo                # Model to use (default: gpt-3.5-turbo)
LLM_TEMPERATURE=0.4                    # Response creativity (0.0-1.0, default: 0.4)
LLM_MAX_TOKENS=500                     # Maximum response length (default: 500)
```

You can obtain Redis credentials from your [Upstash Console](https://console.upstash.com/).
For vector embeddings and LLM responses, you'll need an OpenAI API key from [OpenAI](https://platform.openai.com/).

### Installation

```bash
npm install
```

## Architecture

### Live DB Connection

The Live DB is implemented using Upstash Redis, chosen for:
- **Speed**: In-memory data structure store for fast reads
- **Serverless**: Optimized for serverless/edge environments
- **REST API**: Works seamlessly with Vercel and other platforms

### Core Components

#### `redisClient.ts`
Singleton Redis client factory that:
- Lazily initializes the connection
- Validates environment variables
- Provides a single connection instance

#### `healthCheck.ts`
Health check functionality that:
- Verifies the Live DB connection
- Executes a PING command
- Returns structured health status

## Usage

### Basic Usage

```typescript
import { getRedisClient, healthCheck } from '@repo/services-agent';

// Check connection health
const health = await healthCheck();
console.log(health.success); // true/false

// Use the Redis client
const redis = getRedisClient();
await redis.set('key', 'value');
const value = await redis.get('key');
```

### Vector Embeddings (Advanced)

The service now supports advanced document indexing and retrieval using vector embeddings. This enables semantic search for more relevant results.

```typescript
import {
  getRedisClient,
  indexArticle,
  searchArticlesByVector,
  reindexAllArticles,
} from '@repo/services-agent';

const redis = getRedisClient();

// Index a single article for vector search
await indexArticle(redis, {
  id: 'article-1',
  title: 'Garbage Collection Schedule',
  content: 'Residential garbage is collected every Monday...',
  tags: ['garbage', 'schedule'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Search articles using natural language queries
const results = await searchArticlesByVector(
  redis,
  'When does garbage pickup happen?',
  5,    // limit: top 5 results
  0.7   // threshold: minimum similarity score
);

// Results include the article data and similarity score
results.forEach(result => {
  console.log(`${result.title} (score: ${result.similarityScore})`);
});

// Reindex all existing articles
const count = await reindexAllArticles(redis);
console.log(`Indexed ${count} articles`);
```

**Feature Flag**: Vector embeddings can be disabled by setting `ENABLE_VECTOR_EMBEDDINGS=false` or omitting the environment variable. This provides a rollback mechanism if issues arise.

### LLM-Powered Response Generation (Story 6.2)

The service integrates with OpenAI's language models to generate natural, context-aware responses based on retrieved documents. This enhances the basic response formatting with more intelligent, conversational answers.

```typescript
import {
  formatKnowledgeResponseWithLLM,
  isLLMEnabled,
} from '@repo/services-agent';

// Check if LLM responses are enabled
if (isLLMEnabled()) {
  console.log('LLM responses are active');
}

// Format knowledge articles with LLM enhancement
const articles = [
  {
    title: 'Garbage Collection Schedule',
    content: 'Residential garbage is collected every Monday...',
    matchScore: 2,
  },
  {
    title: 'Recycling Guidelines',
    content: 'Please separate recyclables into appropriate bins...',
    matchScore: 1,
  },
];

// Automatically uses LLM if enabled, falls back to basic formatter if disabled
const response = await formatKnowledgeResponseWithLLM(
  articles,
  'When is garbage pickup in my area?'
);

console.log(response);
// Example output: "Based on the city's garbage collection schedule, 
// residential garbage is collected every Monday. Make sure to place 
// your bins at the curb by 7 AM on collection day."
```

**Key Features:**

- **Automatic Fallback**: If LLM is disabled or encounters an error, automatically falls back to basic response formatting
- **Cost/Latency Monitoring**: Logs token usage and response time for each LLM call
- **Configurable Model**: Choose between different OpenAI models (gpt-3.5-turbo, gpt-4, etc.)
- **Temperature Control**: Adjust response creativity (lower = more factual, higher = more creative)
- **Token Limits**: Control maximum response length to manage costs

**Feature Flag**: LLM responses can be disabled by setting `ENABLE_LLM_RESPONSES=false`. The system will continue to work using the basic response formatter. This provides a rollback mechanism if cost, latency, or quality issues arise.

**Cost Considerations:**

- GPT-3.5-turbo: ~$0.002 per 1K tokens (cost-effective for MVP)
- GPT-4: ~$0.03 per 1K tokens (higher quality, higher cost)
- Monitor logs for token usage and latency metrics

## Testing

### Unit Tests

Unit tests are written using Jest with mocking:

```bash
npm test
```

**Note**: There is currently a known issue with Jest and ESM configuration in the monorepo. Tests are properly written but require Jest configuration updates project-wide to run successfully.

### Manual Verification

To manually verify the Live DB connection:

```bash
npm run verify-connection
```

This script will:
1. Run a health check
2. Perform SET/GET/DEL operations
3. Confirm the connection is working correctly

**Prerequisites**: Ensure `REDIS_URL` and `REDIS_TOKEN` are set in your environment.

## Scripts

- `npm run lint` - Run ESLint
- `npm run check-types` - Run TypeScript type checking
- `npm test` - Run Jest tests
- `npm run verify-connection` - Manually verify Live DB connection

## Development Notes

- All Redis operations should go through the `getRedisClient()` function
- Never access `process.env` directly; environment variables are validated at client creation
- The client uses a singleton pattern to maintain a single connection
- For testing, use `resetRedisClient()` to force recreation of the client

## Integration

This service is used by:
- `apps/api` - Backend API for agent query endpoints
- Future agent features and knowledge retrieval systems
