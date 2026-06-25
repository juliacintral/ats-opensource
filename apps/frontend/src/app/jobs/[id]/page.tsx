'use client';
import { useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJob } from '@/hooks/useJobs';
import { useApplicationsByJob, useMoveStage } from '@/hooks/useApplications';
import { cn, statusLabel, statusColor } from '@/lib/utils';
import { ArrowLeft, Brain } from 'lucide-react';
import Link from 'next/link';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function CandidateCard({ app }: { app: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{app.candidate?.name}</p>
          <p className="text-xs text-gray-500 truncate">{app.candidate?.email}</p>
        </div>
        {app.aiScore != null && (
          <div className="flex items-center gap-1 shrink-0">
            <Brain size={12} className="text-primary" />
            <span className="text-xs font-semibold text-primary">{app.aiScore}</span>
          </div>
        )}
      </div>
      {app.candidate?.aiSummary && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{app.candidate.aiSummary}</p>
      )}
      <Link href={`/applications/${app.id}`} onClick={(e) => e.stopPropagation()}>
        <span className="mt-2 inline-block text-xs text-primary hover:underline">Ver detalhes →</span>
      </Link>
    </div>
  );
}

function KanbanColumn({ stage, applications }: { stage: any; applications: any[] }) {
  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">{stage.name}</span>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{applications.length}</span>
      </div>
      <div className="flex-1 min-h-[200px] bg-surface rounded-lg p-2 space-y-2">
        <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <CandidateCard key={app.id} app={app} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading } = useJob(id);
  const { data: applications } = useApplicationsByJob(id);
  const moveStage = useMoveStage();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // over.id pode ser um stageId ou applicationId dentro do stage
    const targetStage = job?.pipeline?.find((s) =>
      s.id === over.id || s.applications?.some((a: any) => a.id === over.id)
    );
    if (targetStage) {
      moveStage.mutate({ applicationId: String(active.id), stageId: targetStage.id });
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-100 animate-pulse rounded" />
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 w-64 bg-gray-100 animate-pulse rounded-lg" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!job) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={15} /> Voltar para vagas
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">{job.title}</h1>
                <Badge className={cn(statusColor(job.status))}>{statusLabel(job.status)}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {job.department} {job.location && `· ${job.location}`} {job.isRemote && '· Remoto'}
              </p>
            </div>
            <Link href={`/jobs/${id}/edit`}>
              <Button variant="secondary" size="sm">Editar vaga</Button>
            </Link>
          </div>
        </div>

        {/* Kanban */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline de candidatos</h2>
          <div className="overflow-x-auto pb-4">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 min-w-max">
                {job.pipeline?.map((stage) => (
                  <KanbanColumn
                    key={stage.id}
                    stage={stage}
                    applications={applications?.filter((a) => a.stageId === stage.id) ?? stage.applications ?? []}
                  />
                ))}
              </div>
            </DndContext>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
