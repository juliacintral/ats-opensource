'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus, Search, Briefcase, Users, MapPin } from 'lucide-react'
import Link from 'next/link'
import { JobModal } from '@/components/jobs/job-modal'

export default function JobsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', search],
    queryFn: () => api.get('/jobs', { params: { search } }).then(r => r.data),
  })

  const createJob = useMutation({
    mutationFn: (data: any) => api.post('/jobs', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); setShowModal(false) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} vagas encontradas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Vaga
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vagas..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma vaga encontrada</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-primary-600 text-sm font-medium hover:underline">
            Criar primeira vaga
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job: any) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary-200 transition-all block">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  job.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                  job.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
                }`}>
                  {job.status === 'OPEN' ? 'Aberta' : job.status === 'DRAFT' ? 'Rascunho' : 'Fechada'}
                </span>
              </div>
              <div className="space-y-1.5 mb-4">
                {job.department && <p className="text-xs text-gray-400">{job.department}</p>}
                {job.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                <Users className="w-3.5 h-3.5" />
                {job._count?.applications || 0} candidatos
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <JobModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createJob.mutate(data)}
          loading={createJob.isPending}
        />
      )}
    </div>
  )
}
