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
REDIS_URL=your_upstash_redis_rest_url
REDIS_TOKEN=your_upstash_redis_rest_token
```

You can obtain these credentials from your [Upstash Console](https://console.upstash.com/).

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

### Import the Service

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
