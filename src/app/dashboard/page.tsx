'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'

function Sidebar() {
  const router = useRouter()
  function logout() { localStorage.clear(); router.push('/login') }
  const links = [{ href: '/dashboard', label: '📊 Dashboard' }, { href: '/jobs', label: '💼 Vagas' }, { href: '/candidates', label: '👥 Candidatos' }, { href: '/interviews', label: '📅 Entrevistas' }]
  return (
    <aside style={{ width: '220px', background: '#0f172a', color: 'white', minHeight: '100vh', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem', padding: '0 0.5rem' }}>🎯 ATS</div>
      <nav style={{ flex: 1 }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{l.label}</Link>
        ))}
      </nav>
      <button onClick={logout} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Sair</button>
    </aside>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    axios.get('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStats(r.data))
      .catch(() => { localStorage.clear(); router.push('/login') })
  }, [])

  const cards = stats ? [
    { label: 'Vagas Abertas', value: stats.openJobs, color: '#0ea5e9' },
    { label: 'Total de Vagas', value: stats.totalJobs, color: '#8b5cf6' },
    { label: 'Candidatos', value: stats.totalCandidates, color: '#10b981' },
    { label: 'Candidaturas', value: stats.totalApplications, color: '#f59e0b' },
  ] : []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Dashboard</h1>
        {!stats ? <p style={{ color: '#64748b' }}>Carregando...</p> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {cards.map(c => (
                <div key={c.label} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{c.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#0f172a' }}>Vagas Recentes</h2>
              {stats.recentJobs.map((j: any) => (
                <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>{j.title}</span>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{j._count.applications} candidatos</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
