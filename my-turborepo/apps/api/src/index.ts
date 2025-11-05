import { Hono } from 'hono';
import reports from './v1/reports/index.js';
import analyzeReport from './v1/internal/analyze-report.js';
import adminReports from './v1/admin/reports.js';
import adminReportDetail from './v1/admin/reports/[id].js';
import adminReportStatusUpdate from './v1/admin/reports/[id]/status.js';
import adminKnowledge from './v1/admin/knowledge.js';
import agentQuery from './v1/agent/query.js';
import { serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { verify } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import pino from 'pino'; // Import pino
import { detectLanguage } from '@repo/services-agent/src/swaramAiService.js';
import { transcribeAudio } from '@repo/services-agent/src/deepgramSttService.js';

type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();

// Initialize logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// IMPORTANT: Get your Supabase JWT Secret from Supabase project settings -> API -> Project Settings -> JWT Secret
// It's crucial to keep this secret secure and load it from environment variables.
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'YOUR_SUPABASE_JWT_SECRET';

// Setup WebSocket
const { upgradeWebSocket } = createNodeWebSocket({ app });

// Middleware to extract and verify the JWT from the query parameter for WebSocket connections
app.use('/ws/voice', async (c, next) => {
  const token = c.req.query('token'); // Get token from query parameter

  if (!token) {
    logger.warn('Unauthorized: No token provided for WebSocket connection.');
    return c.text('Unauthorized: No token provided', 401);
  }

  try {
    const payload = await verify(token, SUPABASE_JWT_SECRET);
    // Attach the payload to the context for later use in the WebSocket handler
    c.set('jwtPayload', payload);
    await next();
  } catch (e) {
    logger.error({ error: e }, 'JWT verification failed for WebSocket connection');
    return c.text('Unauthorized: Invalid token', 401);
  }
});

// WebSocket endpoint for voice chat
app.get(
  '/ws/voice',
  upgradeWebSocket((c) => {
    const jwtPayload = c.get('jwtPayload'); // Access the validated JWT payload
    const userId = jwtPayload?.sub || 'unknown'; // 'sub' is typically the user ID

    logger.info(`WebSocket connection established for user: ${userId}`);

    return {
      onOpen: (event, ws) => {
        logger.info(`WebSocket opened for user ${userId}: ${event.type}`);
        ws.send(`Welcome, user ${userId}! Agent received your audio. Processing...`);
      },

      // ... (rest of the file)

      onMessage: async (event, ws) => {
        // Handle incoming audio data from the client
        logger.info(`Received audio data from user ${userId}`);

        // 1. Detect language
        const language = await detectLanguage(event.data as Buffer);

        // 2. Transcribe audio
        const transcription = await transcribeAudio(event.data as Buffer, language);

        // 3. Pass transcription to agent logic (placeholder)
        logger.info(`Passing transcription to agent: "${transcription}"`);

        // For now, echo back the transcription
        ws.send(`Transcription: ${transcription}`);
      },
      onClose: () => {
        logger.info(`WebSocket closed for user: ${userId}`);
      },
      onError: (event) => {
        logger.error({ event }, `WebSocket error for user ${userId}`);
      },
    };
  })
);

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api' });
});

// API v1 routes
app.route('/api/v1/reports', reports);
app.route('/api/v1/internal/analyze-report', analyzeReport);
app.route('/api/v1/admin/reports', adminReports);
app.route('/api/v1/admin/reports/:id', adminReportDetail);
app.route('/api/v1/admin/reports/:id/status', adminReportStatusUpdate);
app.route('/api/v1/admin/knowledge', adminKnowledge);
app.route('/api/v1/agent/query', agentQuery);

// Start server
const port = parseInt(process.env.PORT || '3001');
serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`API server listening on port ${info.port}`);
  }
);

export default app;
