import Fastify from 'fastify';
import { config } from './config/environment.js';
import supabasePlugin from './plugins/supabase.js';
import corsPlugin from './plugins/cors.js';
import ethereumPlugin from './plugins/ethereum.js';
import filecoinPlugin from './plugins/filecoin.js';
import rawBody from '@fastify/raw-body';

const fastify = Fastify({
  logger: {
    transport: config.nodeEnv === 'development' ? {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' }
    } : undefined,
  },
});

// Register plugins
await fastify.register(supabasePlugin);
await fastify.register(corsPlugin);
await fastify.register(ethereumPlugin);
await fastify.register(filecoinPlugin);
await fastify.register(rawBody, {
  field: 'rawBody',
  global: false,
  encoding: false,
  runFirst: true,
});

// Register routes (Anish's)
await fastify.register(import('./routes/claims.js'), { prefix: '/api' });
await fastify.register(import('./routes/calls.js'), { prefix: '/api' });
await fastify.register(import('./routes/analytics.js'), { prefix: '/api' });
await fastify.register(import('./routes/escalations.js'), { prefix: '/api' });
await fastify.register(import('./routes/webhooks.js'), { prefix: '/api' });
await fastify.register(import('./routes/agent-identity.js'), { prefix: '/api' });
await fastify.register(import('./routes/conversation-init.js'), { prefix: '/api' });

// Register routes (Tanmay's — will be created later)
await fastify.register(import('./routes/webhook-tools.js'), { prefix: '/api' });

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Build/version check
fastify.get('/version', async () => ({
  git_sha: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'unknown',
  build_time: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown',
}));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
