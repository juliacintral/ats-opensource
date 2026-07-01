'use client'

import { useAuthStore } from '@/store/auth'
import { Bell } from 'lucide-react'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
