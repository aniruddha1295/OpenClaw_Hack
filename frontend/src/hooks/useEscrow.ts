import { useState } from 'react'
import { USE_MOCK, MOCK_ESCROW } from '../config/mock'
import type { EscrowData, EscrowStatus } from '../types'

// PERSON 4: When USE_MOCK=false, fetch from GET /api/escrows?claim_id=<id>
// Response must match EscrowData shape

export function useEscrow(_claimId?: string) {
  const [escrow, setEscrow] = useState<EscrowData | null>(
    USE_MOCK ? { ...MOCK_ESCROW } : null
  )
  const [loading, _setLoading] = useState(!USE_MOCK)
  const [error, setError] = useState<string | null>(null)
  const [releasing, setReleasing] = useState(false)

  const simulateRelease = async () => {
    if (USE_MOCK) {
      setReleasing(true)
      await new Promise<void>((r) => setTimeout(r, 1200))
      setEscrow((prev) =>
        prev ? { ...prev, status: 'released' as EscrowStatus } : prev
      )
      setReleasing(false)
      return
    }

    // PERSON 4: Real release — POST /api/escrows/:escrow_uid/release
    if (!escrow?.escrow_uid) return
    setReleasing(true)
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/escrows/${escrow.escrow_uid}/release`,
        { method: 'POST' }
      )
      setEscrow((prev) =>
        prev ? { ...prev, status: 'released' as EscrowStatus } : prev
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setReleasing(false)
    }
  }

  return { escrow, loading, error, releasing, simulateRelease }
}
