'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Plus, Search, Users, Mail, Phone } from 'lucide-react'
import { CandidateModal } from '@/components/candidates/candidate-modal'

export default function CandidatesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates', search],
    queryFn: () => api.get('/candidates', { params: { search } }).then(r => r.data),
  })

  const createCandidate = useMutation({
    mutationFn: (data: any) => api.post('/candidates', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidates'] }); setShowModal(false) },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-500 text-sm mt-1">{candidates.length} candidatos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Candidato
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar candidatos..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum candidato encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {candidates.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Mail className="w-3 h-3" />{c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Phone className="w-3 h-3" />{c.phone}
                    </span>
                  )}
                </div>
              </div>
              {c.skills?.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5">
                  {c.skills.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs text-gray-400">
                {c._count?.applications || 0} candidaturas
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CandidateModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createCandidate.mutate(data)}
          loading={createCandidate.isPending}
        />
      )}
    </div>
  )
}
