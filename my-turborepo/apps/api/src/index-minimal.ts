import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import pino from 'pino';

const app = new Hono();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'api-minimal' });
});

const port = parseInt(process.env.PORT || '3001');

logger.info('Starting minimal server...');

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`Minimal server listening on port ${info.port}`);
  }
);

// Keep the process alive
setInterval(() => {
  logger.debug('Server heartbeat');
}, 30000);

export default app;
