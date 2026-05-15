import { NavLink, Link } from 'react-router-dom'
import { FileText, Phone, BarChart3, Settings, Headphones, Database } from 'lucide-react'
import safeguardLogo from '../assets/safeguard.png'

const navItems = [
  { to: '/claims', icon: FileText, label: 'Claims' },
  { to: '/calls', icon: Phone, label: 'Call History' },
  { to: '/live', icon: Headphones, label: 'Live Call' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/blockchain', icon: Database, label: 'Blockchain' },
  { to: '/config', icon: Settings, label: 'Agent Config' },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-zinc-800 flex flex-col">
      <Link to="/">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <img src={safeguardLogo} alt="SafeGuard" className="w-6 h-6" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SafeGuard</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">Insurance AI Agent</p>
        </div>
      </Link>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
