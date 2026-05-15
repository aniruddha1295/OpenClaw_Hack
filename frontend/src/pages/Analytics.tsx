import { useEffect, useState } from 'react'
import { Phone, FileText, Clock, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { StatsCard } from '../components/StatsCard'
import { getAnalytics } from '../lib/api'
import { useTheme } from '../contexts/ThemeContext'
import type { AnalyticsData } from '../types'

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899']

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
        <p className="text-red-700 dark:text-red-400">{error || 'No analytics data'}</p>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const claimsPieData = Object.entries(data.claims_by_status).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }))

  const directionData = [
    { name: 'Inbound', value: data.calls_by_direction.inbound },
    { name: 'Outbound', value: data.calls_by_direction.outbound },
    { name: 'WebRTC', value: data.calls_by_direction.webrtc },
  ]

  const gridStroke = theme === 'dark' ? '#27272a' : '#f0f0f0'
  const tooltipStyle = theme === 'dark'
    ? { borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: '#111111', color: '#ffffff' }
    : { borderRadius: '8px', border: '1px solid #e5e7eb' }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">AI agent performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Calls" value={data.total_calls} icon={Phone} />
        <StatsCard title="Total Claims" value={data.total_claims} icon={FileText} />
        <StatsCard title="Avg Duration" value={formatDuration(data.avg_duration_seconds)} icon={Clock} />
        <StatsCard title="Escalations" value={data.pending_escalations} icon={AlertTriangle} change={`${data.total_escalations} total`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calls Over Time */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
            Calls Over Time
          </h2>
          {data.calls_over_time.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.calls_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  fontSize={12}
                  tickLine={false}
                  stroke={theme === 'dark' ? '#52525b' : '#9ca3af'}
                />
                <YAxis fontSize={12} tickLine={false} stroke={theme === 'dark' ? '#52525b' : '#9ca3af'} />
                <Tooltip
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-12">No call data yet</p>
          )}
        </div>

        {/* Claims by Status */}
        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
            Claims by Status
          </h2>
          {claimsPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={claimsPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {claimsPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-12">No claims data yet</p>
          )}
        </div>
      </div>

      {/* Call Direction Breakdown */}
      <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Call Direction Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {directionData.map((item) => (
            <div key={item.name} className="text-center p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
