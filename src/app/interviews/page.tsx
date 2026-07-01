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
        {links.map(l => <Link key={l.href} href={l.href} style={{ display: 'block', padding: '0.6rem 0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{l.label}</Link>)}
      </nav>
      <button onClick={logout} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Sair</button>
    </aside>
  )
}

export default function InterviewsPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<any[]>([])
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    axios.get('/api/interviews', { headers: { Authorization: `Bearer ${token}` } }).then(r => setInterviews(r.data))
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Entrevistas</h1>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {interviews.map(i => (
            <div key={i.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{i.application.candidate.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.2rem' }}>{i.application.job.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>Com: {i.interviewer.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 }}>{i.type}</div>
                  <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.4rem' }}>{new Date(i.scheduledAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>
              {i.notes && <p style={{ margin: '0.75rem 0 0', color: '#64748b', fontSize: '0.875rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>{i.notes}</p>}
            </div>
          ))}
          {interviews.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Nenhuma entrevista agendada.</p>}
        </div>
      </main>
    </div>
  )
}
