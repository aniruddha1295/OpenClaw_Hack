import { useState, useEffect } from 'react'
import { Headphones, Clock, Radio, PhoneOff } from 'lucide-react'
import { TranscriptViewer } from '../components/TranscriptViewer'
import { LogsPanel } from '../components/LogsPanel'
import { useRealtimeCalls } from '../hooks/useRealtimeCalls'
import { USE_MOCK, MOCK_LOGS } from '../config/mock'
import type { CallToolExecution, ToolLog } from '../types'

const mockTranscript = [
  { role: 'agent', message: 'Thank you for calling SafeGuard Insurance. My name is Alex, your AI assistant. How can I help you today?', timestamp: '0:00' },
  { role: 'user', message: 'Hi, I need to check on the status of my claim. The number is CLM-2026-000456.', timestamp: '0:05' },
  { role: 'agent', message: 'Of course! Let me look that up for you right away.', timestamp: '0:10' },
  { role: 'agent', message: 'I found your claim CLM-2026-000456. It is currently under review. The claimed amount is $8,500 for a collision incident on March 15th. An adjuster has been assigned and is reviewing your documentation.', timestamp: '0:15' },
  { role: 'user', message: 'Great, do I need to submit any additional documents?', timestamp: '0:25' },
  { role: 'agent', message: 'Let me check what documents have been received so far. Based on the records, we have received your police report and photos. We are still waiting for the repair estimate from your mechanic. Would you like me to send you a reminder with the details?', timestamp: '0:30' },
]

const mockToolExecutions: CallToolExecution[] = [
  {
    id: '1',
    call_log_id: 'call-1',
    tool_name: 'check_claim_status',
    tool_args: { claim_number: 'CLM-2026-000456' },
    tool_result: { status: 'under_review', claimed_amount: 8500, type: 'collision' },
    success: true,
    latency_ms: 120,
    executed_at: new Date().toISOString(),
  },
  {
    id: '2',
    call_log_id: 'call-1',
    tool_name: 'lookup_policy',
    tool_args: { customer_id: 'cust-1' },
    tool_result: { policy_number: 'POL-AUTO-001', coverage: 50000, deductible: 500 },
    success: true,
    latency_ms: 85,
    executed_at: new Date().toISOString(),
  },
]

export function LiveCallView() {
  const { toolExecutions: realtimeExecutions } = useRealtimeCalls()
  const [callActive, setCallActive] = useState(true)
  const [duration, setDuration] = useState(0)

  // Map CallToolExecution[] → ToolLog[]
  const mapToToolLog = (exec: CallToolExecution): ToolLog => ({
    id: exec.id,
    tool_name: exec.tool_name,
    parameters: exec.tool_args ?? {},
    result: exec.tool_result ?? {},
    status: exec.success ? 'success' : 'failed',
    timestamp: exec.executed_at,
    latency_ms: exec.latency_ms ?? 0,
  })

  const realtimeLogs: ToolLog[] = realtimeExecutions.map(mapToToolLog)
  const displayLogs: ToolLog[] =
    USE_MOCK && realtimeLogs.length === 0
      ? MOCK_LOGS
      : [...mockToolExecutions.map(mapToToolLog), ...realtimeLogs]

  useEffect(() => {
    if (!callActive) return
    const interval = setInterval(() => {
      setDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [callActive])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!callActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4">
          <Headphones className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Active Call</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-md">
          When a call is in progress, the live transcript and tool executions will appear here in real-time.
        </p>
        <button
          onClick={() => { setCallActive(true); setDuration(0) }}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Simulate Live Call
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Live Call</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-zinc-400">Inbound • +1-555-0101</span>
          <span className="text-sm text-gray-500 dark:text-zinc-400">James Wilson</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-zinc-400">
            <Clock className="w-4 h-4" />
            {formatDuration(duration)}
          </div>
          <button
            onClick={() => setCallActive(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            End
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Transcript — Left (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Live Transcript</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TranscriptViewer transcript={mockTranscript} />
          </div>
        </div>

        {/* Tool Logs — Right (1/3 width) */}
        <LogsPanel logs={displayLogs} streaming={callActive} />
      </div>
    </div>
  )
}
