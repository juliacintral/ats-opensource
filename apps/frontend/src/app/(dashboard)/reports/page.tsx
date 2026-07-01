'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BarChart2 } from 'lucide-react'

export default function ReportsPage() {
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => api.get('/jobs').then(r => r.data) })
  const { data: candidates = [] } = useQuery({ queryKey: ['candidates'], queryFn: () => api.get('/candidates').then(r => r.data) })

  const byStatus = {
    OPEN: jobs.filter((j: any) => j.status === 'OPEN').length,
    DRAFT: jobs.filter((j: any) => j.status === 'DRAFT').length,
    CLOSED: jobs.filter((j: any) => j.status === 'CLOSED').length,
  }

  const totalApps = jobs.reduce((acc: number, j: any) => acc + (j._count?.applications || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-1">Métricas do recrutamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total de Vagas</p>
          <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs"><span className="text-green-600">Abertas</span><span className="font-medium">{byStatus.OPEN}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">Rascunho</span><span className="font-medium">{byStatus.DRAFT}</span></div>
            <div className="flex justify-between text-xs"><span className="text-red-500">Fechadas</span><span className="font-medium">{byStatus.CLOSED}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total de Candidatos</p>
          <p className="text-3xl font-bold text-gray-900">{candidates.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total de Candidaturas</p>
          <p className="text-3xl font-bold text-gray-900">{totalApps}</p>
          {jobs.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Média: {(totalApps / jobs.length).toFixed(1)} por vaga
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gray-500" />
          Candidaturas por Vaga
        </h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum dado disponível</p>
        ) : (
          <div className="space-y-3">
            {jobs.sort((a: any, b: any) => (b._count?.applications || 0) - (a._count?.applications || 0)).map((job: any) => {
              const count = job._count?.applications || 0
              const max = Math.max(...jobs.map((j: any) => j._count?.applications || 0), 1)
              return (
                <div key={job.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-4">{job.title}</span>
                    <span className="text-gray-500 flex-shrink-0">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
