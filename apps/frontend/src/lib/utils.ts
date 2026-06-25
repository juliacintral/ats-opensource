import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Rascunho', OPEN: 'Aberta', PAUSED: 'Pausada', CLOSED: 'Encerrada',
    APPLIED: 'Aplicado', SCREENING: 'Triagem', INTERVIEWING: 'Entrevistando',
    OFFERED: 'Proposta', HIRED: 'Contratado', REJECTED: 'Rejeitado', WITHDRAWN: 'Desistiu',
    SCHEDULED: 'Agendada', COMPLETED: 'Concluída', CANCELLED: 'Cancelada',
    PHONE: 'Telefone', VIDEO: 'Vídeo', ONSITE: 'Presencial', TECHNICAL: 'Técnica',
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-600',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    CLOSED: 'bg-red-100 text-red-700',
    HIRED: 'bg-primary-highlight text-primary-active',
    REJECTED: 'bg-red-50 text-red-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}
