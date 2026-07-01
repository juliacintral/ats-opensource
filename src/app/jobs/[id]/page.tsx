'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

function Sidebar() {
  const router = useRouter()
  function logout() { localStorage.clear(); router.push('/login') }
  const links = [{ href: '/dashboard', label: '📊 Dashboard' }, { href: '/jobs', label: '💼 Vagas' }, { href: '/candidates', label: '👥 Candidatos' }, { href: '/interviews', label: '📅 Entrevistas' }]
  return (
    <aside style={{ width: '220px', background: '#0f172a', color: 'white', minHeight: '100vh', padding: '1.5rem 1rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem', padding: '0 0.5rem' }}>🎯 ATS</div>
      <nav style={{ flex: 1 }}>
        {links.map(l => <Link key={l.href} href={l.href} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{l.label}</Link>)}
      </nav>
      <button onClick={logout} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Sair</button>
    </aside>
  )
}

export default function JobPipelinePage() {
  const router = useRouter()
  const { id } = useParams()
  const [job, setJob] = useState<any>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    axios.get(`/api/jobs/${id}`, { headers }).then(r => setJob(r.data))
  }, [id])

  async function moveCandidate(appId: string, stageId: string) {
    await axios.patch(`/api/applications/${appId}/stage`, { stageId }, { headers })
    const { data } = await axios.get(`/api/jobs/${id}`, { headers })
    setJob(data)
  }

  if (!job) return <div style={{ padding: '2rem', color: '#64748b' }}>Carregando...</div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/jobs" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>← Voltar</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0 0' }}>{job.title}</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>{job.department} • {job.location}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {job.stages.map((stage: any) => (
            <div key={stage.id} style={{ minWidth: '240px', background: '#f1f5f9', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                {stage.name} <span style={{ background: '#e2e8f0', borderRadius: '999px', padding: '0 0.5rem', fontSize: '0.8rem' }}>{stage.applications.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stage.applications.map((app: any) => (
                  <div key={app.id} style={{ background: 'white', borderRadius: '8px', padding: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{app.candidate.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>{app.candidate.email}</div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {job.stages.filter((s: any) => s.id !== stage.id).map((s: any) => (
                        <button key={s.id} onClick={() => moveCandidate(app.id, s.id)}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                          → {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stage.applications.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>Vazio</p>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
