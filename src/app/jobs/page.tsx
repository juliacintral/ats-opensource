'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  status: string
  location: string | null
  _count: { applications: number }
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  function fetchJobs() {
    fetch('/api/jobs', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => { if (data) setJobs(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, []) // eslint-disable-line

  async function createJob() {
    if (!title.trim()) return
    setCreating(true)
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title }),
    })
    setTitle('')
    fetchJobs()
    setCreating(false)
  }

  if (loading) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
        <a href="/dashboard" className="text-sm text-teal-700 hover:underline">← Dashboard</a>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título da vaga"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          onKeyDown={e => e.key === 'Enter' && createJob()}
        />
        <button
          onClick={createJob}
          disabled={creating}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-800 disabled:opacity-50"
        >
          {creating ? '...' : 'Nova vaga'}
        </button>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 && <p className="text-gray-400 text-sm">Nenhuma vaga criada ainda.</p>}
        {jobs.map(job => (
          <a
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-400 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{job.title}</p>
                {job.location && <p className="text-sm text-gray-500">{job.location}</p>}
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                  job.status === 'DRAFT' ? 'bg-gray-100 text-gray-500' :
                  'bg-red-100 text-red-600'
                }`}>{job.status}</span>
                <p className="text-xs text-gray-400 mt-1">{job._count.applications} candidatura(s)</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
