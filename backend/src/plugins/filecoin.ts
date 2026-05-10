import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { calibration } from '@filoz/synapse-core/chains';
import { config } from '../config/environment.js';

type SynapseClient = {
  storage: {
    upload: (data: Uint8Array | string) => Promise<{ rootCid: string; pieceCid?: string; datasetId?: string }>;
  };
};

type FilecoinPlugin = {
  publicClient: ReturnType<typeof createPublicClient>;
  synapse: SynapseInstance | null;
};

// Internal type matching the real Synapse SDK instance
type SynapseInstance = {
  storage: any;
  payments: any;
  client: any;
};

declare module 'fastify' {
  interface FastifyInstance {
    filecoin: FilecoinPlugin;
  }
}

export default fp(async function filecoinPlugin(fastify: FastifyInstance) {
  const publicClient = createPublicClient({
    chain: calibration,
    transport: http(config.filecoinRpcUrl),
  });

  let synapseInstance: SynapseInstance | null = null;

  if (config.agentPrivateKey) {
    try {
      const { Synapse } = await import('@filoz/synapse-sdk');
      const account = privateKeyToAccount(config.agentPrivateKey as Address);

      synapseInstance = (Synapse as any).create({
        account,
        chain: calibration,
        transport: http(config.filecoinRpcUrl),
      });

      fastify.log.info('Filecoin Synapse SDK initialized successfully');
    } catch (err) {
      fastify.log.error({ err }, 'Failed to initialize Filecoin Synapse SDK — uploads will be skipped');
    }
  } else {
    fastify.log.warn('AGENT_PRIVATE_KEY not set — Filecoin uploads disabled');
  }

  fastify.decorate('filecoin', { publicClient, synapse: synapseInstance });
}, {
  name: 'filecoin',
});
