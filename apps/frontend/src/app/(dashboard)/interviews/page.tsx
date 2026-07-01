'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Calendar, Video, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function InterviewsPage() {
  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.get('/interviews').then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entrevistas</h1>
        <p className="text-gray-500 text-sm mt-1">{interviews.length} entrevistas agendadas</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma entrevista agendada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {interviews.map((iv: any) => (
            <div key={iv.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Video className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {iv.application?.candidate?.name}
                    </p>
                    <p className="text-xs text-gray-400">{iv.application?.job?.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {format(new Date(iv.scheduledAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 justify-end mt-0.5">
                    <Clock className="w-3 h-3" />
                    {iv.duration} min
                  </div>
                </div>
              </div>
              {iv.meetLink && (
                <a href={iv.meetLink} target="_blank" rel="noopener noreferrer"
                  className="mt-2 ml-11 inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                  Acessar reunião →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
