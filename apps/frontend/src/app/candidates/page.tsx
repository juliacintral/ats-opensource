'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Brain, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const [search, setSearch] = useState('');

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', search],
    queryFn: async () => {
      const { data } = await api.get('/candidates', { params: search ? { search } : {} });
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Candidatos</h1>
            <p className="text-sm text-gray-500 mt-1">{candidates?.length ?? 0} candidatos</p>
          </div>
          <Link href="/candidates/new">
            <Button><Plus size={16} /> Novo candidato</Button>
          </Link>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou currículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : candidates?.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-gray-500">Nenhum candidato encontrado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {candidates?.map((c: any) => (
              <Link key={c.id} href={`/candidates/${c.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.aiSummary && (
                          <Badge variant="default" className="text-primary border-primary-highlight bg-primary-highlight">
                            <Brain size={10} className="mr-1" /> IA
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-sm text-gray-400">
                      {c.source && <Badge>{c.source}</Badge>}
                      <span>{formatDate(c.createdAt)}</span>
                      <ExternalLink size={15} />
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
