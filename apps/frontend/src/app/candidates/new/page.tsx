'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  githubUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  source: z.enum(['MANUAL', 'LINKEDIN', 'REFERRAL', 'CAREER_PAGE', 'OTHER']).default('MANUAL'),
});

type FormData = z.infer<typeof schema>;

export default function NewCandidatePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);

  const createCandidate = useMutation({
    mutationFn: (data: FormData) => api.post('/candidates', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidates'] }),
  });

  const uploadResume = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/candidates/${id}/resume`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { source: 'MANUAL' },
  });

  async function onSubmit(data: FormData) {
    const candidate = await createCandidate.mutateAsync(data);
    if (file) {
      setParsing(true);
      try { await uploadResume.mutateAsync({ id: candidate.id, file }); }
      finally { setParsing(false); }
    }
    router.push(`/candidates/${candidate.id}`);
  }

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <Link href="/candidates" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={15} /> Voltar
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Novo candidato</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader><p className="text-sm font-semibold text-gray-700">Dados pessoais</p></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nome completo *" placeholder="Ana Silva" error={errors.name?.message} {...register('name')} />
                <Input label="E-mail *" type="email" placeholder="ana@email.com" error={errors.email?.message} {...register('email')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Telefone" placeholder="+55 11 99999-9999" {...register('phone')} />
                <Input label="Localização" placeholder="São Paulo, SP" {...register('location')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="LinkedIn" placeholder="https://linkedin.com/in/..." error={errors.linkedinUrl?.message} {...register('linkedinUrl')} />
                <Input label="GitHub" placeholder="https://github.com/..." error={errors.githubUrl?.message} {...register('githubUrl')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                <select className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" {...register('source')}>
                  <option value="MANUAL">Cadastro manual</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="REFERRAL">Indicação</option>
                  <option value="CAREER_PAGE">Página de carreiras</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-gray-700">Currículo</p>
              <p className="text-xs text-gray-500 mt-0.5">PDF ou DOCX. A IA fará o parsing automaticamente via Ollama.</p>
            </CardHeader>
            <CardContent>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-highlight border border-primary/20">
                  <FileText size={20} className="text-primary shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-gray-200 bg-surface p-8 text-center hover:border-primary hover:bg-primary-highlight transition-colors"
                >
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Clique para enviar o currículo</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX</p>
                </button>
              )}
            </CardContent>
          </Card>

          {parsing && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary-highlight rounded-lg px-4 py-3">
              <Loader2 size={16} className="animate-spin" />
              IA processando o currículo via Ollama…
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Link href="/candidates"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={createCandidate.isPending || parsing}>Criar candidato</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
