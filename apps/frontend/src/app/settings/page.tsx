'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { useForm } from 'react-hook-form';
import { Settings, Cpu } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  return (
    <AppLayout>
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie sua conta e integrações</p>
        </div>

        <Card>
          <CardHeader><p className="text-sm font-semibold text-gray-700">Perfil</p></CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input label="Nome" defaultValue={user?.name} {...register('name')} />
              <Input label="E-mail" type="email" defaultValue={user?.email} {...register('email')} />
              <Input label="Nova senha" type="password" placeholder="Deixe em branco para não alterar" />
              <Button type="submit" size="sm">Salvar alterações</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-primary" />
              <p className="text-sm font-semibold text-gray-700">Provedor de IA</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Configure o provedor de IA no arquivo <code className="bg-surface px-1 rounded text-xs">.env</code> do backend.
            </p>
            <div className="rounded-lg bg-surface border border-gray-100 p-4 text-xs font-mono text-gray-700 space-y-1">
              <p>AI_PROVIDER=ollama</p>
              <p>OLLAMA_URL=http://localhost:11434</p>
              <p>OLLAMA_MODEL=qwen3</p>
            </div>
            <p className="text-xs text-gray-500">Modelos suportados: <strong>qwen3</strong>, llama3, deepseek, mistral via Ollama. Ou use OpenRouter com modelos gratuitos.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
