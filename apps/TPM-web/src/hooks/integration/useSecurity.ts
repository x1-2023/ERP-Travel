/**
 * Security Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { APIKey, AuditLog, CreateAPIKeyRequest, AuditLogParams } from '@/types/integration';

// List API keys
export function useAPIKeys(params?: { isActive?: boolean; search?: string }) {
  return useQuery({
    queryKey: ['api-keys', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      if (params?.search) searchParams.set('search', params.search);

      const res = await api.get(`/integration/security/api-keys?${searchParams.toString()}`);
      return res.data as {
        data: APIKey[];
        summary: {
          total: number;
          active: number;
          expiringSoon: number;
        };
      };
    },
  });
}

// Get single API key
export function useAPIKey(id: string) {
  return useQuery({
    queryKey: ['api-key', id],
    queryFn: async () => {
      const res = await api.get(`/integration/security/api-keys/${id}`);
      return res.data as APIKey;
    },
    enabled: !!id,
  });
}

// Create API key
export function useCreateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAPIKeyRequest) => {
      const res = await api.post('/integration/security/api-keys', data);
      return res.data as { data: APIKey & { key: string } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

// Revoke API key
export function useRevokeAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/integration/security/api-keys/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

// List audit logs
export function useAuditLogs(params?: AuditLogParams) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.action) searchParams.set('action', params.action);
      if (params?.entityType) searchParams.set('entityType', params.entityType);
      if (params?.entityId) searchParams.set('entityId', params.entityId);
      if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
      if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

      const res = await api.get(`/integration/security/audit-logs?${searchParams.toString()}`);
      return res.data as {
        data: AuditLog[];
        pagination: {
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
        };
      };
    },
  });
}

// Get entity audit trail
export function useEntityAuditTrail(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['entity-audit-trail', entityType, entityId],
    queryFn: async () => {
      const res = await api.get(`/integration/security/audit-logs/${entityType}/${entityId}`);
      return res.data as {
        entityType: string;
        entityId: string;
        entityInfo: Record<string, unknown> | null;
        logs: AuditLog[];
        totalChanges: number;
      };
    },
    enabled: !!entityType && !!entityId,
  });
}

// Get security dashboard
export function useSecurityDashboard() {
  return useQuery({
    queryKey: ['security-dashboard'],
    queryFn: async () => {
      const res = await api.get('/integration/security/dashboard');
      return res.data as {
        apiKeys: {
          total: number;
          active: number;
          expiringSoon: number;
          totalUsage: number;
        };
        audit: {
          todayLogins: number;
          todayActions: number;
          recentSensitiveActions: Array<{
            id: string;
            action: string;
            entityType: string;
            entityId?: string;
            user: string;
            timestamp: string;
          }>;
          actionsByType: Array<{ action: string; count: number }>;
          entityTypes: Array<{ entityType: string; count: number }>;
        };
      };
    },
  });
}
