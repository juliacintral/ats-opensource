'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { ArrowLeft, Brain, FileText, Linkedin, Github, Phone, MapPin, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [rankingJobId, setRankingJobId] = useState('');

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidates', id],
    queryFn: () => api.get(`/candidates/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: applications } = useQuery({
    queryKey: ['applications', 'candidate', id],
    queryFn: () => api.get(`/applications/candidate/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/jobs', { params: { status: 'OPEN' } }).then((r) => r.data),
  });

  const rankMutation = useMutation({
    mutationFn: ({ cid, jid }: { cid: string; jid: string }) =>
      api.post(`/candidates/${cid}/rank/${jid}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidates', id] }),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-3xl">
          <div className="h-8 w-64 bg-gray-100 animate-pulse rounded" />
          <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  if (!candidate) return null;

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <Link href="/candidates" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={15} /> Voltar para candidatos
          </Link>
        </div>

        {/* Header */}
        <Card>
          <CardContent className="flex items-start gap-5 py-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
              {candidate.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">{candidate.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                <span>{candidate.email}</span>
                {candidate.phone && <span className="flex items-center gap-1"><Phone size={13} />{candidate.phone}</span>}
                {candidate.location && <span className="flex items-center gap-1"><MapPin size={13} />{candidate.location}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {candidate.linkedinUrl && (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
                {candidate.githubUrl && (
                  <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-600 hover:underline">
                    <Github size={13} /> GitHub
                  </a>
                )}
                {candidate.resumeUrl && (
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-600 hover:underline">
                    <FileText size={13} /> Currículo
                  </a>
                )}
              </div>
            </div>
            {candidate.source && <Badge>{candidate.source}</Badge>}
          </CardContent>
        </Card>

        {/* AI Summary */}
        {candidate.aiSummary && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-primary" />
                <p className="text-sm font-semibold text-gray-700">Resumo gerado por IA</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">{candidate.aiSummary}</p>
              {candidate.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {candidate.skills.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-primary-highlight text-primary text-xs font-medium">{s}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Ranking */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-primary" />
              <p className="text-sm font-semibold text-gray-700">Ranking de aderência à vaga</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <select
                className="flex-1 rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={rankingJobId}
                onChange={(e) => setRankingJobId(e.target.value)}
              >
                <option value="">Selecione uma vaga…</option>
                {jobs?.map((j: any) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
              <Button
                size="sm"
                disabled={!rankingJobId}
                loading={rankMutation.isPending}
                onClick={() => rankMutation.mutate({ cid: id, jid: rankingJobId })}
              >
                <Brain size={14} /> Calcular score
              </Button>
            </div>
            {rankMutation.data && (
              <div className="mt-4 p-4 rounded-lg bg-surface border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl font-bold text-primary">{rankMutation.data.aiScore ?? rankMutation.data.score}</div>
                  <div className="text-sm text-gray-500">/100</div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${rankMutation.data.aiScore ?? rankMutation.data.score}%` }}
                  />
                </div>
                {rankMutation.data.justification && (
                  <p className="text-sm text-gray-600">{rankMutation.data.justification}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications */}
        {applications?.length > 0 && (
          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">Candidaturas</p></CardHeader>
            <CardContent className="divide-y divide-gray-50">
              {applications.map((app: any) => (
                <Link key={app.id} href={`/applications/${app.id}`} className="flex items-center justify-between py-3 hover:bg-surface -mx-6 px-6 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.job?.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(app.appliedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.aiScore != null && (
                      <span className="text-xs font-semibold text-primary bg-primary-highlight rounded-full px-2 py-0.5">{app.aiScore}</span>
                    )}
                    <Badge className={cn(statusColor(app.status))}>{statusLabel(app.status)}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Parsed resume data */}
        {candidate.parsedData && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">Dados extraídos do currículo</p>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-600 bg-surface rounded p-3 overflow-auto max-h-64">
                {JSON.stringify(candidate.parsedData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
