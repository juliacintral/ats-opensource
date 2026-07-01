'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  name: string
  email: string
  phone: string | null
  _count: { applications: number }
}

export default function CandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [creating, setCreating] = useState(false)

  function fetchCandidates(q = '') {
    fetch(`/api/candidates${q ? `?q=${encodeURIComponent(q)}` : ''}`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => { if (data) setCandidates(data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCandidates() }, []) // eslint-disable-line

  async function createCandidate() {
    if (!form.name || !form.email) return
    setCreating(true)
    await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
    setForm({ name: '', email: '', phone: '' })
    fetchCandidates()
    setCreating(false)
  }

  if (loading) return <div className="p-8 text-gray-500">Carregando...</div>

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
        <a href="/dashboard" className="text-sm text-teal-700 hover:underline">← Dashboard</a>
      </div>

      {/* Busca */}
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); fetchCandidates(e.target.value) }}
        placeholder="Buscar por nome ou e-mail..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-teal-600"
      />

      {/* Formulário */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-3 gap-3">
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Nome *"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="E-mail *"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
        <div className="flex gap-2">
          <input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="Telefone"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button
            onClick={createCandidate}
            disabled={creating}
            className="bg-teal-700 text-white px-4 rounded-lg text-sm hover:bg-teal-800 disabled:opacity-50"
          >
            {creating ? '...' : 'Adicionar'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {candidates.length === 0 && <p className="text-gray-400 text-sm">Nenhum candidato encontrado.</p>}
        {candidates.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-sm text-gray-500">{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
            </div>
            <span className="text-xs text-gray-400">{c._count.applications} candidatura(s)</span>
          </div>
        ))}
      </div>
    </main>
  )
}
