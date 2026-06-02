/**
 * Chequebook React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
export interface Cheque {
  id: string;
  code: string;
  chequeNumber: string;
  chequeDate: Date | string;
  amount: number;
  status: 'PENDING' | 'ISSUED' | 'CLEARED' | 'VOIDED' | 'STALE';
  bankAccount?: string;
  bankName?: string;
  payee?: string;
  memo?: string;
  notes?: string;
  customerId: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  claimId?: string;
  claim?: {
    id: string;
    code: string;
    claimedAmount?: number;
    approvedAmount?: number;
    promotion?: {
      id: string;
      code: string;
      name: string;
    };
  };
  issuedAt?: Date | string;
  clearedAt?: Date | string;
  voidedAt?: Date | string;
  voidReason?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChequeListParams {
  status?: string;
  customerId?: string;
  bankAccount?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface ChequeSummary {
  totalIssued: number;
  totalCleared: number;
  totalVoided: number;
  totalPending: number;
  issuedAmount: number;
  clearedAmount: number;
  pendingAmount: number;
}

// Query keys
export const chequeKeys = {
  all: ['cheques'] as const,
  lists: () => [...chequeKeys.all, 'list'] as const,
  list: (params: ChequeListParams) => [...chequeKeys.lists(), params] as const,
  details: () => [...chequeKeys.all, 'detail'] as const,
  detail: (id: string) => [...chequeKeys.details(), id] as const,
};

// List cheques
export function useCheques(params: ChequeListParams = {}) {
  return useQuery({
    queryKey: chequeKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const response = await api.get(`/finance/cheques?${searchParams.toString()}`);
      return response.data as {
        cheques: Cheque[];
        summary: ChequeSummary;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
  });
}

// Get single cheque
export function useCheque(id: string) {
  return useQuery({
    queryKey: chequeKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/finance/cheques/${id}`);
      return response.data as Cheque;
    },
    enabled: !!id,
  });
}

// Create cheque
export function useCreateCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      claimId?: string;
      chequeNumber: string;
      chequeDate: string;
      amount: number;
      bankAccount?: string;
      bankName?: string;
      payee?: string;
      memo?: string;
    }) => {
      const response = await api.post('/finance/cheques', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.lists() });
    },
  });
}

// Update cheque
export function useUpdateCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      chequeDate?: string;
      amount?: number;
      payee?: string;
      memo?: string;
      bankAccount?: string;
      bankName?: string;
      notes?: string;
    }) => {
      const response = await api.put(`/finance/cheques/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chequeKeys.lists() });
    },
  });
}

// Delete cheque
export function useDeleteCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/finance/cheques/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.lists() });
    },
  });
}

// Clear cheque
export function useClearCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      clearDate,
      notes,
    }: {
      id: string;
      clearDate?: string;
      notes?: string;
    }) => {
      const response = await api.put(`/finance/cheques/${id}`, {
        action: 'CLEAR',
        clearDate,
        notes,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chequeKeys.lists() });
    },
  });
}

// Void cheque
export function useVoidCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      voidReason,
      notes,
    }: {
      id: string;
      voidReason: string;
      notes?: string;
    }) => {
      const response = await api.put(`/finance/cheques/${id}`, {
        action: 'VOID',
        voidReason,
        notes,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chequeKeys.lists() });
    },
  });
}

// Mark cheque as stale
export function useStaleCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await api.put(`/finance/cheques/${id}`, {
        action: 'STALE',
        notes,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chequeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: chequeKeys.lists() });
    },
  });
}
