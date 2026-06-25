'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, statusLabel, statusColor, cn } from '@/lib/utils';
import { Calendar, Plus, Video, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const typeIcon: Record<string, React.ReactNode> = {
  VIDEO: <Video size={14} />,
  PHONE: <Phone size={14} />,
  ONSITE: <MapPin size={14} />,
  TECHNICAL: <Calendar size={14} />,
};

export default function InterviewsPage() {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.get('/interviews').then((r) => r.data),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Entrevistas</h1>
            <p className="text-sm text-gray-500 mt-1">{interviews?.length ?? 0} entrevistas agendadas</p>
          </div>
          <Link href="/interviews/new">
            <Button><Plus size={16} /> Agendar entrevista</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : interviews?.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar size={40} className="text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma entrevista agendada.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {interviews?.map((iv: any) => (
              <Card key={iv.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-offset text-gray-500">
                    {typeIcon[iv.type] ?? <Calendar size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{iv.title}</p>
                    <p className="text-xs text-gray-500">
                      {iv.application?.candidate?.name} · {iv.application?.job?.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-gray-600">{formatDateTime(iv.scheduledAt)}</span>
                    <Badge className={cn(statusColor(iv.status))}>{statusLabel(iv.status)}</Badge>
                    {iv.meetLink && (
                      <a href={iv.meetLink} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost"><Video size={14} /> Entrar</Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
