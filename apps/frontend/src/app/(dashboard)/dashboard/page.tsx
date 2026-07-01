'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Briefcase, Users, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => api.get('/jobs').then(r => r.data) })
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: () => api.get('/candidates').then(r => r.data) })

  const openJobs = jobs.filter((j: any) => j.status === 'OPEN').length
  const totalApplications = jobs.reduce((acc: number, j: any) => acc + (j._count?.applications || 0), 0)

  const stats = [
    { label: 'Vagas Abertas', value: openJobs, icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Candidatos', value: candidates.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Candidaturas', value: totalApplications, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Vagas', value: jobs.length, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do recrutamento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Vagas Recentes</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhuma vaga criada ainda</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.department} · {job.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    job.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                    job.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                  }`}>
                    {job.status === 'OPEN' ? 'Aberta' : job.status === 'DRAFT' ? 'Rascunho' : 'Fechada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Candidatos Recentes</h2>
          {candidates.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum candidato cadastrado</p>
          ) : (
            <div className="space-y-3">
              {candidates.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
