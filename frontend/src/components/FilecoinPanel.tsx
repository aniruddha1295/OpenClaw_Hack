import { Copy, Database, Link as LinkIcon } from 'lucide-react'

interface FilecoinPanelProps {
  cid?: string | null
  pieceCid?: string | null
  datasetId?: string | null
  txHash?: string | null
  easUid?: string | null
}

function copyToClipboard(value: string) {
  if (!navigator?.clipboard) return
  navigator.clipboard.writeText(value)
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
      <span className="text-gray-500">{label}</span>
      {value ? (
        <span className="font-mono text-gray-700 truncate max-w-[170px]" title={value}>
          {value}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  )
}

export function FilecoinPanel({ cid, pieceCid, datasetId, txHash, easUid }: FilecoinPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />
          Filecoin Proofs
        </h2>
        {cid && (
          <button
            className="text-xs text-gray-500 inline-flex items-center gap-1"
            onClick={() => copyToClipboard(cid)}
          >
            <Copy className="w-3 h-3" />
            Copy CID
          </button>
        )}
      </div>

      <div className="space-y-2">
        <DataRow label="Root CID" value={cid || undefined} />
        <DataRow label="Piece CID" value={pieceCid || undefined} />
        <DataRow label="Dataset ID" value={datasetId || undefined} />
        <DataRow label="Attestation Tx" value={txHash || undefined} />
        <DataRow label="EAS UID" value={easUid || undefined} />
      </div>

      {txHash && (
        <a
          className="mt-3 inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
          href={`https://sepolia.basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
        >
          <LinkIcon className="w-3 h-3" />
          View on BaseScan
        </a>
      )}
    </div>
  )
}
