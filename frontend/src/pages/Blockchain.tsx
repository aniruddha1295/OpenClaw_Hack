import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Database, CheckCircle2, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ClaimFilecoinRow {
  id: string
  claim_number: string
  claim_type: string
  status: string
  filecoin_cid: string | null
  piece_cid: string | null
  attestation_tx_hash: string | null
  eas_uid: string | null
  attested_at: string | null
  filed_at: string
  customers: { full_name: string } | null
}

function truncate(s: string | null | undefined, n = 14): string {
  if (!s) return '—'
  return s.length > n ? s.slice(0, n) + '…' : s
}

export function Blockchain() {
  const [claims, setClaims] = useState<ClaimFilecoinRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('claims')
      .select('id, claim_number, claim_type, status, filecoin_cid, piece_cid, attestation_tx_hash, eas_uid, attested_at, filed_at, customers(full_name)')
      .order('filed_at', { ascending: false })
      .limit(50)

    if (err) {
      setError(err.message)
    } else {
      setClaims((data ?? []) as unknown as ClaimFilecoinRow[])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const stored = claims.filter(c => c.filecoin_cid).length
  const attested = claims.filter(c => c.attestation_tx_hash).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            Blockchain & Filecoin
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">On-chain attestations and decentralized storage proofs</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Total Claims</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{claims.length}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] rounded-xl border-2 border-green-100 dark:border-green-900 p-5">
          <p className="text-sm text-green-600">Stored on Filecoin</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-1">{stored}</p>
        </div>
        <div className="bg-white dark:bg-[#111111] rounded-xl border-2 border-blue-100 dark:border-blue-900 p-5">
          <p className="text-sm text-blue-600">On-Chain Attested</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">{attested}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Claim</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Filecoin CID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Attestation Tx</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Attested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/claims/${claim.id}`}
                      className="text-red-600 hover:underline font-medium"
                    >
                      {claim.claim_number}
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-zinc-600 capitalize">{claim.claim_type.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                    {(claim.customers as any)?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {claim.filecoin_cid ? (
                      <a
                        href={`https://ipfs.io/ipfs/${claim.filecoin_cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-mono text-xs hover:underline"
                        title={claim.filecoin_cid}
                      >
                        {truncate(claim.filecoin_cid, 18)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {claim.attestation_tx_hash ? (
                      <a
                        href={`https://sepolia.basescan.org/tx/${claim.attestation_tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono text-xs hover:underline"
                        title={claim.attestation_tx_hash}
                      >
                        {truncate(claim.attestation_tx_hash, 18)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {claim.filecoin_cid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Stored
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-zinc-400">
                    {claim.attested_at ? new Date(claim.attested_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instructions box */}
      <div className="mt-6 bg-blue-50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-white mb-2">How Filecoin storage is triggered</h3>
        <ol className="text-sm text-blue-800 dark:text-zinc-300 space-y-1 list-decimal list-inside">
          <li>A customer makes a call using the ElevenLabs widget (bottom-right corner)</li>
          <li>The AI agent files a claim using the <code className="bg-blue-100 dark:bg-zinc-800 px-1 rounded">file_claim</code> tool</li>
          <li>When the call ends, the backend automatically uploads the evidence bundle to Filecoin</li>
          <li>The Filecoin CID is attested on Base Sepolia via the <code className="bg-blue-100 dark:bg-zinc-800 px-1 rounded">ClaimRegistry</code> contract</li>
          <li>This page and the Claim Detail page update with the CID and transaction hash</li>
        </ol>
      </div>
    </div>
  )
}
