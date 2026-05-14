import { FastifyInstance } from 'fastify';
import { type Address, type Hash } from 'viem';
import { lookupClaim, checkDocuments, fileClaim } from '../services/claims-service.js';
import { createEscalation } from '../services/escalation-service.js';
import { scheduleCallback } from '../services/callback-service.js';
import { lookupPolicy } from '../services/policy-service.js';
import { buildEvidenceBundle, computeEvidenceHash } from '../services/attestation-service.js';
import { uploadClaimBundle } from '../services/filecoin-service.js';
import { attestClaim } from '../services/ethereum-service.js';
import { createEasClient, createEasSigner, issueAttestation, loadEasSdk } from '../services/eas-service.js';
import { createAlkahestEscrow } from '../services/alkahest-service.js';
import { config } from '../config/environment.js';

export default async function webhookToolsRoutes(fastify: FastifyInstance) {
  // GET /tools/force-demo — force trigger a fake claim and Filecoin upload for demo purposes
  fastify.get('/tools/force-demo', {
    schema: { tags: ['Tools'], summary: 'Force trigger a fake claim' }
  }, async (request) => {
    try {
      const result = await fileClaim(fastify.supabase, {
        policy_number: 'POL-2024-001234',
        claim_type: 'auto',
        incident_date: new Date().toISOString(),
        incident_description: 'Demo triggered manually from the browser.',
      });

      if (result.success && result.claim_id) {
        const evidence = await processClaimEvidence(fastify, result.claim_id);
        return { message: 'Demo success!', claim_id: result.claim_id, ...evidence };
      }
      return { message: 'Failed to create demo claim' };
    } catch (err) {
      return { message: 'Error running demo', error: String(err) };
    }
  });

  // POST /tools/lookup-claim — look up a claim by claim number
  fastify.post('/tools/lookup-claim', {
    schema: {
      tags: ['Tools'],
      summary: 'Look up a claim by claim number',
      body: {
        type: 'object',
        properties: { claim_id: { type: 'string' }, claimId: { type: 'string' }, claimNumber: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as any;
      const claim_id = body.claim_id || body.claimId || body.claimNumber || body.claim_number;

      if (!claim_id) {
        return { found: false, message: 'Please provide a claim number.' };
      }

      fastify.log.info({ tool: 'lookup-claim', args: { claim_id } }, 'Tool invoked');
      const result = await lookupClaim(fastify.supabase, claim_id);
      fastify.log.info({ tool: 'lookup-claim', success: result.found }, 'Tool completed');
      return result;
    } catch (err) {
      fastify.log.error(err, 'lookup-claim tool failed');
      return { found: false, message: 'I was unable to look up that claim. Please try again.' };
    }
  });

  // POST /tools/check-policy — look up a policy by policy number
  fastify.post('/tools/check-policy', {
    schema: {
      tags: ['Tools'],
      summary: 'Look up a policy by policy number',
      body: {
        type: 'object',
        properties: { policy_number: { type: 'string' }, policyNumber: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as any;
      const policy_number = body.policy_number || body.policyNumber;

      if (!policy_number) {
        return { found: false, message: 'Please provide a policy number.' };
      }

      fastify.log.info({ tool: 'check-policy', args: { policy_number } }, 'Tool invoked');
      const result = await lookupPolicy(fastify.supabase, policy_number);
      fastify.log.info({ tool: 'check-policy', success: result.found }, 'Tool completed');
      return result;
    } catch (err) {
      fastify.log.error(err, 'check-policy tool failed');
      return { found: false, message: 'I was unable to look up that policy. Please try again.' };
    }
  });

  // POST /tools/check-documents — check documents for a claim by claim number
  fastify.post('/tools/check-documents', {
    schema: {
      tags: ['Tools'],
      summary: 'Check documents for a claim by claim number',
      body: {
        type: 'object',
        properties: { claim_id: { type: 'string' }, claimId: { type: 'string' }, claimNumber: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as any;
      const claim_id = body.claim_id || body.claimId || body.claimNumber || body.claim_number;

      if (!claim_id) {
        return { found: false, message: 'Please provide a claim number.' };
      }

      fastify.log.info({ tool: 'check-documents', args: { claim_id } }, 'Tool invoked');
      const result = await checkDocuments(fastify.supabase, claim_id);
      fastify.log.info({ tool: 'check-documents', success: result.found }, 'Tool completed');
      return result;
    } catch (err) {
      fastify.log.error(err, 'check-documents tool failed');
      return { found: false, message: 'I was unable to check the documents for that claim. Please try again.' };
    }
  });

  // POST /tools/file-claim — file a new insurance claim
  fastify.post('/tools/file-claim', {
    schema: {
      tags: ['Tools'],
      summary: 'File a new insurance claim',
      body: {
        type: 'object',
        properties: {
          policy_number: { type: 'string' },
          incident_description: { type: 'string' },
          claim_type: { type: 'string' },
          incident_date: { type: 'string' }
        }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as any;
      fastify.log.info({ rawBody: body }, 'Received file-claim payload');

      const policy_number = body.policy_number || body.policyNumber;
      const incident_description = body.incident_description || body.incidentDescription;
      const claim_type = body.claim_type || body.claimType || 'auto';
      const incident_date = body.incident_date || body.incidentDate || new Date().toISOString();

      if (!policy_number || !incident_description) {
        return {
          success: false,
          message: 'I need at least a policy number and description of the incident to file a claim.',
        };
      }
      
      const args = { policy_number, claim_type, incident_date, incident_description };
      fastify.log.info({ tool: 'file-claim', args }, 'Tool invoked');
      const result = await fileClaim(fastify.supabase, args);
      if (result.success && result.claim_id) {
        try {
          const evidence = await processClaimEvidence(fastify, result.claim_id);
          if (evidence) {
            return { ...result, ...evidence };
          }
        } catch (err) {
          fastify.log.error(err, 'Post-claim processing failed');
        }
      }
      fastify.log.info({ tool: 'file-claim', success: result.success }, 'Tool completed');
      return result;
    } catch (error) {
      fastify.log.error(error, 'Error in file-claim');
      return {
        success: false,
        message: 'I was unable to file the claim right now. Please try again or I can transfer you to an agent.',
      };
    }
  });

  // POST /tools/escalate-to-human — escalate call to a human supervisor
  fastify.post('/tools/escalate-to-human', {
    schema: {
      tags: ['Tools'],
      summary: 'Escalate call to a human supervisor',
      body: {
        type: 'object',
        properties: { reason: { type: 'string' }, priority: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as { reason: string; priority?: string };
      if (!body.reason) {
        return {
          success: false,
          message: 'Could you tell me the reason you would like to speak with a supervisor?',
        };
      }
      fastify.log.info({ tool: 'escalate-to-human', args: { reason: body.reason, priority: body.priority } }, 'Tool invoked');
      const result = await createEscalation(fastify.supabase, body);
      fastify.log.info({ tool: 'escalate-to-human', success: result.success }, 'Tool completed');
      return result;
    } catch (error) {
      fastify.log.error(error, 'Error in escalate-to-human');
      return {
        success: false,
        message: 'I was unable to create the escalation. Please hold while I try again.',
      };
    }
  });

  // POST /tools/schedule-callback — schedule a callback for the customer
  fastify.post('/tools/schedule-callback', {
    schema: {
      tags: ['Tools'],
      summary: 'Schedule a callback for the customer',
      body: {
        type: 'object',
        properties: { phone_number: { type: 'string' }, preferred_time: { type: 'string' }, reason: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as {
        phone_number: string;
        preferred_time: string;
        reason?: string;
      };
      if (!body.phone_number) {
        return {
          success: false,
          message: 'I need a phone number to schedule the callback.',
        };
      }
      if (!body.preferred_time?.trim()) {
        return {
          success: false,
          message: 'When would you like us to call you back?',
        };
      }
      fastify.log.info({ tool: 'schedule-callback', args: { phone_number: body.phone_number, preferred_time: body.preferred_time } }, 'Tool invoked');
      const result = await scheduleCallback(fastify.supabase, body);
      fastify.log.info({ tool: 'schedule-callback', success: result.success }, 'Tool completed');
      return result;
    } catch (error) {
      fastify.log.error(error, 'Error in schedule-callback');
      return {
        success: false,
        message: 'I was unable to schedule the callback. Can I try a different time?',
      };
    }
  });

  // POST /tools/attach-document — attach a document/photo for a claim
  fastify.post('/tools/attach-document', {
    schema: {
      tags: ['Tools'],
      summary: 'Attach a document/photo for a claim',
      body: {
        type: 'object',
        properties: { claim_id: { type: 'string' }, file_url: { type: 'string' }, file_type: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as { claim_id?: string; file_url?: string; file_type?: string };
      if (!body.claim_id || !body.file_url || !body.file_type) {
        return { success: false, message: 'I need a claim ID, file URL, and file type to attach the document.' };
      }

      const { data: claim } = await fastify.supabase
        .from('claims')
        .select('id, claim_number, policy_id, customer_id, incident_date, incident_description, documents_received')
        .eq('id', body.claim_id)
        .single();

      if (!claim) {
        return { success: false, message: 'Claim not found.' };
      }

      const { data: policy } = await fastify.supabase
        .from('policies')
        .select('policy_number')
        .eq('id', claim.policy_id)
        .single();

      const nextDocs = Array.from(new Set([...(claim.documents_received || []), body.file_type]));

      const { bundle, hash } = buildEvidenceBundle({
        claimId: claim.id,
        claimNumber: claim.claim_number,
        policyNumber: policy?.policy_number || '',
        customerId: claim.customer_id,
        incidentDate: claim.incident_date,
        incidentDescription: claim.incident_description,
        documents: nextDocs,
        photoCids: [],
        metadata: {
          file_url: body.file_url,
          file_type: body.file_type,
        },
      });

      const upload = await uploadClaimBundle(fastify.filecoin.synapse, bundle);

      await fastify.supabase.from('evidence_bundles').insert({
        claim_id: claim.id,
        bundle_json: bundle,
        bundle_hash: hash,
        photo_cids: upload.rootCid ? [upload.rootCid] : [],
      });

      await fastify.supabase.from('filecoin_uploads').insert({
        claim_id: claim.id,
        root_cid: upload.rootCid,
        piece_cid: upload.pieceCid ?? null,
        dataset_id: upload.datasetId ?? null,
        upload_status: 'completed',
        pdp_status: 'pending',
        completed_at: new Date().toISOString(),
      });

      await fastify.supabase
        .from('claims')
        .update({
          documents_received: nextDocs,
          filecoin_cid: upload.rootCid,
          piece_cid: upload.pieceCid ?? null,
          dataset_id: upload.datasetId ?? null,
          evidence_hash: hash,
          pdp_proof_status: 'pending',
        })
        .eq('id', claim.id);

      return {
        success: true,
        cid: upload.rootCid,
        message: 'Document attached and pinned to Filecoin.',
      };
    } catch (error) {
      fastify.log.error(error, 'Error in attach-document');
      return { success: false, message: 'I was unable to attach the document right now.' };
    }
  });

  // POST /tools/escalate-to-regulator — emit EAS attestation for complaints
  fastify.post('/tools/escalate-to-regulator', {
    schema: {
      tags: ['Tools'],
      summary: 'Emit EAS attestation for complaints',
      body: {
        type: 'object',
        properties: { claim_id: { type: 'string' }, reason: { type: 'string' }, priority: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as { claim_id?: string; reason?: string; priority?: string };
      if (!body.claim_id || !body.reason) {
        return { success: false, message: 'I need a claim ID and reason to escalate to a regulator.' };
      }

      const { data: claim } = await fastify.supabase
        .from('claims')
        .select('id, claim_number, customer_id, claim_type, claimed_amount')
        .eq('id', body.claim_id)
        .single();

      if (!claim) {
        return { success: false, message: 'Claim not found.' };
      }

      const evidenceHash = computeEvidenceHash({
        claim_id: claim.id,
        claim_number: claim.claim_number,
        reason: body.reason,
        claim_type: claim.claim_type,
        claimed_amount: claim.claimed_amount,
        created_at: new Date().toISOString(),
      } as any);

      let easUid: string | null = null;
      if (
        config.easContractAddress &&
        config.easSchema &&
        config.easSchemaUid &&
        config.agentPrivateKey
      ) {
        const sdk = await loadEasSdk();
        if (!sdk) {
          throw new Error('EAS SDK not available');
        }
        const eas = await createEasClient(config.easContractAddress as Address);
        const signer = createEasSigner(config.agentPrivateKey, config.baseSepoliaRpcUrl);
        easUid = await issueAttestation(eas, signer, {
          recipient: fastify.ethereum.account as Address,
          schema: config.easSchema,
          schemaUid: config.easSchemaUid as Hash,
          data: [
            { name: 'claim_id', type: 'string', value: claim.id },
            { name: 'claim_number', type: 'string', value: claim.claim_number },
            { name: 'reason', type: 'string', value: body.reason },
            { name: 'evidence_hash', type: 'string', value: evidenceHash },
          ],
        });
      }

      await createEscalation(fastify.supabase, {
        claim_id: claim.id,
        customer_id: claim.customer_id,
        reason: body.reason,
        priority: body.priority,
      });

      return {
        success: true,
        eas_uid: easUid,
        message: easUid
          ? 'Regulatory escalation submitted with attestation proof.'
          : 'Regulatory escalation recorded (attestation skipped in demo mode).',
      };
    } catch (error) {
      fastify.log.error(error, 'Error in escalate-to-regulator');
      return { success: false, message: 'I was unable to escalate to the regulator right now.' };
    }
  });

  // POST /tools/create-escrow — create an Alkahest Escrow for a claim payout
  fastify.post('/tools/create-escrow', {
    schema: {
      tags: ['Tools'],
      summary: 'Create an Alkahest Escrow for a claim payout',
      body: {
        type: 'object',
        properties: { claim_id: { type: 'string' }, payee_address: { type: 'string' }, amount: { type: 'string' } }
      }
    }
  }, async (request) => {
    try {
      const body = request.body as { claim_id?: string; payee_address?: string; amount?: string };
      if (!body.claim_id || !body.payee_address || !body.amount) {
        return { success: false, message: 'I need a claim ID, payee address, and amount to create an escrow.' };
      }

      if (!config.alkahestContractAddress || !config.agentPrivateKey || !config.baseSepoliaRpcUrl) {
        fastify.log.warn('Alkahest config missing. Returning mock escrow.');
        return { success: true, escrow_id: `mock_escrow_${Date.now()}`, message: 'Mock Escrow Created.' };
      }

      const escrow = await createAlkahestEscrow(
        config.alkahestContractAddress,
        config.agentPrivateKey, // Assume using agent's private key to sponsor transaction
        config.baseSepoliaRpcUrl, // Assume escrow deployed on base sepolia or Calibnet if configured differently
        body.payee_address,
        body.amount
      );

      return {
        success: true,
        escrow_id: escrow.escrowId,
        tx_hash: escrow.transactionHash,
        message: 'Alkahest Escrow Created Successfully.'
      };
    } catch (error) {
      fastify.log.error(error, 'Error in create-escrow');
      return { success: false, message: 'I was unable to create the escrow.' };
    }
  });
}

async function processClaimEvidence(fastify: FastifyInstance, claimId: string) {
  const { data: claim } = await fastify.supabase
    .from('claims')
    .select('id, claim_number, policy_id, customer_id, incident_date, incident_description, documents_received')
    .eq('id', claimId)
    .single();

  if (!claim) {
    return null;
  }

  const { data: policy } = await fastify.supabase
    .from('policies')
    .select('policy_number')
    .eq('id', claim.policy_id)
    .single();

  const { bundle, hash } = buildEvidenceBundle({
    claimId: claim.id,
    claimNumber: claim.claim_number,
    policyNumber: policy?.policy_number || '',
    customerId: claim.customer_id,
    incidentDate: claim.incident_date,
    incidentDescription: claim.incident_description,
    documents: claim.documents_received || [],
    photoCids: [],
  });

  const upload = await uploadClaimBundle(fastify.filecoin.synapse, bundle);

  await fastify.supabase.from('evidence_bundles').insert({
    claim_id: claim.id,
    bundle_json: bundle,
    bundle_hash: hash,
    photo_cids: [],
  });

  await fastify.supabase.from('filecoin_uploads').insert({
    claim_id: claim.id,
    root_cid: upload.rootCid,
    piece_cid: upload.pieceCid ?? null,
    dataset_id: upload.datasetId ?? null,
    upload_status: 'completed',
    pdp_status: 'pending',
    completed_at: new Date().toISOString(),
  });

  let txHash: Hash | null = null;
  if (fastify.ethereum.walletClient && fastify.ethereum.account) {
    txHash = await attestClaim(
      fastify.ethereum.publicClient as any,
      fastify.ethereum.walletClient as any,
      config.claimRegistryAddress as Address,
      fastify.ethereum.account as Address,
      upload.rootCid
    );
  }

  let easUid: string | null = null;
  if (
    config.easContractAddress &&
    config.easSchema &&
    config.easSchemaUid &&
    config.agentPrivateKey
  ) {
    try {
      const sdk = await loadEasSdk();
      if (!sdk) {
        throw new Error('EAS SDK not available');
      }
      const eas = await createEasClient(config.easContractAddress as Address);
      const signer = createEasSigner(config.agentPrivateKey, config.baseSepoliaRpcUrl);
      easUid = await issueAttestation(eas, signer, {
        recipient: fastify.ethereum.account as Address,
        schema: config.easSchema,
        schemaUid: config.easSchemaUid as Hash,
        data: [
          { name: 'claim_id', type: 'string', value: claim.id },
          { name: 'claim_number', type: 'string', value: claim.claim_number },
          { name: 'evidence_hash', type: 'string', value: hash },
        ],
      });
    } catch (error) {
      fastify.log.error(error, 'EAS attestation failed');
    }
  }

  await fastify.supabase
    .from('claims')
    .update({
      filecoin_cid: upload.rootCid,
      piece_cid: upload.pieceCid ?? null,
      dataset_id: upload.datasetId ?? null,
      evidence_hash: hash,
      attestation_tx_hash: txHash,
      eas_uid: easUid,
      agent_id: config.agentId ? Number(config.agentId) : null,
      pdp_proof_status: 'pending',
      attested_at: new Date().toISOString(),
    })
    .eq('id', claim.id);

  return { cid: upload.rootCid, tx_hash: txHash, eas_uid: easUid };
}
