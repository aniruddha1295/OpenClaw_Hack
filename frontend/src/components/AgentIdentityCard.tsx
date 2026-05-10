import { useEffect, useState } from 'react'
import { BadgeCheck } from 'lucide-react'
import { getAgentIdentity } from '../lib/api'
import type { AgentIdentity } from '../types'

export function AgentIdentityCard() {
  const [data, setData] = useState<AgentIdentity | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAgentIdentity()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || 'Failed to load agent identity'))
  }, [])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-gray-400" />
        Agent Identity
      </h2>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && !data && <p className="text-sm text-gray-500">Loading identity...</p>}

      {data && (
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Agent ID</dt>
            <dd className="font-medium text-gray-900">{data.agent_id}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Network</dt>
            <dd className="text-gray-700">{data.network || 'base-sepolia'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Owner</dt>
            <dd className="font-mono text-xs text-gray-700 truncate max-w-[140px]" title={data.owner_address || ''}>
              {data.owner_address || '—'}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-500">Claim Registry</dt>
            <dd className="font-mono text-xs text-gray-700 truncate max-w-[140px]" title={data.claim_registry_address || ''}>
              {data.claim_registry_address || '—'}
            </dd>
          </div>
        </dl>
      )}
    </div>
  )
}
