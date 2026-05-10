import { FastifyInstance, FastifyRequest } from 'fastify';

export default async function conversationInitRoutes(fastify: FastifyInstance) {
  fastify.get('/elevenlabs/conversation-init', async (request: FastifyRequest<{
    Querystring: { phone_number?: string };
  }>) => {
    const phoneNumber = request.query.phone_number?.trim();

    if (!phoneNumber) {
      return { dynamic_variables: { customer_name: 'Customer', policy_number: 'Unknown', claim_history: 'No history' } };
    }

    const { data: customer } = await fastify.supabase
      .from('customers')
      .select('id, full_name, phone')
      .eq('phone', phoneNumber)
      .single();

    if (!customer) {
      return { dynamic_variables: { customer_name: 'Customer', policy_number: 'Unknown', claim_history: 'No history' } };
    }

    const { data: policy } = await fastify.supabase
      .from('policies')
      .select('policy_number, status')
      .eq('customer_id', customer.id)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    const { data: claims } = await fastify.supabase
      .from('claims')
      .select('claim_number, status, claim_type, filed_at')
      .eq('customer_id', customer.id)
      .order('filed_at', { ascending: false })
      .limit(3);

    const claimHistory = (claims || [])
      .map((claim) => `${claim.claim_number} (${claim.claim_type}, ${claim.status})`)
      .join('; ');

    return {
      dynamic_variables: {
        customer_name: customer.full_name,
        policy_number: policy?.policy_number ?? 'Unknown',
        claim_history: claimHistory || 'No history',
      },
    };
  });
}
