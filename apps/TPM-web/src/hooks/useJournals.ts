/**
 * GL Journals React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
export interface JournalLine {
  id: string;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
  costCenter?: string;
  department?: string;
}

export interface Journal {
  id: string;
  code: string;
  journalType: string;
  journalDate: Date | string;
  description?: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  totalDebit: number;
  totalCredit: number;
  customerId?: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  promotionId?: string;
  promotion?: {
    id: string;
    code: string;
    name: string;
  };
  accrualId?: string;
  accrual?: {
    id: string;
    code: string;
  };
  claimId?: string;
  claim?: {
    id: string;
    code: string;
  };
  lines: JournalLine[];
  postedAt?: Date | string;
  postedBy?: string;
  reversedAt?: Date | string;
  reversedById?: string;
  reversedBy?: {
    id: string;
    code: string;
  };
  reversalOfId?: string;
  reversalOf?: {
    id: string;
    code: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JournalListParams {
  status?: string;
  type?: string;
  customerId?: string;
  promotionId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface JournalSummary {
  totalDraft: number;
  totalPosted: number;
  totalReversed: number;
  draftAmount: number;
  postedAmount: number;
}

// Query keys
export const journalKeys = {
  all: ['journals'] as const,
  lists: () => [...journalKeys.all, 'list'] as const,
  list: (params: JournalListParams) => [...journalKeys.lists(), params] as const,
  details: () => [...journalKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalKeys.details(), id] as const,
};

// List journals
export function useJournals(params: JournalListParams = {}) {
  return useQuery({
    queryKey: journalKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const response = await api.get(`/finance/journals?${searchParams.toString()}`);
      return response.data as {
        journals: Journal[];
        summary: JournalSummary;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
  });
}

// Get single journal
export function useJournal(id: string) {
  return useQuery({
    queryKey: journalKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/finance/journals/${id}`);
      return response.data as Journal;
    },
    enabled: !!id,
  });
}

// Create journal
export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      journalType: string;
      journalDate: string;
      description?: string;
      reference?: string;
      customerId?: string;
      promotionId?: string;
      accrualId?: string;
      claimId?: string;
      lines: Array<{
        accountCode: string;
        accountName: string;
        debit?: number;
        credit?: number;
        description?: string;
        costCenter?: string;
        department?: string;
      }>;
    }) => {
      const response = await api.post('/finance/journals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}

// Update journal
export function useUpdateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      journalDate?: string;
      description?: string;
      reference?: string;
      lines?: Array<{
        accountCode: string;
        accountName: string;
        debit?: number;
        credit?: number;
        description?: string;
        costCenter?: string;
        department?: string;
      }>;
    }) => {
      const response = await api.put(`/finance/journals/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}

// Delete journal
export function useDeleteJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/journals/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}

// Post journal
export function usePostJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId?: string }) => {
      const response = await api.post(`/finance/journals/${id}/post`, { userId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}

// Reverse journal
export function useReverseJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
      reversalDate,
      userId,
    }: {
      id: string;
      reason: string;
      reversalDate?: string;
      userId?: string;
    }) => {
      const response = await api.post(`/finance/journals/${id}/reverse`, {
        reason,
        reversalDate,
        userId,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
}
