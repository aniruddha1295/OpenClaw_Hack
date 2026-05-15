import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Phone, Shield, Calendar, DollarSign, User } from 'lucide-react'
import { getClaim } from '../lib/api'
import { ClaimStatusBadge } from '../components/ClaimStatusBadge'
import { IntegrityCheckButton } from '../components/IntegrityCheckButton'
import { FilecoinPanel } from '../components/FilecoinPanel'
import { EscrowPanel } from '../components/EscrowPanel'
import { useEvidence } from '../hooks/useEvidence'
import { USE_MOCK } from '../config/mock'
import type { ClaimDetail as ClaimDetailType } from '../types'

export function ClaimDetail() {
  const { id } = useParams<{ id: string }>()
  const [claim, setClaim] = useState<ClaimDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { evidence } = useEvidence(id)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getClaim(id)
      .then((res) => setClaim(res.data))
      .catch((err) => setError(err.message || 'Failed to load claim'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{error || 'Claim not found'}</p>
        <Link to="/" className="text-red-600 hover:underline text-sm mt-2 inline-block">
          Back to claims
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Claims
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{claim.claim_number}</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Filed {new Date(claim.filed_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <IntegrityCheckButton claimId={claim.id} />
          <ClaimStatusBadge status={claim.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              Claim Details
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500 dark:text-zinc-400">Type</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white capitalize">{claim.claim_type.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-zinc-400">Customer</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  {claim.customer_name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-zinc-400">Incident Date</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  {new Date(claim.incident_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-zinc-400">Adjuster</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">{claim.assigned_adjuster || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-zinc-400">Claimed Amount</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  {claim.claimed_amount ? `$${claim.claimed_amount.toLocaleString()}` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-zinc-400">Approved Amount</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {claim.approved_amount ? `$${claim.approved_amount.toLocaleString()}` : 'Pending'}
                </dd>
              </div>
            </dl>
            {claim.incident_description && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-900">
                <dt className="text-sm text-gray-500 dark:text-zinc-400 mb-1">Incident Description</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">{claim.incident_description}</dd>
              </div>
            )}
            {claim.notes && (
              <div className="mt-3">
                <dt className="text-sm text-gray-500 dark:text-zinc-400 mb-1">Notes</dt>
                <dd className="text-sm text-gray-700 dark:text-zinc-300">{claim.notes}</dd>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-2">Required</h3>
                {claim.documents_required && claim.documents_required.length > 0 ? (
                  <ul className="space-y-1">
                    {claim.documents_required.map((doc, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-600" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-zinc-600">None specified</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-2">Received</h3>
                {claim.documents_received && claim.documents_received.length > 0 ? (
                  <ul className="space-y-1">
                    {claim.documents_received.map((doc, i) => (
                      <li key={i} className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-zinc-600">None received</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Policy + Call Logs */}
        <div className="space-y-6">
          <FilecoinPanel
            cid={USE_MOCK && !claim.filecoin_cid ? evidence?.cid : claim.filecoin_cid}
            pieceCid={USE_MOCK && !claim.piece_cid ? evidence?.piece_cid : claim.piece_cid}
            datasetId={USE_MOCK && !claim.dataset_id ? evidence?.dataset_id : claim.dataset_id}
            txHash={USE_MOCK && !claim.attestation_tx_hash ? evidence?.tx_hash : claim.attestation_tx_hash}
            easUid={USE_MOCK && !claim.eas_uid ? evidence?.eas_uid : claim.eas_uid}
          />
          <EscrowPanel claimId={claim.id} />
          {claim.policy && (
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                Policy
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500 dark:text-zinc-400">Policy Number</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">{claim.policy.policy_number}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 dark:text-zinc-400">Type</dt>
                  <dd className="text-sm text-gray-900 dark:text-white capitalize">{claim.policy.policy_type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 dark:text-zinc-400">Provider</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{claim.policy.provider}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 dark:text-zinc-400">Coverage</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white">${claim.policy.coverage_amount.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 dark:text-zinc-400">Deductible</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">${claim.policy.deductible.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
              Related Calls
            </h2>
            {claim.call_logs.length > 0 ? (
              <div className="space-y-3">
                {claim.call_logs.map((call) => (
                  <div key={call.id} className="border border-gray-100 dark:border-zinc-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 capitalize">{call.direction}</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-600">
                        {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}` : '—'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-zinc-300">{call.summary || 'No summary'}</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">{new Date(call.started_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-zinc-600">No calls associated</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
