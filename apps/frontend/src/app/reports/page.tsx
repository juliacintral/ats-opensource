'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

export default function ReportsPage() {
  const { data: metrics } = useQuery({
    queryKey: ['jobs', 'metrics'],
    queryFn: () => api.get('/jobs/metrics').then((r) => r.data),
  });

  const statuses = [
    { label: 'Abertas', value: metrics?.open ?? 0, color: 'bg-green-500' },
    { label: 'Pausadas', value: metrics?.paused ?? 0, color: 'bg-yellow-400' },
    { label: 'Encerradas', value: metrics?.closed ?? 0, color: 'bg-gray-400' },
  ];

  const total = metrics?.total || 1;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1">Visão consolidada do pipeline de recrutamento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-5">
              <p className="text-xs text-gray-500 mb-1">Total de vagas</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.total ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <p className="text-xs text-gray-500 mb-1">Total de candidaturas</p>
              <p className="text-3xl font-bold text-gray-900">{metrics?.totalApplications ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <p className="text-xs text-gray-500 mb-1">Contratados</p>
              <p className="text-3xl font-bold text-primary">{metrics?.totalHired ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-gray-500" />
              <p className="text-sm font-semibold text-gray-700">Distribuição de vagas</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {statuses.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${s.color} h-2 rounded-full transition-all`}
                    style={{ width: `${(s.value / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-10 flex flex-col items-center text-center gap-3">
            <BarChart2 size={40} className="text-gray-300" />
            <p className="text-gray-500 text-sm">Para analytics avançados, conecte o Metabase ou Apache Superset ao banco PostgreSQL.</p>
            <a href="https://www.metabase.com" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">Saiba mais sobre Metabase →</a>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
