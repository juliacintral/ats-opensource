'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCreateJob } from '@/hooks/useJobs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title: z.string().min(3, 'Título obrigatório'),
  department: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  status: z.enum(['DRAFT', 'OPEN']).default('DRAFT'),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryCurrency: z.string().default('BRL'),
  description: z.string().optional(),
  requirements: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT', salaryCurrency: 'BRL', isRemote: false },
  });

  async function onSubmit(data: FormData) {
    const job = await createJob.mutateAsync(data);
    router.push(`/jobs/${job.id}`);
  }

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={15} /> Voltar para vagas
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Nova vaga</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">Informações básicas</p></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Título da vaga *" placeholder="Ex: Engenheiro(a) de Software Sênior" error={errors.title?.message} {...register('title')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Departamento" placeholder="Ex: Tecnologia" {...register('department')} />
                <Input label="Localização" placeholder="Ex: São Paulo, SP" {...register('location')} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('isRemote')} />
                Trabalho remoto
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status inicial</label>
                <select className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" {...register('status')}>
                  <option value="DRAFT">Rascunho</option>
                  <option value="OPEN">Publicar agora</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">Salário (opcional)</p></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input label="Mínimo" type="number" placeholder="5000" {...register('salaryMin')} />
                <Input label="Máximo" type="number" placeholder="8000" {...register('salaryMax')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                  <select className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" {...register('salaryCurrency')}>
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">Descrição e requisitos</p></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da vaga</label>
                <textarea rows={5} className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Descreva as responsabilidades, cultura da empresa..." {...register('description')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos</label>
                <textarea rows={4} className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Liste os requisitos técnicos e comportamentais..." {...register('requirements')} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href="/jobs"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={createJob.isPending}>Criar vaga</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
