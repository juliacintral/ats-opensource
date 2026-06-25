'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime, statusLabel, statusColor, cn } from '@/lib/utils';
import { ArrowLeft, MessageSquare, Star, Calendar, Brain } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn('text-xl transition-colors', n <= value ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200')}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [rating, setRating] = useState(3);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const { register, handleSubmit, reset } = useForm<any>();

  const { data: app, isLoading } = useQuery({
    queryKey: ['applications', id],
    queryFn: () => api.get(`/applications/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const submitFeedback = useMutation({
    mutationFn: (data: any) =>
      api.post(`/applications/${id}/feedbacks`, { ...data, rating }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications', id] });
      reset();
      setRating(3);
      setShowFeedbackForm(false);
    },
  });

  if (isLoading) {
    return <AppLayout><div className="h-40 bg-gray-100 animate-pulse rounded-lg" /></AppLayout>;
  }
  if (!app) return null;

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <Link href={`/jobs/${app.jobId}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={15} /> Voltar para a vaga
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{app.candidate?.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Candidato para <Link href={`/jobs/${app.jobId}`} className="text-primary hover:underline">{app.job?.title}</Link>
              </p>
            </div>
            <Badge className={cn(statusColor(app.status))}>{statusLabel(app.status)}</Badge>
          </div>
        </div>

        {/* Stage + AI score */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-500 mb-1">Etapa atual</p>
              <p className="font-semibold text-gray-900">{app.stage?.name ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Brain size={12} /> Score IA</p>
              {app.aiScore != null ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{app.aiScore}</span>
                  <span className="text-sm text-gray-400">/100</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${app.aiScore}%` }} />
                  </div>
                </div>
              ) : <p className="text-gray-400 text-sm">Não calculado</p>}
            </CardContent>
          </Card>
        </div>

        {/* Interviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">Entrevistas</p>
              </div>
              <Link href={`/interviews/new?applicationId=${id}`}>
                <Button size="sm" variant="secondary">Agendar</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {app.interviews?.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma entrevista agendada.</p>
            ) : (
              <div className="space-y-2">
                {app.interviews?.map((iv: any) => (
                  <div key={iv.id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{iv.title}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(iv.scheduledAt)} · {statusLabel(iv.type)}</p>
                    </div>
                    <Badge className={cn(statusColor(iv.status))}>{statusLabel(iv.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedbacks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-700">Feedbacks ({app.feedbacks?.length ?? 0})</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setShowFeedbackForm((v) => !v)}>
                {showFeedbackForm ? 'Cancelar' : '+ Adicionar feedback'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showFeedbackForm && (
              <form onSubmit={handleSubmit((data) => submitFeedback.mutate(data))} className="space-y-3 p-4 rounded-lg bg-surface border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Avaliação</p>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recomendação</label>
                  <select className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" {...register('recommendation', { required: true })}>
                    <option value="">Selecione…</option>
                    <option value="STRONG_YES">Fortemente favorável</option>
                    <option value="YES">Favorável</option>
                    <option value="NEUTRAL">Neutro</option>
                    <option value="NO">Não recomendo</option>
                    <option value="STRONG_NO">Fortemente contrário</option>
                  </select>
                </div>
                <Input label="Pontos fortes" placeholder="Ex: Boa comunicação, experiência sólida" {...register('strengths')} />
                <Input label="Pontos de melhoria" placeholder="Ex: Pouca experiência com X" {...register('weaknesses')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea rows={3} className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Notas adicionais..." {...register('notes')} />
                </div>
                <Button type="submit" size="sm" loading={submitFeedback.isPending}>Salvar feedback</Button>
              </form>
            )}

            {app.feedbacks?.length === 0 && !showFeedbackForm ? (
              <p className="text-sm text-gray-400">Nenhum feedback registrado.</p>
            ) : (
              <div className="space-y-3">
                {app.feedbacks?.map((fb: any) => (
                  <div key={fb.id} className="p-4 rounded-lg bg-surface border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fb.author?.name}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(fb.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-yellow-400 text-sm">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</div>
                        <Badge variant={fb.recommendation.startsWith('STRONG_YES') ? 'success' : fb.recommendation === 'YES' ? 'success' : fb.recommendation.includes('NO') ? 'error' : 'default'}>
                          {fb.recommendation.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {fb.strengths && <p className="text-xs text-gray-600 mb-1"><span className="font-medium text-green-700">+</span> {fb.strengths}</p>}
                    {fb.weaknesses && <p className="text-xs text-gray-600 mb-1"><span className="font-medium text-red-600">-</span> {fb.weaknesses}</p>}
                    {fb.notes && <p className="text-xs text-gray-500 mt-2">{fb.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
