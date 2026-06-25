'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/hooks/useJobs';
import { cn, statusLabel, statusColor, formatDate } from '@/lib/utils';
import { Plus, Search, MapPin, Users } from 'lucide-react';

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { data: jobs, isLoading } = useJobs({ search: search || undefined, status: status || undefined });

  const statusOptions = [
    { value: '', label: 'Todas' },
    { value: 'OPEN', label: 'Abertas' },
    { value: 'DRAFT', label: 'Rascunhos' },
    { value: 'PAUSED', label: 'Pausadas' },
    { value: 'CLOSED', label: 'Encerradas' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Vagas</h1>
            <p className="text-sm text-gray-500 mt-1">{jobs?.length ?? 0} vagas encontradas</p>
          </div>
          <Link href="/jobs/new">
            <Button><Plus size={16} /> Nova vaga</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vagas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={cn(
                  'px-3 py-2 rounded text-sm font-medium transition-colors',
                  status === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-surface-offset'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : jobs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-surface-offset flex items-center justify-center mb-4">
              <Search size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Nenhuma vaga encontrada.</p>
            <Link href="/jobs/new" className="mt-3">
              <Button variant="secondary" size="sm"><Plus size={14} /> Criar primeira vaga</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs?.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-medium text-gray-900 truncate">{job.title}</h2>
                        <Badge className={cn('shrink-0', statusColor(job.status))}>
                          {statusLabel(job.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {job.department && <span>{job.department}</span>}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {job.location}
                            {job.isRemote && ' · Remoto'}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
                      <Users size={15} />
                      <span className="font-medium text-gray-900">{job._count?.applications ?? 0}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
