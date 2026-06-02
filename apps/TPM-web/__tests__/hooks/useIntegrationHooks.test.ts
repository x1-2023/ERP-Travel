/**
 * Integration Hooks Tests
 * Tests for useDMS, useERP, useSecurity, useWebhooks
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createWrapper } from '../test-utils';
import { server } from '../mocks/server';

// DMS hooks
import {
  useDMSConnections,
  useDMSConnection,
  useCreateDMSConnection,
  useUpdateDMSConnection,
  useDeleteDMSConnection,
  useTriggerDMSSync,
  usePushToDMS,
} from '@/hooks/integration/useDMS';

// ERP hooks
import {
  useERPConnections,
  useERPConnection,
  useCreateERPConnection,
  useUpdateERPConnection,
  useDeleteERPConnection,
  useTestERPConnection,
  useTriggerERPSync,
  useERPSyncLogs,
} from '@/hooks/integration/useERP';

// Security hooks
import {
  useAPIKeys,
  useAPIKey,
  useCreateAPIKey,
  useRevokeAPIKey,
  useAuditLogs,
  useEntityAuditTrail,
  useSecurityDashboard,
} from '@/hooks/integration/useSecurity';

// Webhooks hooks
import {
  useWebhooks,
  useWebhook,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookDeliveries,
  useRetryDelivery,
} from '@/hooks/integration/useWebhooks';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ══════════════════════════════════════════════════════════════════════════════
// DMS Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useDMSConnections', () => {
  it('should fetch DMS connections list', async () => {
    const { result } = renderHook(() => useDMSConnections(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.summary.total).toBe(1);
  });

  it('should fetch DMS connections with filters', async () => {
    const { result } = renderHook(
      () => useDMSConnections({ type: 'SAP', status: 'ACTIVE', search: 'test' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useDMSConnection', () => {
  it('should fetch single DMS connection', async () => {
    const { result } = renderHook(() => useDMSConnection('dms-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.stats).toBeDefined();
    expect(result.current.data?.stats.totalRecords).toBe(100);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useDMSConnection(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateDMSConnection', () => {
  it('should create a DMS connection', async () => {
    const { result } = renderHook(() => useCreateDMSConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: 'New DMS', type: 'SAP' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateDMSConnection', () => {
  it('should update a DMS connection', async () => {
    const { result } = renderHook(() => useUpdateDMSConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'dms-1', data: { name: 'Updated DMS' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteDMSConnection', () => {
  it('should delete a DMS connection', async () => {
    const { result } = renderHook(() => useDeleteDMSConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('dms-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useTriggerDMSSync', () => {
  it('should trigger DMS sync', async () => {
    const { result } = renderHook(() => useTriggerDMSSync(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'dms-1', data: { syncType: 'FULL' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePushToDMS', () => {
  it('should push data to DMS', async () => {
    const { result } = renderHook(() => usePushToDMS(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'dms-1', data: { pushType: 'PROMOTION' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ERP Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useERPConnections', () => {
  it('should fetch ERP connections list', async () => {
    const { result } = renderHook(() => useERPConnections(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.summary.total).toBe(1);
  });

  it('should fetch ERP connections with filters', async () => {
    const { result } = renderHook(
      () => useERPConnections({ type: 'SAP', status: 'ACTIVE', search: 'test' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useERPConnection', () => {
  it('should fetch single ERP connection', async () => {
    const { result } = renderHook(() => useERPConnection('erp-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.stats).toBeDefined();
    expect(result.current.data?.stats.totalSyncs).toBe(10);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useERPConnection(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateERPConnection', () => {
  it('should create an ERP connection', async () => {
    const { result } = renderHook(() => useCreateERPConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: 'New ERP', type: 'SAP' } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateERPConnection', () => {
  it('should update an ERP connection', async () => {
    const { result } = renderHook(() => useUpdateERPConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'erp-1', data: { name: 'Updated ERP' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteERPConnection', () => {
  it('should delete an ERP connection', async () => {
    const { result } = renderHook(() => useDeleteERPConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('erp-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useTestERPConnection', () => {
  it('should test an ERP connection', async () => {
    const { result } = renderHook(() => useTestERPConnection(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('erp-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useTriggerERPSync', () => {
  it('should trigger ERP sync', async () => {
    const { result } = renderHook(() => useTriggerERPSync(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'erp-1', data: { entityTypes: ['PRODUCT'] } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useERPSyncLogs', () => {
  it('should fetch ERP sync logs', async () => {
    const { result } = renderHook(() => useERPSyncLogs('erp-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should not fetch when connection ID is empty', async () => {
    const { result } = renderHook(() => useERPSyncLogs(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch logs with filter params', async () => {
    const { result } = renderHook(
      () => useERPSyncLogs('erp-1', { status: 'SUCCESS', entityType: 'PRODUCT', page: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Security Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useAPIKeys', () => {
  it('should fetch API keys list', async () => {
    const { result } = renderHook(() => useAPIKeys(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.summary.total).toBe(1);
  });

  it('should fetch API keys with filters', async () => {
    const { result } = renderHook(
      () => useAPIKeys({ isActive: true, search: 'test' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useAPIKey', () => {
  it('should fetch single API key', async () => {
    const { result } = renderHook(() => useAPIKey('key-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.name).toBe('Test Key');
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useAPIKey(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateAPIKey', () => {
  it('should create an API key', async () => {
    const { result } = renderHook(() => useCreateAPIKey(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: 'New Key', permissions: ['read'] } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useRevokeAPIKey', () => {
  it('should revoke an API key', async () => {
    const { result } = renderHook(() => useRevokeAPIKey(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('key-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useAuditLogs', () => {
  it('should fetch audit logs', async () => {
    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should fetch audit logs with filters', async () => {
    const { result } = renderHook(
      () => useAuditLogs({ userId: 'user-1', action: 'CREATE', entityType: 'PROMOTION', page: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useEntityAuditTrail', () => {
  it('should fetch entity audit trail', async () => {
    const { result } = renderHook(
      () => useEntityAuditTrail('PROMOTION', 'promo-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.entityType).toBe('PROMOTION');
    expect(result.current.data?.entityId).toBe('promo-1');
  });

  it('should not fetch when entityType is empty', async () => {
    const { result } = renderHook(
      () => useEntityAuditTrail('', 'promo-1'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when entityId is empty', async () => {
    const { result } = renderHook(
      () => useEntityAuditTrail('PROMOTION', ''),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useSecurityDashboard', () => {
  it('should fetch security dashboard', async () => {
    const { result } = renderHook(() => useSecurityDashboard(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.apiKeys.total).toBe(5);
    expect(result.current.data?.audit.todayLogins).toBe(15);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Webhooks Hooks
// ══════════════════════════════════════════════════════════════════════════════

describe('useWebhooks', () => {
  it('should fetch webhooks list', async () => {
    const { result } = renderHook(() => useWebhooks(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.summary.total).toBe(1);
  });

  it('should fetch webhooks with filters', async () => {
    const { result } = renderHook(
      () => useWebhooks({ isActive: true, search: 'example' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useWebhook', () => {
  it('should fetch single webhook', async () => {
    const { result } = renderHook(() => useWebhook('wh-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.stats).toBeDefined();
    expect(result.current.data?.stats.successRate).toBe(95);
  });

  it('should not fetch when ID is empty', async () => {
    const { result } = renderHook(() => useWebhook(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useCreateWebhook', () => {
  it('should create a webhook', async () => {
    const { result } = renderHook(() => useCreateWebhook(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ url: 'https://example.com/webhook', events: ['promotion.created'] } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateWebhook', () => {
  it('should update a webhook', async () => {
    const { result } = renderHook(() => useUpdateWebhook(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'wh-1', data: { url: 'https://example.com/updated' } as any });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteWebhook', () => {
  it('should delete a webhook', async () => {
    const { result } = renderHook(() => useDeleteWebhook(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('wh-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useTestWebhook', () => {
  it('should test a webhook', async () => {
    const { result } = renderHook(() => useTestWebhook(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate('wh-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useWebhookDeliveries', () => {
  it('should fetch webhook deliveries', async () => {
    const { result } = renderHook(() => useWebhookDeliveries('wh-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.pagination).toBeDefined();
  });

  it('should not fetch when endpoint ID is empty', async () => {
    const { result } = renderHook(() => useWebhookDeliveries(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch deliveries with filter params', async () => {
    const { result } = renderHook(
      () => useWebhookDeliveries('wh-1', { status: 'SUCCESS', event: 'promotion.created', page: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useRetryDelivery', () => {
  it('should retry a failed delivery', async () => {
    const { result } = renderHook(() => useRetryDelivery(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ endpointId: 'wh-1', deliveryId: 'del-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
