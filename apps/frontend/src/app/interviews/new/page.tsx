'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  applicationId: z.string().min(1, 'Candidatura obrigatória'),
  title: z.string().min(3, 'Título obrigatório'),
  type: z.enum(['PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL']),
  scheduledAt: z.string().min(1, 'Data obrigatória'),
  duration: z.coerce.number().min(15).default(60),
  meetLink: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const prefilledAppId = searchParams.get('applicationId') ?? '';

  const { data: applications } = useQuery({
    queryKey: ['applications-all'],
    queryFn: () => api.get('/applications').then((r) => r.data),
  });

  const schedule = useMutation({
    mutationFn: (data: FormData) => api.post('/interviews', data).then((r) => r.data),
    onSuccess: (interview) => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      const appId = interview.applicationId;
      router.push(appId ? `/applications/${appId}` : '/interviews');
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { applicationId: prefilledAppId, type: 'VIDEO', duration: 60 },
  });

  return (
    <AppLayout>
      <div className="max-w-lg space-y-6">
        <div>
          <Link href="/interviews" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={15} /> Voltar
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Agendar entrevista</h1>
        </div>

        <form onSubmit={handleSubmit((data) => schedule.mutate(data))} className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">Detalhes</p></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidatura</label>
                <select
                  className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('applicationId')}
                >
                  <option value="">Selecione…</option>
                  {applications?.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.candidate?.name} — {a.job?.title}
                    </option>
                  ))}
                </select>
                {errors.applicationId && <p className="text-xs text-red-600 mt-1">{errors.applicationId.message}</p>}
              </div>

              <Input label="Título da entrevista *" placeholder="Ex: Entrevista técnica" error={errors.title?.message} {...register('title')} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" {...register('type')}>
                    <option value="VIDEO">Vídeo</option>
                    <option value="PHONE">Telefone</option>
                    <option value="ONSITE">Presencial</option>
                    <option value="TECHNICAL">Técnica</option>
                  </select>
                </div>
                <Input label="Duração (min)" type="number" {...register('duration')} />
              </div>

              <Input label="Data e hora *" type="datetime-local" error={errors.scheduledAt?.message} {...register('scheduledAt')} />
              <Input label="Link da chamada" placeholder="https://meet.google.com/..." error={errors.meetLink?.message} {...register('meetLink')} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea rows={3} className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Instruções para o candidato, tópicos..." {...register('notes')} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href="/interviews"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={schedule.isPending}>Agendar</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
