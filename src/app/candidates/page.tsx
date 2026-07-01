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

export default function CandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  const headers = { Authorization: `Bearer ${token}` }

  function load(q = '') {
    axios.get(`/api/candidates?search=${q}`, { headers }).then(r => setCandidates(r.data))
  }

  useEffect(() => { if (!token) { router.push('/login'); return }; load() }, [])

  async function createCandidate(e: React.FormEvent) {
    e.preventDefault()
    await axios.post('/api/candidates', form, { headers })
    load(); setShowForm(false); setForm({ name: '', email: '', phone: '' })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Candidatos</h1>
          <button onClick={() => setShowForm(true)} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>+ Novo Candidato</button>
        </div>
        <input value={search} onChange={e => { setSearch(e.target.value); load(e.target.value) }}
          placeholder="Buscar por nome ou email..."
          style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }} />
        {showForm && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <form onSubmit={createCandidate}>
              {(['name', 'email', 'phone'] as const).map(f => (
                <div key={f} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.3rem', color: '#374151' }}>{f === 'name' ? 'Nome *' : f === 'email' ? 'Email *' : 'Telefone'}</label>
                  <input type={f === 'email' ? 'email' : 'text'} value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required={f !== 'phone'}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {candidates.map(c => (
            <div key={c.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{c.email} {c.phone ? `• ${c.phone}` : ''}</div>
              </div>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem' }}>{c._count.applications} aplicações</span>
            </div>
          ))}
          {candidates.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Nenhum candidato ainda.</p>}
        </div>
      </main>
    </div>
  )
}
