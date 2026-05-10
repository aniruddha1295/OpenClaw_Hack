import { FastifyInstance } from 'fastify';
import { config } from '../config/environment.js';

export default async function agentIdentityRoutes(fastify: FastifyInstance) {
  fastify.get('/agent-identity', async () => {
    const { data } = await fastify.supabase
      .from('agent_registrations')
      .select('*')
      .order('registered_at', { ascending: false })
      .limit(1);

    const latest = data?.[0];

    return {
      data: {
        agent_id: latest?.agent_id ?? Number(config.agentId),
        agent_card_cid: latest?.agent_card_cid ?? null,
        identity_registry_address: latest?.identity_registry_address ?? null,
        network: latest?.network ?? 'base-sepolia',
        owner_address: latest?.owner_address ?? fastify.ethereum?.account ?? null,
        claim_registry_address: config.claimRegistryAddress,
        registration_tx_hash: latest?.registration_tx_hash ?? null,
      },
      error: null,
    };
  });
}
