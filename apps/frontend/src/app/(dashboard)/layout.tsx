'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, setAuth } = useAuthStore()

  useEffect(() => {
    const stored = localStorage.getItem('accessToken')
    if (stored && !token) {
      setAuth(null, stored)
    } else if (!stored && !token) {
      router.push('/login')
    }
  }, [token, router, setAuth])

  if (!token && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
