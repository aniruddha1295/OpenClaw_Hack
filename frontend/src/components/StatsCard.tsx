import { type LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

export function StatsCard({ title, value, icon: Icon, change, changeType = 'neutral' }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' : 'text-gray-500 dark:text-zinc-400'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <Icon className="w-6 h-6 text-red-600 dark:text-red-500" />
        </div>
      </div>
    </div>
  )
}
