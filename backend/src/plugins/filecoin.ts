import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createPublicClient, http } from 'viem';
import { config } from '../config/environment.js';
import { calibration } from '@filoz/synapse-core/chains';

type SynapseClient = {
  uploadClaimBundle: (bundle: unknown) => Promise<{ rootCid: string; pieceCid?: string; datasetId?: string }>;
  downloadBundle: (rootCid: string) => Promise<unknown>;
};

declare module 'fastify' {
  interface FastifyInstance {
    filecoin: {
      publicClient: ReturnType<typeof createPublicClient>;
      synapse: SynapseClient;
    };
  }
}

const filecoinChain = calibration;

export default fp(async function filecoinPlugin(fastify: FastifyInstance) {
  const publicClient = createPublicClient({
    chain: filecoinChain,
    transport: http(config.filecoinRpcUrl),
  });

  const synapseModule = await import('@filoz/synapse-sdk');
  const synapseFactory = (synapseModule as any).createClient || (synapseModule as any).Synapse || (synapseModule as any).default;
  if (!synapseFactory) {
    throw new Error('Synapse SDK factory not found. Check @filoz/synapse-sdk installation.');
  }

  let synapseInstance: any = null;
  if (typeof synapseFactory === 'function') {
    try {
      synapseInstance = synapseFactory({ client: publicClient });
    } catch {
      synapseInstance = new synapseFactory({ client: publicClient });
    }
  } else {
    synapseInstance = synapseFactory;
  }

  if (!synapseInstance) {
    throw new Error('Synapse SDK failed to initialize.');
  }

  const synapse: SynapseClient = {
    uploadClaimBundle: async (bundle: unknown) => synapseInstance.uploadClaimBundle(bundle),
    downloadBundle: async (rootCid: string) => synapseInstance.downloadBundle(rootCid),
  };

  fastify.decorate('filecoin', { publicClient, synapse });
}, {
  name: 'filecoin',
});
