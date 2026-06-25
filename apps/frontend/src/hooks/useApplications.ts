import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  stageId: string | null;
  status: string;
  aiScore: number | null;
  notes: string | null;
  appliedAt: string;
  candidate?: { id: string; name: string; email: string; aiSummary?: string };
  stage?: { id: string; name: string; order: number };
  feedbacks?: Feedback[];
  _count?: { interviews: number; feedbacks: number };
}

export interface Feedback {
  id: string;
  rating: number;
  recommendation: string;
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  author?: { id: string; name: string };
  createdAt: string;
}

export function useApplicationsByJob(jobId: string, stageId?: string) {
  return useQuery({
    queryKey: ['applications', 'job', jobId, stageId],
    queryFn: async () => {
      const { data } = await api.get(`/applications/job/${jobId}`, {
        params: stageId ? { stageId } : {},
      });
      return data as Application[];
    },
    enabled: !!jobId,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data } = await api.get(`/applications/${id}`);
      return data as Application;
    },
    enabled: !!id,
  });
}

export function useMoveStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, stageId }: { applicationId: string; stageId: string }) =>
      api.patch(`/applications/${applicationId}/stage`, { stageId }).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
