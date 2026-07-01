'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/pipeline/kanban-board'
import { ArrowLeft, Users, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => r.data),
  })

  const moveApp = useMutation({
    mutationFn: ({ appId, stageId }: { appId: string; stageId: string }) =>
      api.put(`/applications/${appId}/stage`, { stageId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }),
  })

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
  if (!job) return <div className="text-center py-16 text-gray-500">Vaga não encontrada</div>

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {job.department && <span>{job.department}</span>}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />{job.applications?.length || 0} candidatos
            </span>
          </div>
        </div>
      </div>

      <KanbanBoard
        stages={job.stages || []}
        applications={job.applications || []}
        onMove={(appId, stageId) => moveApp.mutate({ appId, stageId })}
      />
    </div>
  )
}
