import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from '../config/environment.js';

declare module 'fastify' {
  interface FastifyInstance {
    ethereum: {
      publicClient: ReturnType<typeof createPublicClient>;
      walletClient: ReturnType<typeof createWalletClient> | null;
      account: Address | null;
    };
  }
}

export default fp(async function ethereumPlugin(fastify: FastifyInstance) {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(config.baseSepoliaRpcUrl),
  });
  let walletClient: ReturnType<typeof createWalletClient> | null = null;
  let account: Address | null = null;
  if (config.agentPrivateKey) {
    const agentAccount = privateKeyToAccount(config.agentPrivateKey as Address);
    account = agentAccount.address;
    walletClient = createWalletClient({
      account: agentAccount,
      chain: baseSepolia,
      transport: http(config.baseSepoliaRpcUrl),
    });
  }

  fastify.decorate('ethereum', { publicClient, walletClient, account });
}, {
  name: 'ethereum',
});
