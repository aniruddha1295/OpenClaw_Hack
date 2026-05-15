import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ChevronLeft, ChevronRight, Database } from 'lucide-react'
import { getClaims } from '../lib/api'
import { ClaimStatusBadge } from '../components/ClaimStatusBadge'
import type { Claim } from '../types'

const STATUSES = ['', 'submitted', 'under_review', 'documents_needed', 'approved', 'denied', 'paid', 'closed']

export function ClaimsList() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    const filter = statusFilter ? { status: statusFilter } : undefined
    getClaims(filter, page, limit)
      .then((res) => {
        setClaims(res.data)
        setTotal(res.total)
      })
      .catch((err) => setError(err.message || 'Failed to load claims'))
      .finally(() => setLoading(false))
  }, [statusFilter, page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Claims</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage and track insurance claims</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setPage(1)} className="text-red-600 hover:underline text-sm mt-2">Retry</button>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-zinc-400">No claims found</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Claim #</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Filecoin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => navigate(`/claims/${claim.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                        <span className="text-sm font-medium text-red-600">{claim.claim_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{claim.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-400 capitalize">{claim.claim_type.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {claim.claimed_amount ? `$${claim.claimed_amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-zinc-400">{new Date(claim.incident_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><ClaimStatusBadge status={claim.status} /></td>
                    <td className="px-6 py-4">
                      {(claim as any).filecoin_cid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                          <Database className="w-3 h-3" /> Stored
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-zinc-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-zinc-400">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-zinc-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
