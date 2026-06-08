'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    if (selectedTheme === 'system') {
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', selectedTheme === 'dark')
    }
  }

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
    setIsOpen(false)
  }

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5" />
    if (theme === 'light') return <Sun className="w-5 h-5" />
    return <Laptop className="w-5 h-5" />
  }

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark'
    if (theme === 'light') return 'Light'
    return 'System'
  }

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="w-5 h-5" />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
        aria-label="Theme selector"
      >
        <span className="text-gray-600 dark:text-gray-400">
          {getThemeIcon()}
        </span>
        <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:inline">
          {getThemeLabel()}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden dropdown-animation">
            <div className="p-2 space-y-1">
              <button
                onClick={() => setThemeMode('light')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  theme === 'light'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
                {theme === 'light' && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>

              <button
                onClick={() => setThemeMode('dark')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
                {theme === 'dark' && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>

              <button
                onClick={() => setThemeMode('system')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  theme === 'system'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>System</span>
                {theme === 'system' && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {theme === 'system' 
                  ? 'Using system preference' 
                  : `${theme} mode active`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}