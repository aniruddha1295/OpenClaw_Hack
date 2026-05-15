import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`fixed top-4 right-4 z-[9999] w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
        theme === 'dark'
          ? 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
          : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400 shadow-sm'
      }`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
