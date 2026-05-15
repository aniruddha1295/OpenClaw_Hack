import { useState, useEffect } from 'react'
import { USE_MOCK, MOCK_EVIDENCE } from '../config/mock'
import type { EvidenceData } from '../types'

// PERSON 4: When USE_MOCK=false, this hook calls GET /api/evidence?claim_id=<id>
// The endpoint must return: { cid, piece_cid, proof_link, upload_status, dataset_id, tx_hash, eas_uid }

export function useEvidence(claimId?: string) {
  const [evidence, setEvidence] = useState<EvidenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (USE_MOCK) {
      setEvidence(MOCK_EVIDENCE)
      setLoading(false)
      return
    }

    // PERSON 4: Real fetch below — runs only when USE_MOCK=false
    if (!claimId) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/evidence?claim_id=${claimId}`
    )
      .then((r) => r.json())
      .then((json) => {
        setEvidence(json.data)
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message)
        setLoading(false)
      })
  }, [claimId])

  return { evidence, loading, error }
}
