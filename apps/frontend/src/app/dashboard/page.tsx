'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { useJobMetrics } from '@/hooks/useJobs';
import { Briefcase, Users, TrendingUp, CheckCircle } from 'lucide-react';

function MetricCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: metrics, isLoading } = useJobMetrics();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral do recrutamento</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Vagas abertas" value={metrics?.open ?? 0} icon={Briefcase} color="bg-primary" />
            <MetricCard label="Candidaturas" value={metrics?.totalApplications ?? 0} icon={Users} color="bg-blue-500" />
            <MetricCard label="Contratados" value={metrics?.totalHired ?? 0} icon={CheckCircle} color="bg-green-500" />
            <MetricCard label="Total de vagas" value={metrics?.total ?? 0} icon={TrendingUp} color="bg-purple-500" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
