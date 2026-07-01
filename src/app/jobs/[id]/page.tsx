'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Stage {
  id: string
  name: string
  order: number
}

interface Application {
  id: string
  status: string
  aiScore: number | null
  candidate: { id: string; name: string; email: string }
  stage: Stage | null
}

interface Job {
  id: string
  title: string
  status: string
  description: string | null
  stages: Stage[]
  applications: Application[]
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [ranking, setRanking] = useState(false)

  function fetchJob() {
    fetch(`/api/jobs/${params.id}`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => { if (data) setJob(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJob() }, []) // eslint-disable-line

  async function moveApplication(appId: string, stageId: string) {
    await fetch(`/api/applications/${appId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ stageId }),
    })
    fetchJob()
  }

  async function rankCandidates() {
    setRanking(true)
    await fetch('/api/ai/rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ jobId: params.id }),
    })
    fetchJob()
    setRanking(false)
  }

  if (loading) return <div className="p-8 text-gray-500">Carregando...</div>
  if (!job) return <div className="p-8 text-red-500">Vaga não encontrada.</div>

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/jobs" className="text-sm text-teal-700 hover:underline">← Vagas</a>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{job.title}</h1>
        </div>
        <button
          onClick={rankCandidates}
          disabled={ranking}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-800 disabled:opacity-50"
        >
          {ranking ? 'Ranqueando...' : '✦ Ranquear com IA'}
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {job.stages.map(stage => {
          const apps = job.applications.filter(a => a.stage?.id === stage.id)
          return (
            <div key={stage.id} className="min-w-64 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700">{stage.name}</h3>
                <span className="text-xs text-gray-400">{apps.length}</span>
              </div>
              <div className="space-y-2">
                {apps.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-4">Vazio</p>
                )}
                {apps.map(app => (
                  <div key={app.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="font-medium text-sm text-gray-900">{app.candidate.name}</p>
                    <p className="text-xs text-gray-400">{app.candidate.email}</p>
                    {app.aiScore !== null && (
                      <p className="text-xs text-teal-600 mt-1">Score IA: {app.aiScore}</p>
                    )}
                    <select
                      value={app.stage?.id ?? ''}
                      onChange={e => moveApplication(app.id, e.target.value)}
                      className="mt-2 w-full text-xs border border-gray-200 rounded px-1 py-1"
                    >
                      {job.stages.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
