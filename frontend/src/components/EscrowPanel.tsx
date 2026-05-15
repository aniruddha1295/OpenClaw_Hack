import { useState } from 'react'
import {
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react'
import { useEscrow } from '../hooks/useEscrow'

interface EscrowPanelProps {
  claimId?: string
}

function StatusBadge({ status }: { status: 'pending' | 'locked' | 'released' }) {
  if (status === 'released') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <Unlock className="w-3 h-3" />
        Released
      </span>
    )
  }
  if (status === 'locked') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
        <Lock className="w-3 h-3" />
        Locked
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  )
}

function copyToClipboard(value: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(value)
  }
}

export function EscrowPanel({ claimId }: EscrowPanelProps) {
  const { escrow, loading, error, releasing, simulateRelease } = useEscrow(claimId)
  const [copied, setCopied] = useState(false)

  const handleCopy = (value: string) => {
    copyToClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Failed to load escrow data</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!escrow) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Escrow</h2>
        </div>
        <p className="text-sm text-gray-400 italic">No escrow record found for this claim.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-500" />
          Escrow
        </h2>
        <StatusBadge status={escrow.status} />
      </div>

      {/* Released success banner */}
      {escrow.status === 'released' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            Escrow funds have been released successfully.
          </p>
        </div>
      )}

      {/* Data rows */}
      <div className="space-y-0">
        {/* Escrow UID */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
          <span className="text-gray-500 shrink-0">Escrow ID</span>
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-mono text-gray-700 truncate max-w-[160px]" title={escrow.escrow_uid}>
              {escrow.escrow_uid}
            </span>
            <button
              onClick={() => handleCopy(escrow.escrow_uid)}
              className="text-gray-400 hover:text-gray-600 shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Claim Amount */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
          <span className="text-gray-500">Claim Amount</span>
          <span className="font-semibold text-gray-800 text-sm">
            {formatCurrency(escrow.claim_amount)}
          </span>
        </div>

        {/* Policy */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
          <span className="text-gray-500">Policy</span>
          <span className="font-mono text-gray-700">{escrow.policy_number}</span>
        </div>

        {/* Confirmation Link */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
          <span className="text-gray-500 shrink-0">Confirmation</span>
          <a
            href={escrow.confirmation_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline min-w-0"
          >
            <span className="truncate max-w-[140px]">View on Filfox</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Created At */}
        <div className="flex items-center justify-between text-xs py-2">
          <span className="text-gray-500">Created</span>
          <span className="text-gray-600">
            {new Date(escrow.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Simulate Release button */}
      {escrow.status === 'locked' && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={simulateRelease}
            disabled={releasing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {releasing ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Releasing…
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Simulate Release
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
