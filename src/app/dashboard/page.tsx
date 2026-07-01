'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  totalJobs: number
  openJobs: number
  totalCandidates: number
  totalApplications: number
  recentApplications: Array<{
    id: string
    candidate: { name: string }
    job: { title: string }
    stage: { name: string } | null
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => { if (data) setStats(data) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <nav className="flex gap-4 text-sm">
          <a href="/jobs" className="text-teal-700 hover:underline">Vagas</a>
          <a href="/candidates" className="text-teal-700 hover:underline">Candidatos</a>
          <a href="/interviews" className="text-teal-700 hover:underline">Entrevistas</a>
        </nav>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de vagas', value: stats?.totalJobs ?? 0 },
          { label: 'Vagas abertas', value: stats?.openJobs ?? 0 },
          { label: 'Candidatos', value: stats?.totalCandidates ?? 0 },
          { label: 'Candidaturas', value: stats?.totalApplications ?? 0 },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-3xl font-bold text-teal-700">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Candidaturas recentes</h2>
        {!stats?.recentApplications?.length ? (
          <p className="text-gray-400 text-sm">Nenhuma candidatura ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Candidato</th>
                <th className="pb-2">Vaga</th>
                <th className="pb-2">Etapa</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentApplications.map(app => (
                <tr key={app.id} className="border-b last:border-0">
                  <td className="py-2">{app.candidate.name}</td>
                  <td className="py-2">{app.job.title}</td>
                  <td className="py-2">{app.stage?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
