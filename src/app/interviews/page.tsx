'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Interview {
  id: string
  scheduledAt: string
  meetUrl: string | null
  application: {
    candidate: { name: string }
    job: { title: string }
  }
  interviewer: { name: string }
}

export default function InterviewsPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/interviews', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        if (!r.ok) return []
        return r.json()
      })
      .then(data => { if (data) setInterviews(data) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Entrevistas</h1>
        <a href="/dashboard" className="text-sm text-teal-700 hover:underline">← Dashboard</a>
      </div>

      {interviews.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma entrevista agendada.</p>
      ) : (
        <div className="space-y-3">
          {interviews.map(iv => (
            <div key={iv.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{iv.application.candidate.name}</p>
                  <p className="text-sm text-gray-500">{iv.application.job.title} · Entrevistador: {iv.interviewer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(iv.scheduledAt).toLocaleString('pt-BR')}
                  </p>
                  {iv.meetUrl && (
                    <a
                      href={iv.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-700 hover:underline"
                    >
                      Entrar na reunião →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
