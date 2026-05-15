import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { CallWidget } from './CallWidget'

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-[#0a0a0a]">
        <Outlet />
      </main>
      <CallWidget />
    </div>
  )
}
