import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  isRemote?: boolean;
  status: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  createdAt: string;
  recruiter?: { id: string; name: string };
  pipeline?: Stage[];
  _count?: { applications: number };
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  jobId: string;
}

export function useJobs(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params });
      return data as Job[];
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data as Job & { pipeline: (Stage & { applications: any[] })[] };
    },
    enabled: !!id,
  });
}

export function useJobMetrics() {
  return useQuery({
    queryKey: ['jobs', 'metrics'],
    queryFn: async () => {
      const { data } = await api.get('/jobs/metrics');
      return data as {
        total: number; open: number; paused: number; closed: number;
        totalApplications: number; totalHired: number;
      };
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Job>) => api.post('/jobs', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}

export function useUpdateJob(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Job>) => api.patch(`/jobs/${id}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}
