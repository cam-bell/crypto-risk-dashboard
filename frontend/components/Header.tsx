'use client'

import { useState } from 'react'
import { Bell, Settings, User, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const [notifications] = useState(3)
  const { theme, setTheme } = useState('light')

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crypto Risk Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            
            {/* Settings */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Settings size={20} />
            </button>
            
            {/* User Menu */}
            <button className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <User size={20} />
              <span className="hidden md:block text-sm font-medium">User</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
