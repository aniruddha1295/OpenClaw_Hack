import type { EscrowStatus, ToolLog } from '../types'

// ═══════════════════════════════════════════════════════════
// PERSON 4 INTEGRATION: Change USE_MOCK to false when backend is live
export const USE_MOCK = true
// ═══════════════════════════════════════════════════════════

export const MOCK_EVIDENCE = {
  cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  piece_cid: 'baga6ea4seaqjtovkwk4myyzj56eztkh5pzsk5upksan6f5outesy62bsvl4ddza',
  proof_link: 'https://explore.synapse.storage/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  upload_status: 'uploaded' as const,
  dataset_id: 'dataset-mock-001',
  tx_hash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  eas_uid: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
}

export const MOCK_ESCROW = {
  escrow_uid: 'ESC-2026-MOCK-001',
  claim_amount: 8500,
  status: 'locked' as EscrowStatus,
  confirmation_link: 'https://calibration.filfox.info/en/tx/mock-tx-hash',
  policy_number: 'POL-AUTO-001',
  created_at: new Date().toISOString(),
}

export const MOCK_LOGS: ToolLog[] = [
  {
    id: '1',
    tool_name: 'check_claim_status',
    parameters: { claim_number: 'CLM-2026-000456' },
    result: { status: 'under_review', claimed_amount: 8500 },
    status: 'success',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    latency_ms: 120,
  },
  {
    id: '2',
    tool_name: 'upload_evidence',
    parameters: { conversation_id: 'sess-mock-001', transcript: 'Customer reported collision on March 15th.' },
    result: { cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', proof_link: 'https://explore.synapse.storage/...' },
    status: 'success',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    latency_ms: 2100,
  },
  {
    id: '3',
    tool_name: 'create_escrow',
    parameters: { policy_number: 'POL-AUTO-001', claim_amount: 8500, filecoin_cid: 'bafybeig...' },
    result: { escrow_uid: 'ESC-2026-MOCK-001', escrow_link: 'https://calibration.filfox.info/en/tx/mock' },
    status: 'success',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    latency_ms: 3500,
  },
]
