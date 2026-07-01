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

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', department: '', location: '', description: '' })
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    axios.get('/api/jobs', { headers }).then(r => setJobs(r.data))
  }, [])

  async function createJob(e: React.FormEvent) {
    e.preventDefault()
    const { data } = await axios.post('/api/jobs', form, { headers })
    setJobs([data, ...jobs])
    setShowForm(false)
    setForm({ title: '', department: '', location: '', description: '' })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Vagas</h1>
          <button onClick={() => setShowForm(true)} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>+ Nova Vaga</button>
        </div>
        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Nova Vaga</h2>
            <form onSubmit={createJob}>
              {(['title', 'department', 'location'] as const).map(f => (
                <div key={f} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.3rem', color: '#374151' }}>{f === 'title' ? 'Título *' : f === 'department' ? 'Departamento' : 'Local'}</label>
                  <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required={f === 'title'}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' }} />
                </div>
              ))}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.3rem', color: '#374151' }}>Descrição</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>Criar Vaga</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobs.map(j => (
            <div key={j.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{j.title}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>{j.department} {j.location ? `• ${j.location}` : ''} • {j._count.applications} candidatos</div>
              </div>
              <Link href={`/jobs/${j.id}`} style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Ver Pipeline →</Link>
            </div>
          ))}
          {jobs.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Nenhuma vaga criada ainda.</p>}
        </div>
      </main>
    </div>
  )
}
