import { useState, useEffect, useRef } from 'react'
import { Terminal, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import type { ToolLog } from '../types'

interface LogsPanelProps {
  logs: ToolLog[]
  streaming?: boolean
}

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function LogEntry({ log }: { log: ToolLog }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-mono text-xs font-semibold text-gray-800 truncate">
            {log.tool_name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs text-gray-400">{log.latency_ms}ms</span>
          <span className="text-xs text-gray-400">{relativeTime(log.timestamp)}</span>
          <span
            className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full ${
              log.status === 'success'
                ? 'text-green-700 bg-green-50'
                : 'text-red-700 bg-red-50'
            }`}
          >
            {log.status}
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded JSON */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Parameters</p>
            <pre className="text-xs text-gray-700 bg-white border border-gray-100 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(log.parameters, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Result</p>
            <pre className="text-xs text-gray-700 bg-white border border-gray-100 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(log.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export function LogsPanel({ logs, streaming = false }: LogsPanelProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to newest when streaming
  useEffect(() => {
    if (streaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs.length, streaming])

  const filtered = logs.filter((log) => {
    const matchesSearch =
      search === '' || log.tool_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-500" />
          Tool Logs
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{logs.length} tools called</p>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by tool name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-gray-50"
          />
        </div>
        <div className="relative flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | 'success' | 'failed')
            }
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Terminal className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No logs match your filter</p>
          </div>
        ) : (
          filtered.map((log) => <LogEntry key={log.id} log={log} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
