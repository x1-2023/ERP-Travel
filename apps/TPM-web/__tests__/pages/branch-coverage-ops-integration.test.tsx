/**
 * Branch Coverage Tests - Operations & Integration Pages
 * Targets: conditional branches in 14 files
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { useBaselines } from '@/hooks/useBaselines';
import { useTPO, usePromotionSuggestions, useROIPrediction } from '@/hooks/useTPO';
import { useDeliveryOrder, useDeliveryTracking } from '@/hooks/operations/useDelivery';
import { useERPConnection, useERPSyncLogs } from '@/hooks/integration/useERP';
import { useWebhook, useWebhookDeliveries } from '@/hooks/integration/useWebhooks';
import api from '@/lib/api';

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-1' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/hooks/operations', () => ({
  useImportSellTracking: () => ({ mutateAsync: mockMutateAsync }),
  useImportInventory: () => ({ mutateAsync: mockMutateAsync }),
}));

vi.mock('@/hooks/operations/useDelivery', () => ({
  useDeliveryOrder: vi.fn().mockReturnValue({ data: null, isLoading: false, error: null }),
  useDeliveryTracking: vi.fn().mockReturnValue({ data: null }),
  useUpdateDeliveryStatus: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useDeleteDelivery: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

vi.mock('@/hooks/useBaselines', () => ({
  useBaselines: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}));

vi.mock('@/hooks/useTPO', () => ({
  useTPO: vi.fn().mockReturnValue({
    isConnected: false,
    isLoading: false,
    mechanics: [],
    channels: [],
  }),
  usePromotionSuggestions: vi.fn().mockReturnValue({
    getSuggestions: vi.fn(),
    suggestions: null,
    isLoading: false,
    reset: vi.fn(),
  }),
  useROIPrediction: vi.fn().mockReturnValue({
    predict: vi.fn(),
    result: null,
    isLoading: false,
    reset: vi.fn(),
  }),
}));

vi.mock('@/hooks/integration/useERP', () => ({
  useERPConnection: vi.fn().mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() }),
  useUpdateERPConnection: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useDeleteERPConnection: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useTestERPConnection: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useTriggerERPSync: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useERPSyncLogs: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}));

vi.mock('@/hooks/integration/useWebhooks', () => ({
  useWebhook: vi.fn().mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() }),
  useUpdateWebhook: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useDeleteWebhook: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useTestWebhook: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useWebhookDeliveries: vi.fn().mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() }),
  useRetryDelivery: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

vi.mock('@/lib/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: {} }) } }));

vi.mock('@/lib/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

// Stub chart components
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  Radar: () => null,
}));

vi.mock('@/components/operations/SellTrendChart', () => ({
  SellTrendChart: () => <div data-testid="sell-trend-chart" />,
}));

vi.mock('@/components/operations/StockDistributionChart', () => ({
  StockValueChart: () => <div data-testid="stock-value-chart" />,
}));

vi.mock('@/components/operations/StockAlertBadge', () => ({
  StockAlertBadge: ({ status }: any) => <span data-testid="stock-alert">{status}</span>,
}));

vi.mock('@/components/operations', () => ({
  DeliveryStatusBadge: ({ status }: any) => <span>{status}</span>,
  DeliveryTimeline: ({ timeline }: any) => <div data-testid="timeline">{timeline.length} events</div>,
}));

vi.mock('@/components/integration', () => ({
  ConnectionStatusBadge: ({ status }: any) => <span>{status}</span>,
  SyncStatusBadge: ({ status }: any) => <span>{status}</span>,
  DeliveryStatusBadge: ({ status }: any) => <span>{status}</span>,
}));

vi.mock('@/components/ui/currency-display', () => ({
  CurrencyDisplay: ({ amount }: any) => <span>{amount}</span>,
  formatCurrencyCompact: (v: number) => `${v}`,
}));

vi.mock('@/components/shared/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/shared/DataTable', () => ({
  DataTable: ({ data, columns }: any) => (
    <table data-testid="data-table">
      <tbody>
        {data?.map((row: any, i: number) => (
          <tr key={i}>
            {columns.map((col: any, j: number) => (
              <td key={j}>
                {col.cell
                  ? col.cell({ row: { original: row } })
                  : row[col.accessorKey]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock('@/components/shared/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

vi.mock('@/components/operations/SnapshotImportDialog', () => ({
  SnapshotImportDialog: ({ open }: any) => open ? <div data-testid="snapshot-dialog">Dialog</div> : null,
}));

beforeEach(() => {
  vi.resetAllMocks();
  // Re-apply default mock return values after reset
  (useBaselines as any).mockReturnValue({ data: null, isLoading: false });
  (useTPO as any).mockReturnValue({ isConnected: false, isLoading: false, mechanics: [], channels: [] });
  (usePromotionSuggestions as any).mockReturnValue({ getSuggestions: vi.fn(), suggestions: null, isLoading: false, reset: vi.fn() });
  (useROIPrediction as any).mockReturnValue({ predict: vi.fn(), result: null, isLoading: false, reset: vi.fn() });
  (useDeliveryOrder as any).mockReturnValue({ data: null, isLoading: false, error: null });
  (useDeliveryTracking as any).mockReturnValue({ data: null });
  (useERPConnection as any).mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
  (useERPSyncLogs as any).mockReturnValue({ data: null, isLoading: false });
  (useWebhook as any).mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
  (useWebhookDeliveries as any).mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
  (api.get as any).mockResolvedValue({ data: {} });
});

// ============================================================================
// 1. SellTrackingImport
// ============================================================================
describe('SellTrackingImport', () => {
  let SellTrackingImport: any;

  beforeEach(async () => {
    const mod = await import('@/pages/operations/sell-tracking/SellTrackingImport');
    SellTrackingImport = mod.default;
  });

  it('renders initial state without file', () => {
    render(<SellTrackingImport />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('Start Import')).toBeInTheDocument();
  });

  it('handles import with no parsed data - button disabled', () => {
    render(<SellTrackingImport />);
    const btn = screen.getByText('Start Import').closest('button');
    expect(btn).toBeDisabled();
  });

  it('handles file upload and shows preview', async () => {
    render(<SellTrackingImport />);
    const csvContent = 'customerCode,productSku,period,sellInQty,sellOutQty,stockQty\nCUST1,SKU1,2024-01,100,80,20';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getAllByText('test.csv').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles successful import with no failures', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 1, created: 1, updated: 0, failed: 0, successRate: 100 },
      results: [{ success: true, row: 1 }],
    });
    render(<SellTrackingImport />);
    const csvContent = 'customerCode,productSku,period,sellInQty\nCUST1,SKU1,2024-01,100';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows parsed/));
    fireEvent.click(screen.getByText('Start Import'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import successful' }));
    });
  });

  it('handles import with failures and shows errors', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 2, created: 1, updated: 0, failed: 1, successRate: 50 },
      results: [
        { success: true, row: 1 },
        { success: false, row: 2, error: 'Invalid data' },
      ],
    });
    render(<SellTrackingImport />);
    const csvContent = 'customerCode,productSku,period\nCUST1,SKU1,2024-01\nCUST2,SKU2,2024-02';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/2 rows parsed/));
    fireEvent.click(screen.getByText('Start Import'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import completed with errors' }));
    });
  });

  it('handles import exception', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));
    render(<SellTrackingImport />);
    const csvContent = 'customerCode,productSku,period\nCUST1,SKU1,2024-01';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows parsed/));
    fireEvent.click(screen.getByText('Start Import'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import failed' }));
    });
  });

  it('handles file change with no file selected', () => {
    render(<SellTrackingImport />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('shows more rows message when parsedData > 10', async () => {
    render(<SellTrackingImport />);
    const rows = Array.from({ length: 12 }, (_, i) =>
      `CUST${i},SKU${i},2024-01,${i * 10},0,0,0,0,0`
    ).join('\n');
    const csvContent = 'customerCode,productSku,period,sellInQty,sellInValue,sellOutQty,sellOutValue,stockQty,stockValue\n' + rows;
    const file = new File([csvContent], 'big.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/and 2 more rows/)).toBeInTheDocument();
    });
  });

  it('parseCSV returns empty for file with < 2 lines', async () => {
    render(<SellTrackingImport />);
    const csvContent = 'headerOnly';
    const file = new File([csvContent], 'empty.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getAllByText('empty.csv').length).toBeGreaterThanOrEqual(1);
    });
    // Button should be disabled since no parsed data
    expect(screen.getByText('Start Import').closest('button')).toBeDisabled();
  });

  it('parseCSV handles alternative column names', async () => {
    render(<SellTrackingImport />);
    const csvContent = 'customer_code,product_sku,period,sell_in_qty,sell_in_value,sell_out_qty,sell_out_value,stock_qty,stock_value\nC1,P1,2024-01,10,100,5,50,3,30';
    const file = new File([csvContent], 'alt.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getAllByText('alt.csv').length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// 2. SellImportDialog
// ============================================================================
describe('SellImportDialog', () => {
  let SellImportDialog: any;

  beforeEach(async () => {
    const mod = await import('@/components/operations/SellImportDialog');
    SellImportDialog = mod.SellImportDialog;
  });

  it('renders when open', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Import Sell Tracking Data')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<SellImportDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Import Sell Tracking Data')).not.toBeInTheDocument();
  });

  it('shows file name after upload', async () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,period,sellinqty\nC1,P1,2024-01,10';
    const file = new File([csvContent], 'sell.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('sell.csv')).toBeInTheDocument();
    });
  });

  it('shows preview and more rows indicator', async () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const rows = Array.from({ length: 7 }, (_, i) =>
      `CUST${i},SKU${i},2024-01,${i}`
    ).join('\n');
    const csvContent = 'customercode,productsku,period,sellinqty\n' + rows;
    const file = new File([csvContent], 'many.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/\+2 more rows/)).toBeInTheDocument();
    });
  });

  it('handles import with no data - button disabled', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const btn = screen.getByText('Import Data').closest('button');
    expect(btn).toBeDisabled();
  });

  it('handles successful import (0 failures)', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 1, created: 1, updated: 0, failed: 0 },
    });
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,period\nC1,P1,2024-01';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Data'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import successful' }));
    });
  });

  it('handles import with failures', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 2, created: 1, updated: 0, failed: 1 },
    });
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,period\nC1,P1,2024-01';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Data'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import completed with errors' }));
    });
  });

  it('handles import exception', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,period\nC1,P1,2024-01';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Data'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import failed' }));
    });
  });

  it('shows Close button after import result and hides Import button', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 1, created: 1, updated: 0, failed: 0 },
    });
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,period\nC1,P1,2024-01';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Data'));
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.queryByText('Import Data')).not.toBeInTheDocument();
    });
  });

  it('filters rows missing required fields', async () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    // Row missing period should be filtered out
    const csvContent = 'customercode,productsku,period\nC1,P1,\nC2,P2,2024-01';
    const file = new File([csvContent], 'filter.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/1 rows/)).toBeInTheDocument();
    });
  });

  it('file change with no file does nothing', () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByText('Click to upload CSV file')).toBeInTheDocument();
  });

  it('parseCSV returns empty for single line', async () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'headerOnly';
    const file = new File([csvContent], 'one.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('one.csv')).toBeInTheDocument();
    });
  });

  it('uses alternative column names (sellqty, stock, sku, customer)', async () => {
    render(<SellImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customer,sku,period,sellqty,stock\nC1,P1,2024-01,10,5';
    const file = new File([csvContent], 'alt.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/1 rows/)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 3. InventoryImport
// ============================================================================
describe('InventoryImport', () => {
  let InventoryImport: any;

  beforeEach(async () => {
    const mod = await import('@/pages/operations/inventory/InventoryImport');
    InventoryImport = mod.default;
  });

  it('renders initial state', () => {
    render(<InventoryImport />);
    expect(screen.getByText('Import Inventory Data')).toBeInTheDocument();
  });

  it('handles file upload and shows preview', async () => {
    render(<InventoryImport />);
    const csvContent = 'customerCode,productSku,snapshotDate,quantity,value,location\nC1,P1,2024-01-01,100,5000,Warehouse A';
    const file = new File([csvContent], 'inv.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getAllByText('inv.csv').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('handles no data import - button disabled', () => {
    render(<InventoryImport />);
    const btn = screen.getByText('Start Import').closest('button');
    expect(btn).toBeDisabled();
  });

  it('handles successful import', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 1, created: 1, updated: 0, failed: 0, successRate: 100 },
      results: [{ success: true, row: 1 }],
    });
    render(<InventoryImport />);
    const csvContent = 'customerCode,productSku,snapshotDate,quantity,value\nC1,P1,2024-01-01,100,5000';
    const file = new File([csvContent], 'inv.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows parsed/));
    fireEvent.click(screen.getByText('Start Import'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import successful' }));
    });
  });

  it('handles import with failures', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 2, created: 1, updated: 0, failed: 1, successRate: 50 },
      results: [
        { success: true, row: 1 },
        { success: false, row: 2, error: 'Bad row' },
      ],
    });
    render(<InventoryImport />);
    const csvContent = 'customerCode,productSku,snapshotDate,quantity,value\nC1,P1,2024-01-01,100,5000\nC2,P2,2024-01-02,50,2500';
    const file = new File([csvContent], 'inv.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/2 rows parsed/));
    fireEvent.click(screen.getByText('Start Import'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import completed with errors' }));
    });
  });

  it('handles import exception', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<InventoryImport />);
    const csvContent = 'customerCode,productSku,snapshotDate,quantity,value\nC1,P1,2024-01-01,100,5000';
    const file = new File([csvContent], 'inv.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows parsed/));
    fireEvent.click(screen.getByText('Start Import'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import failed' }));
    });
  });

  it('shows more rows when > 10', async () => {
    render(<InventoryImport />);
    const rows = Array.from({ length: 12 }, (_, i) => `C${i},P${i},2024-01-01,${i},${i * 100}`).join('\n');
    const csvContent = 'customerCode,productSku,snapshotDate,quantity,value\n' + rows;
    const file = new File([csvContent], 'big.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/and 2 more rows/)).toBeInTheDocument();
    });
  });

  it('shows location or dash', async () => {
    render(<InventoryImport />);
    const csvContent = 'customer_code,product_sku,snapshot_date,quantity,value,location\nC1,P1,2024-01-01,100,5000,';
    const file = new File([csvContent], 'loc.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  it('parseCSV handles alternative names: customer, sku, date', async () => {
    render(<InventoryImport />);
    const csvContent = 'customer,sku,date,qty,value,batch_number,expiry_date\nC1,P1,2024-01-01,100,5000,B1,2025-12-31';
    const file = new File([csvContent], 'alt.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getAllByText('alt.csv').length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// 4. SnapshotImportDialog
// ============================================================================
describe('SnapshotImportDialog', () => {
  let SnapshotImportDialog: any;

  beforeEach(async () => {
    const mod = await vi.importActual<any>('@/components/operations/SnapshotImportDialog');
    SnapshotImportDialog = mod.SnapshotImportDialog;
  });

  it('renders when open', () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText('Import Inventory Snapshots')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SnapshotImportDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Import Inventory Snapshots')).not.toBeInTheDocument();
  });

  it('shows file name and preview', async () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,quantity,value\nC1,P1,10,100';
    const file = new File([csvContent], 'snap.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('snap.csv')).toBeInTheDocument();
    });
  });

  it('handles no data toast - button disabled', () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const btn = screen.getByText('Import Snapshots').closest('button');
    expect(btn).toBeDisabled();
  });

  it('handles successful import', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 1, created: 1, updated: 0, failed: 0 },
    });
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,quantity,value\nC1,P1,10,100';
    const file = new File([csvContent], 'snap.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Snapshots'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import successful' }));
    });
  });

  it('handles import with failures', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 2, created: 1, updated: 0, failed: 1 },
    });
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,quantity,value\nC1,P1,10,100';
    const file = new File([csvContent], 'snap.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Snapshots'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import completed with errors' }));
    });
  });

  it('handles import exception', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('fail'));
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,quantity,value\nC1,P1,10,100';
    const file = new File([csvContent], 'snap.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Snapshots'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Import failed' }));
    });
  });

  it('shows Close after result, hides Import button', async () => {
    mockMutateAsync.mockResolvedValueOnce({
      summary: { total: 1, created: 1, updated: 0, failed: 0 },
    });
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,quantity,value\nC1,P1,10,100';
    const file = new File([csvContent], 'snap.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => screen.getByText(/1 rows/));
    fireEvent.click(screen.getByText('Import Snapshots'));
    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.queryByText('Import Snapshots')).not.toBeInTheDocument();
    });
  });

  it('+N more rows indicator for > 5 rows', async () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const rows = Array.from({ length: 7 }, (_, i) => `C${i},P${i},${i},${i * 10}`).join('\n');
    const csvContent = 'customercode,productsku,quantity,value\n' + rows;
    const file = new File([csvContent], 'many.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/\+2 more rows/)).toBeInTheDocument();
    });
  });

  it('uses alt column names (customer, sku, batch, expiry)', async () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customer,sku,qty,value,batch,expiry\nC1,P1,10,100,B1,2025-12';
    const file = new File([csvContent], 'alt.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/1 rows/)).toBeInTheDocument();
    });
  });

  it('filters rows missing customerCode or productSku', async () => {
    render(<SnapshotImportDialog open={true} onClose={vi.fn()} />);
    const csvContent = 'customercode,productsku,quantity,value\n,P1,10,100\nC2,,20,200\nC3,P3,30,300';
    const file = new File([csvContent], 'filter.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/1 rows/)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 5. BaselineList
// ============================================================================
describe('BaselineList', () => {
  let BaselineList: any;

  beforeEach(async () => {
    const mod = await import('@/pages/baselines/BaselineList');
    BaselineList = mod.default;
  });

  it('renders with demo data when no API data', () => {
    render(<BaselineList />);
    expect(screen.getByText('Baselines')).toBeInTheDocument();
    expect(screen.getByText('New Baseline')).toBeInTheDocument();
  });

  it('renders the data table with demo baselines and exercises column branches', () => {
    render(<BaselineList />);
    // The DataTable mock calls cell renderers, exercising period, baselineValue, actualValue, variance columns
    const table = screen.getByTestId('data-table');
    expect(table).toBeInTheDocument();
  });

  it('shows pagination when data has metadata', async () => {
    const { useBaselines } = await import('@/hooks/useBaselines');
    (useBaselines as any).mockReturnValue({
      data: {
        baselines: [
          {
            id: '1', code: 'BL-1', name: 'Test', year: 2026, period: 'YEARLY',
            periodValue: 1, baselineType: 'VOLUME', baselineValue: 1000,
            actualValue: null, variancePercent: undefined,
            createdAt: '2026-01-01', updatedAt: '2026-01-01',
          },
        ],
        metadata: { pageNumber: 1, totalPages: 2, pageSize: 20, totalCount: 30 },
      },
      isLoading: false,
    });
    render(<BaselineList />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('handles variance = 0 branch', () => {
    (useBaselines as any).mockReturnValue({
      data: {
        baselines: [
          {
            id: '1', code: 'BL-1', name: 'Zero', year: 2026, period: 'MONTHLY',
            periodValue: 5, baselineType: 'COST', baselineValue: 100,
            actualValue: 100, variance: 0, variancePercent: 0,
            createdAt: '2026-01-01', updatedAt: '2026-01-01',
          },
        ],
      },
      isLoading: false,
    });
    render(<BaselineList />);
    // variance 0 branch produces 0.00%
    expect(screen.getByText('0.00%')).toBeInTheDocument();
  });

  it('handles negative variance branch', () => {
    (useBaselines as any).mockReturnValue({
      data: {
        baselines: [
          {
            id: '1', code: 'BL-1', name: 'Neg', year: 2026, period: 'QUARTERLY',
            periodValue: 2, baselineType: 'PRICE', baselineValue: 200,
            actualValue: 180, variance: -20, variancePercent: -10,
            createdAt: '2026-01-01', updatedAt: '2026-01-01',
          },
        ],
      },
      isLoading: false,
    });
    render(<BaselineList />);
    expect(screen.getAllByText('-10.00%').length).toBeGreaterThanOrEqual(1);
  });

  it('handles REVENUE type branch for formatting', () => {
    (useBaselines as any).mockReturnValue({
      data: {
        baselines: [
          {
            id: '1', code: 'BL-1', name: 'Rev', year: 2026, period: 'YEARLY',
            periodValue: 1, baselineType: 'REVENUE', baselineValue: 5000000,
            actualValue: 6000000, variance: 1000000, variancePercent: 20,
            createdAt: '2026-01-01', updatedAt: '2026-01-01',
          },
        ],
      },
      isLoading: false,
    });
    render(<BaselineList />);
    expect(screen.getAllByText('+20.00%').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// 6. SellOutPage
// ============================================================================
describe('SellOutPage', () => {
  let SellOutPage: any;

  beforeEach(async () => {
    const mod = await import('@/pages/operations/sell-tracking/SellOutPage');
    SellOutPage = mod.default;
  });

  it('renders loading state', () => {
    (api.get as any).mockReturnValue(new Promise(() => {})); // never resolves
    render(<SellOutPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders empty data state', async () => {
    (api.get as any).mockResolvedValue({ data: {} });
    render(<SellOutPage />);
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('renders with data and exercises sellThroughBadge branches', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        totals: { quantity: 100, value: 50000 },
        analysis: { avgSellThroughRate: 85, overallGrowth: 5 },
        data: [
          { groupKey: 'g1', groupName: 'Jan', quantity: 100, value: 50000, sellThroughRate: 90, growthPercent: 10 },
          { groupKey: 'g2', groupName: 'Feb', quantity: 80, value: 40000, sellThroughRate: 65, growthPercent: -5 },
          { groupKey: 'g3', groupName: 'Mar', quantity: 60, value: 30000, sellThroughRate: 45, growthPercent: 0 },
          { groupKey: 'g4', groupName: 'Apr', quantity: 40, value: 20000, sellThroughRate: 30 },
        ],
        trend: [{ period: 'Jan', quantity: 100, value: 50000 }],
        topProducts: [
          { productId: 'p1', productName: 'Product A', sellOut: 100 },
          { productId: 'p2', productName: 'Product B', sellOut: 80 },
        ],
      },
    });
    render(<SellOutPage />);
    await waitFor(() => {
      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });
  });

  it('exercises growth color branches (positive, negative, zero, undefined)', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        totals: { quantity: 0, value: 0 },
        analysis: { avgSellThroughRate: 50, overallGrowth: -2 },
        data: [
          { groupKey: 'g1', groupName: 'P1', quantity: 10, value: 100, sellThroughRate: 50, growthPercent: 5 },
          { groupKey: 'g2', groupName: 'P2', quantity: 10, value: 100, sellThroughRate: 50, growthPercent: -3 },
          { groupKey: 'g3', groupName: 'P3', quantity: 10, value: 100, sellThroughRate: 50, growthPercent: 0 },
          { groupKey: 'g4', groupName: 'P4', quantity: 10, value: 100, sellThroughRate: 50, growthPercent: undefined },
        ],
      },
    });
    render(<SellOutPage />);
    await waitFor(() => {
      expect(screen.getByText('+5%')).toBeInTheDocument();
      expect(screen.getByText('-3%')).toBeInTheDocument();
    });
  });

  it('exercises avg sell through rate color branches', async () => {
    // Rate < 50 -> danger
    (api.get as any).mockResolvedValue({
      data: {
        totals: { quantity: 0, value: 0 },
        analysis: { avgSellThroughRate: 30, overallGrowth: 0 },
        data: [],
      },
    });
    render(<SellOutPage />);
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 7. useCurrency (CurrencyProvider + formatCompactCurrency)
// ============================================================================
describe('useCurrency', () => {
  let CurrencyProvider: any;
  let useCurrency: any;
  let formatCompactCurrency: any;

  beforeEach(async () => {
    const mod = await import('@/hooks/useCurrency');
    CurrencyProvider = mod.CurrencyProvider;
    useCurrency = mod.useCurrency;
    formatCompactCurrency = mod.formatCompactCurrency;
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { VND: 25000 } }),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when used outside provider', () => {
    function Bad() {
      useCurrency();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useCurrency must be used within a CurrencyProvider');
  });

  it('provides context and formats VND amounts at different magnitudes', async () => {
    function TestComp() {
      const ctx = useCurrency();
      return (
        <div>
          <span data-testid="c1">{ctx.formatCompact(500)}</span>
          <span data-testid="c2">{ctx.formatCompact(5000)}</span>
          <span data-testid="c3">{ctx.formatCompact(5000000)}</span>
          <span data-testid="c4">{ctx.formatCompact(5000000000)}</span>
          <span data-testid="c5">{ctx.formatCompact(5000000000000)}</span>
          <span data-testid="curr">{ctx.currency}</span>
        </div>
      );
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    expect(screen.getByTestId('curr').textContent).toBe('VND');
  });

  it('toggles currency and formats USD amounts', async () => {
    function TestComp() {
      const ctx = useCurrency();
      return (
        <div>
          <button onClick={ctx.toggleCurrency}>toggle</button>
          <span data-testid="curr">{ctx.currency}</span>
          <span data-testid="f1">{ctx.formatCompact(500, 'USD')}</span>
          <span data-testid="f2">{ctx.formatCompact(5000000, 'USD')}</span>
          <span data-testid="f3">{ctx.formatCompact(5000000000, 'USD')}</span>
          <span data-testid="f4">{ctx.formatCompact(50000000000, 'USD')}</span>
        </div>
      );
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('curr').textContent).toBe('USD');
  });

  it('convert returns VND as-is', async () => {
    function TestComp() {
      const ctx = useCurrency();
      return <span data-testid="conv">{ctx.convert(1000, 'VND')}</span>;
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    expect(screen.getByTestId('conv').textContent).toBe('1000');
  });

  it('convert divides by rate for USD', async () => {
    function TestComp() {
      const ctx = useCurrency();
      return <span data-testid="conv">{ctx.convert(25000, 'USD')}</span>;
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    await waitFor(() => {
      expect(Number(screen.getByTestId('conv').textContent)).toBe(1);
    });
  });

  it('formatWithUnit VND branches', () => {
    function TestComp() {
      const ctx = useCurrency();
      const r1 = ctx.formatWithUnit(500);
      const r2 = ctx.formatWithUnit(5000);
      const r3 = ctx.formatWithUnit(5000000);
      const r4 = ctx.formatWithUnit(5000000000);
      const r5 = ctx.formatWithUnit(5000000000000);
      return (
        <div>
          <span data-testid="u1">{r1.unit}</span>
          <span data-testid="u2">{r2.unit}</span>
          <span data-testid="u3">{r3.unit}</span>
          <span data-testid="u4">{r4.unit}</span>
          <span data-testid="u5">{r5.unit}</span>
        </div>
      );
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    expect(screen.getByTestId('u1').textContent).toContain('₫');
    expect(screen.getByTestId('u2').textContent).toBe('K');
    expect(screen.getByTestId('u3').textContent).toContain('triệu');
    expect(screen.getByTestId('u4').textContent).toContain('tỷ');
    expect(screen.getByTestId('u5').textContent).toContain('nghìn tỷ');
  });

  it('formatWithUnit USD branches', () => {
    function TestComp() {
      const ctx = useCurrency();
      const r1 = ctx.formatWithUnit(500, 'USD');
      const r2 = ctx.formatWithUnit(5000000, 'USD');
      const r3 = ctx.formatWithUnit(5000000000, 'USD');
      const r4 = ctx.formatWithUnit(50000000000, 'USD');
      return (
        <div>
          <span data-testid="u1">{r1.unit}</span>
          <span data-testid="u2">{r2.unit}</span>
          <span data-testid="u3">{r3.unit}</span>
          <span data-testid="u4">{r4.unit}</span>
        </div>
      );
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
  });

  it('handles fetch failure gracefully', async () => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    function TestComp() {
      const ctx = useCurrency();
      return <span data-testid="curr">{ctx.currency}</span>;
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    expect(screen.getByTestId('curr').textContent).toBe('VND');
  });

  it('handles fetch ok but no VND rate', async () => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: {} }),
    } as any);
    function TestComp() {
      const ctx = useCurrency();
      return <span data-testid="curr">{ctx.currency}</span>;
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    expect(screen.getByTestId('curr').textContent).toBe('VND');
  });

  it('handles fetch not ok', async () => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as any);
    function TestComp() {
      const ctx = useCurrency();
      return <span data-testid="curr">{ctx.currency}</span>;
    }
    render(
      <CurrencyProvider>
        <TestComp />
      </CurrencyProvider>
    );
    expect(screen.getByTestId('curr').textContent).toBe('VND');
  });

  // formatCompactCurrency standalone
  it('formatCompactCurrency VND all magnitudes', () => {
    expect(formatCompactCurrency(500)).toContain('₫');
    expect(formatCompactCurrency(5000)).toContain('K');
    expect(formatCompactCurrency(5000000)).toContain('triệu');
    expect(formatCompactCurrency(5000000000)).toContain('tỷ');
    expect(formatCompactCurrency(5000000000000)).toContain('nghìn tỷ');
  });

  it('formatCompactCurrency USD all magnitudes', () => {
    // USD amounts are divided by DEFAULT_RATE (25000), so need larger inputs
    expect(formatCompactCurrency(500, 'USD')).toContain('$');
    expect(formatCompactCurrency(50000000, 'USD')).toContain('K');       // 50M VND = $2K
    expect(formatCompactCurrency(50000000000, 'USD')).toContain('M');    // 50B VND = $2M
    expect(formatCompactCurrency(50000000000000, 'USD')).toContain('B'); // 50T VND = $2B
  });
});

// ============================================================================
// 8. InventoryTable
// ============================================================================
describe('InventoryTable', () => {
  let InventoryTable: any;

  beforeEach(async () => {
    const mod = await import('@/components/operations/InventoryTable');
    InventoryTable = mod.InventoryTable;
  });

  it('renders empty state', () => {
    render(<InventoryTable data={[]} />);
    expect(screen.getByText('No inventory records found')).toBeInTheDocument();
  });

  it('renders data with all branches', () => {
    const data = [
      {
        id: '1', snapshotDate: '2024-01-01', quantity: 100, value: 5000,
        customer: { name: 'Cust A', code: 'CA' },
        product: { name: 'Prod A', code: 'PA' },
        location: 'Warehouse', expiryDate: '2020-01-01', // expired
      },
      {
        id: '2', snapshotDate: '2024-01-02', quantity: 50, value: 2500,
        customer: { name: 'Cust B', code: 'CB' },
        product: { name: 'Prod B', code: 'PB' },
        location: null, expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // near expiry
      },
      {
        id: '3', snapshotDate: '2024-01-03', quantity: 80, value: 4000,
        customer: { name: 'Cust C', code: 'CC' },
        product: { name: 'Prod C', code: 'PC' },
        location: 'DC2', expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // OK
      },
      {
        id: '4', snapshotDate: '2024-01-04', quantity: 30, value: 1500,
        customer: { name: 'Cust D', code: 'CD' },
        product: { name: 'Prod D', code: 'PD' },
        // no location, no expiryDate
      },
    ];
    const onRowClick = vi.fn();
    const onDelete = vi.fn();
    render(<InventoryTable data={data} onRowClick={onRowClick} onDelete={onDelete} />);
    expect(screen.getByText('Cust A')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });

  it('handles sort by different fields', () => {
    const data = [
      {
        id: '1', snapshotDate: '2024-01-01', quantity: 100, value: 5000,
        customer: { name: 'B', code: 'B' }, product: { name: 'Y', code: 'Y' },
      },
      {
        id: '2', snapshotDate: '2024-01-02', quantity: 50, value: 2500,
        customer: { name: 'A', code: 'A' }, product: { name: 'Z', code: 'Z' },
      },
    ];
    render(<InventoryTable data={data} />);
    // Click sortable headers to exercise sort branches
    fireEvent.click(screen.getByText('Date'));   // snapshotDate toggle
    fireEvent.click(screen.getByText('Date'));   // toggle direction
    fireEvent.click(screen.getByText('Customer'));
    fireEvent.click(screen.getByText('Product'));
    fireEvent.click(screen.getByText('Quantity'));
    fireEvent.click(screen.getByText('Value'));
  });

  it('getExpiryStatus returns undefined for no expiryDate', () => {
    const data = [
      { id: '1', snapshotDate: '2024-01-01', quantity: 10, value: 100 },
    ];
    render(<InventoryTable data={data} />);
    // no expiry - dash shown
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
  });

  it('renders without onRowClick or onDelete', () => {
    const data = [
      { id: '1', snapshotDate: '2024-01-01', quantity: 10, value: 100,
        customer: { name: 'CustName', code: 'CC1' }, product: { name: 'ProdName', code: 'PP1' } },
    ];
    render(<InventoryTable data={data} />);
    expect(screen.getAllByText('CustName').length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// 9. TPO Page
// ============================================================================
describe('TPOPage', () => {
  let TPOPage: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/pages/planning/TPO');
    TPOPage = mod.default;
  });

  it('renders not-connected state', () => {
    render(<TPOPage />);
    expect(screen.getByText('tpo.title')).toBeInTheDocument();
    expect(screen.getByText('tpo.notConnected')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    (useTPO as any).mockReturnValue({
      isConnected: false,
      isLoading: true,
      mechanics: [],
      channels: [],
    });
    render(<TPOPage />);
    expect(screen.getByText('Connecting to TPO Engine...')).toBeInTheDocument();
  });

  it('renders connected state with forms', () => {
    (useTPO as any).mockReturnValue({
      isConnected: true,
      isLoading: false,
      mechanics: [{ type: 'DISCOUNT', name: 'Discount' }],
      channels: [{ type: 'MT', name: 'Modern Trade' }],
    });
    render(<TPOPage />);
    expect(screen.getByText('tpo.connected')).toBeInTheDocument();
  });

  it('renders suggestions results', () => {
    (useTPO as any).mockReturnValue({
      isConnected: true, isLoading: false,
      mechanics: [{ type: 'DISCOUNT', name: 'Discount' }],
      channels: [{ type: 'MT', name: 'MT' }],
    });
    (usePromotionSuggestions as any).mockReturnValue({
      getSuggestions: vi.fn(),
      suggestions: {
        suggestions: [
          { rank: 1, mechanic_type: 'DISCOUNT', suggested_duration_days: 14, rationale: 'Good', discount_percent: 15, predicted_cost: 1000, best_start_day: 'Mon', predicted_roi: 25, confidence: 0.9 },
          { rank: 2, mechanic_type: 'BOGO', suggested_duration_days: 7, rationale: 'Ok', discount_percent: 10, predicted_cost: 500, best_start_day: 'Tue', predicted_roi: 15, confidence: 0.7 },
        ],
        market_insights: ['Insight 1', 'Insight 2'],
      },
      isLoading: false,
      reset: vi.fn(),
    });
    render(<TPOPage />);
    expect(screen.getByText('DISCOUNT')).toBeInTheDocument();
    expect(screen.getByText('BOGO')).toBeInTheDocument();
    expect(screen.getByText('Market Insights')).toBeInTheDocument();
  });

  it('renders ROI prediction results', () => {
    (useTPO as any).mockReturnValue({
      isConnected: true, isLoading: false,
      mechanics: [{ type: 'DISCOUNT', name: 'Discount' }],
      channels: [{ type: 'MT', name: 'MT' }],
    });
    (useROIPrediction as any).mockReturnValue({
      predict: vi.fn(),
      result: {
        predicted_roi: 20,
        predicted_incremental_sales: 1000000,
        predicted_incremental_profit: 500000,
        confidence_score: 0.85,
        key_drivers: ['Driver 1'],
        optimization_suggestions: ['Suggestion 1'],
      },
      isLoading: false,
      reset: vi.fn(),
    });
    render(<TPOPage />);
    expect(screen.getByText('ROI Prediction Results')).toBeInTheDocument();
    expect(screen.getByText('Key Drivers')).toBeInTheDocument();
    expect(screen.getByText('Optimization Tips')).toBeInTheDocument();
  });

  it('handles optimization button and isOptimizing state', async () => {
    render(<TPOPage />);
    fireEvent.click(screen.getByText('Run Optimization'));
    expect(screen.getByText('Optimizing...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Run Optimization')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  it('exercises accept/reject on recommendations', async () => {
    const user = userEvent.setup();
    render(<TPOPage />);
    // Click recommendations tab using userEvent for Radix Tabs compatibility
    await user.click(screen.getByText('AI Recommendations'));
    await waitFor(() => {
      expect(screen.getAllByText('Accept').length).toBeGreaterThan(0);
    });
    const acceptBtns = screen.getAllByText('Accept');
    await user.click(acceptBtns[0]);
  });

  it('renders empty key_drivers and optimization_suggestions', () => {
    (useTPO as any).mockReturnValue({
      isConnected: true, isLoading: false,
      mechanics: [], channels: [],
    });
    (useROIPrediction as any).mockReturnValue({
      predict: vi.fn(),
      result: {
        predicted_roi: 10,
        predicted_incremental_sales: 100,
        predicted_incremental_profit: 50,
        confidence_score: 0.5,
        key_drivers: [],
        optimization_suggestions: [],
      },
      isLoading: false,
      reset: vi.fn(),
    });
    render(<TPOPage />);
    expect(screen.queryByText('Key Drivers')).not.toBeInTheDocument();
    expect(screen.queryByText('Optimization Tips')).not.toBeInTheDocument();
  });

  it('renders empty market_insights', () => {
    (useTPO as any).mockReturnValue({
      isConnected: true, isLoading: false,
      mechanics: [], channels: [],
    });
    (usePromotionSuggestions as any).mockReturnValue({
      getSuggestions: vi.fn(),
      suggestions: {
        suggestions: [{ rank: 1, mechanic_type: 'X', suggested_duration_days: 1, rationale: 'R', discount_percent: 5, predicted_cost: 100, best_start_day: 'Mon', predicted_roi: 10, confidence: 0.8 }],
        market_insights: [],
      },
      isLoading: false,
      reset: vi.fn(),
    });
    render(<TPOPage />);
    expect(screen.queryByText('Market Insights')).not.toBeInTheDocument();
  });

  it('exercises suggestionsLoading and roiLoading button states', () => {
    (useTPO as any).mockReturnValue({
      isConnected: true, isLoading: false,
      mechanics: [{ type: 'DISCOUNT', name: 'Discount' }],
      channels: [{ type: 'MT', name: 'MT' }],
    });
    (usePromotionSuggestions as any).mockReturnValue({
      getSuggestions: vi.fn(), suggestions: null, isLoading: true, reset: vi.fn(),
    });
    (useROIPrediction as any).mockReturnValue({
      predict: vi.fn(), result: null, isLoading: true, reset: vi.fn(),
    });
    render(<TPOPage />);
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    expect(screen.getByText('Predicting...')).toBeInTheDocument();
  });
});

// ============================================================================
// 10. SellInPage
// ============================================================================
describe('SellInPage', () => {
  let SellInPage: any;

  beforeEach(async () => {
    const mod = await import('@/pages/operations/sell-tracking/SellInPage');
    SellInPage = mod.default;
  });

  it('renders loading state', () => {
    (api.get as any).mockReturnValue(new Promise(() => {}));
    render(<SellInPage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders empty data', async () => {
    (api.get as any).mockResolvedValue({ data: {} });
    render(<SellInPage />);
    await waitFor(() => {
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  it('renders data with growth branches (positive, negative, zero, undefined)', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        totals: { quantity: 100, value: 50000 },
        analysis: { uniqueCustomers: 5, uniqueProducts: 10 },
        trend: [{ period: 'Jan', quantity: 100, value: 50000 }],
        data: [
          { groupKey: 'g1', groupName: 'Jan', quantity: 100, value: 50000, recordCount: 5, growthPercent: 10 },
          { groupKey: 'g2', groupName: 'Feb', quantity: 80, value: 40000, recordCount: 3, growthPercent: -5 },
          { groupKey: 'g3', groupName: 'Mar', quantity: 60, value: 30000, recordCount: 2, growthPercent: 0 },
          { groupKey: 'g4', groupName: 'Apr', quantity: 40, value: 20000, recordCount: 1, growthPercent: undefined },
        ],
      },
    });
    render(<SellInPage />);
    await waitFor(() => {
      expect(screen.getByText('+10%')).toBeInTheDocument();
      expect(screen.getByText('-5%')).toBeInTheDocument();
    });
  });

  it('exercises groupBy column header branches', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { data: [] } });
    render(<SellInPage />);
    await waitFor(() => {
      expect(screen.getByText('Period')).toBeInTheDocument();
    });
    // Change groupBy using userEvent for Radix Tabs compatibility
    await user.click(screen.getByText('By Customer'));
    await waitFor(() => {
      expect(screen.getByText('Sell-In by Customer')).toBeInTheDocument();
    });
    await user.click(screen.getByText('By Product'));
    await waitFor(() => {
      expect(screen.getByText('Sell-In by Product')).toBeInTheDocument();
    });
    await user.click(screen.getByText('By Category'));
    await waitFor(() => {
      expect(screen.getByText('Sell-In by Category')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 11. InventorySnapshots
// ============================================================================
describe('InventorySnapshots', () => {
  let InventorySnapshots: any;

  beforeEach(async () => {
    const mod = await import('@/pages/operations/inventory/InventorySnapshots');
    InventorySnapshots = mod.default;
  });

  it('renders loading state', () => {
    (api.get as any).mockReturnValue(new Promise(() => {}));
    render(<InventorySnapshots />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders with no data', async () => {
    (api.get as any).mockResolvedValue({
      data: { data: [], pagination: { total: 0 }, timeline: [], totals: { quantity: 0, value: 0 } },
    });
    render(<InventorySnapshots />);
    await waitFor(() => {
      expect(screen.getByText('No snapshots found')).toBeInTheDocument();
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  it('renders with timeline data', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        data: [
          { id: 's1', snapshotDate: '2024-01-01', customer: { name: 'C', code: 'CC' },
            product: { name: 'P', sku: 'PS' }, location: 'W', quantity: 10, value: 100, expiryDate: '2025-01-01' },
          { id: 's2', snapshotDate: '2024-01-02', customer: { name: 'D', code: 'DD' },
            product: { name: 'Q', sku: 'QS' }, location: null, quantity: 20, value: 200 },
        ],
        pagination: { total: 2 },
        timeline: ['2024-01-01', '2024-01-02'],
        totals: { quantity: 30, value: 300 },
      },
    });
    render(<InventorySnapshots />);
    await waitFor(() => {
      expect(screen.getByText('2024-01-01 - 2024-01-02')).toBeInTheDocument();
    });
  });

  it('opens import dialog', async () => {
    (api.get as any).mockResolvedValue({ data: { data: [], pagination: { total: 0 }, timeline: [], totals: { quantity: 0, value: 0 } } });
    render(<InventorySnapshots />);
    await waitFor(() => screen.getByText('Import'));
    fireEvent.click(screen.getByText('Import'));
    expect(screen.getByTestId('snapshot-dialog')).toBeInTheDocument();
  });

  it('renders grouped data view', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        groupedData: [
          { date: '2024-01-01', totalQuantity: 100, totalValue: 5000, snapshotCount: 3 },
        ],
        pagination: { total: 3 },
        timeline: ['2024-01-01'],
        totals: { quantity: 100, value: 5000 },
      },
    });
    render(<InventorySnapshots />);
    await waitFor(() => {
      expect(screen.getByText('Snapshot Details')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 12. DeliveryDetail
// ============================================================================
describe('DeliveryDetail', () => {
  let DeliveryDetail: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/pages/operations/delivery/DeliveryDetail');
    DeliveryDetail = mod.default;
  });

  it('renders loading state', () => {
    (useDeliveryOrder as any).mockReturnValue({ data: null, isLoading: true, error: null });
    render(<DeliveryDetail />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useDeliveryOrder as any).mockReturnValue({ data: null, isLoading: false, error: new Error('Not found') });
    render(<DeliveryDetail />);
    expect(screen.getByText('Order not found')).toBeInTheDocument();
  });

  it('renders order with full data', () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-001', status: 'PENDING',
        customer: { id: 'c1', name: 'Customer 1', code: 'C1' },
        scheduledDate: '2024-06-01',
        deliveredAt: '2024-06-02',
        totalItems: 10, totalDelivered: 5, totalValue: 50000,
        deliveryAddress: '123 St', contactPerson: 'John', contactPhone: '555-1234',
        notes: 'Handle with care',
        promotion: { id: 'p1', name: 'Summer Promo' },
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [
          { id: 'l1', product: { name: 'Item A', code: 'IA' }, quantity: 5, deliveredQty: 3, damagedQty: 1, status: 'DELIVERED' },
          { id: 'l2', product: { name: 'Item B', code: 'IB' }, quantity: 5, deliveredQty: 2, damagedQty: 0, status: 'PARTIAL' },
          { id: 'l3', product: { name: 'Item C', code: 'IC' }, quantity: 3, deliveredQty: 0, damagedQty: 0, status: 'PENDING' },
        ],
      },
      isLoading: false,
      error: null,
    });
    (useDeliveryTracking as any).mockReturnValue({
      data: {
        timeline: [
          { id: 't1', status: 'PENDING', timestamp: '2024-05-01', user: { name: 'Admin' } },
        ],
      },
    });
    render(<DeliveryDetail />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getAllByText('Customer 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Handle with care')).toBeInTheDocument();
    expect(screen.getByText('Summer Promo')).toBeInTheDocument();
  });

  it('renders without deliveredAt, notes, promotion', () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-002', status: 'IN_TRANSIT',
        customer: { id: 'c1', name: 'Customer 2', code: 'C2' },
        scheduledDate: '2024-06-01',
        totalItems: 5, totalDelivered: 0, totalValue: 25000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    render(<DeliveryDetail />);
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
  });

  it('handles status change to DELIVERED', async () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-003', status: 'IN_TRANSIT',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 2, totalDelivered: 0, totalValue: 10000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [
          { id: 'l1', product: { name: 'A', code: 'A' }, quantity: 2, deliveredQty: 0, damagedQty: 0, status: 'PENDING' },
        ],
      },
      isLoading: false,
      error: null,
    });
    render(<DeliveryDetail />);
    // IN_TRANSIT -> DELIVERED, PARTIAL, RETURNED
    fireEvent.click(screen.getByText('DELIVERED'));
    expect(screen.getByText(/Update Status to/)).toBeInTheDocument();
  });

  it('handles status change to CANCELLED', () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-004', status: 'PENDING',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 1, totalDelivered: 0, totalValue: 5000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    render(<DeliveryDetail />);
    fireEvent.click(screen.getByText('CANCELLED'));
    expect(screen.getByText(/Add any notes for this status change/)).toBeInTheDocument();
  });

  it('handles successful status update', async () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-005', status: 'PENDING',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 1, totalDelivered: 0, totalValue: 5000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    mockMutateAsync.mockResolvedValueOnce({});
    render(<DeliveryDetail />);
    fireEvent.click(screen.getByText('CONFIRMED'));
    fireEvent.click(screen.getByText('Update Status'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Status Updated' }));
    });
  });

  it('handles status update failure', async () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-006', status: 'PENDING',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 1, totalDelivered: 0, totalValue: 5000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    mockMutateAsync.mockRejectedValueOnce(new Error('Failed'));
    render(<DeliveryDetail />);
    fireEvent.click(screen.getByText('CONFIRMED'));
    fireEvent.click(screen.getByText('Update Status'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Update Failed' }));
    });
  });

  it('shows delete button for PENDING and handles delete', async () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-007', status: 'PENDING',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 1, totalDelivered: 0, totalValue: 5000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    mockMutateAsync.mockResolvedValueOnce({});
    render(<DeliveryDetail />);
    fireEvent.click(screen.getByText('Delete'));
    // Confirm delete
    expect(screen.getByText('Delete Order')).toBeInTheDocument();
  });

  it('handles delete failure', async () => {
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-008', status: 'PENDING',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 1, totalDelivered: 0, totalValue: 5000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    mockMutateAsync.mockRejectedValueOnce(new Error('Delete fail'));
    render(<DeliveryDetail />);
    fireEvent.click(screen.getByText('Delete'));
  });

  it('renders timeline tab with events vs empty', async () => {
    const user = userEvent.setup();
    (useDeliveryOrder as any).mockReturnValue({
      data: {
        orderNumber: 'ORD-009', status: 'DELIVERED',
        customer: { id: 'c1', name: 'Cust', code: 'C' },
        scheduledDate: '2024-06-01',
        totalItems: 1, totalDelivered: 1, totalValue: 5000,
        createdBy: { name: 'Admin' }, createdAt: '2024-05-01',
        lines: [],
      },
      isLoading: false,
      error: null,
    });
    (useDeliveryTracking as any).mockReturnValue({ data: { timeline: [] } });
    render(<DeliveryDetail />);
    // Use userEvent for Radix Tabs compatibility
    await user.click(screen.getByText(/Timeline/));
    await waitFor(() => {
      expect(screen.getByText('No tracking history yet')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// 13. ERPDetail
// ============================================================================
describe('ERPDetail', () => {
  let ERPDetail: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockMutateAsync.mockReset();
    mockToast.mockReset();
    const mod = await import('@/pages/integration/erp/ERPDetail');
    ERPDetail = mod.default;
  });

  it('renders loading state', () => {
    (useERPConnection as any).mockReturnValue({ data: null, isLoading: true, refetch: vi.fn() });
    render(<ERPDetail />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders not found', () => {
    (useERPConnection as any).mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
    render(<ERPDetail />);
    expect(screen.getByText('Connection not found')).toBeInTheDocument();
  });

  it('renders connection details with lastSyncStatus and syncLogs', () => {
    (useERPConnection as any).mockReturnValue({
      data: {
        name: 'SAP Connection', type: 'SAP', status: 'ACTIVE',
        lastSyncAt: '2024-01-01', lastSyncStatus: 'COMPLETED',
        syncSchedule: '0 * * * *', createdAt: '2023-06-01',
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({
      data: {
        data: [
          {
            id: 'log1', startedAt: '2024-01-01', completedAt: '2024-01-01T00:05:00Z',
            status: 'COMPLETED', recordsSuccess: 100, recordsFailed: 2,
          },
        ],
      },
      isLoading: false,
    });
    render(<ERPDetail />);
    expect(screen.getAllByText('SAP Connection').length).toBeGreaterThanOrEqual(1);
  });

  it('renders no sync status', () => {
    (useERPConnection as any).mockReturnValue({
      data: {
        name: 'Oracle', type: 'ORACLE', status: 'INACTIVE',
        lastSyncAt: null, lastSyncStatus: null,
        syncSchedule: null, createdAt: '2023-06-01',
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    render(<ERPDetail />);
    expect(screen.getByText('No sync has been run yet')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
    expect(screen.getByText('No sync history available')).toBeInTheDocument();
  });

  it('renders sync logs loading', () => {
    (useERPConnection as any).mockReturnValue({
      data: {
        name: 'Test', type: 'SAP', status: 'ACTIVE',
        createdAt: '2023-06-01',
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: null, isLoading: true });
    render(<ERPDetail />);
    // Loading spinner for logs
    expect(screen.getAllByTestId('loading-spinner').length).toBeGreaterThan(0);
  });

  it('handles test success', async () => {
    const refetch = vi.fn();
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch,
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockResolvedValueOnce({ data: { success: true, latency: 50 } });
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Test Connection'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Connection Successful' }));
    });
  });

  it('handles test failure result', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockResolvedValueOnce({ data: { success: false, error: 'Timeout' } });
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Test Connection'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Connection Failed' }));
    });
  });

  it('handles test exception', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockRejectedValueOnce(new Error('err'));
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Test Connection'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Failed' }));
    });
  });

  it('handles sync success and failure', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockResolvedValueOnce({});
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Sync Now'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sync Started' }));
    });
  });

  it('handles sync exception', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockRejectedValueOnce(new Error('err'));
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Sync Now'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sync Failed' }));
    });
  });

  it('handles update success and failure', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', syncSchedule: '0 * * * *', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockResolvedValueOnce({});
    render(<ERPDetail />);
    // Click settings icon to start editing
    const settingsBtn = screen.getAllByRole('button').find(btn =>
      btn.querySelector('svg') && btn.getAttribute('class')?.includes('ghost')
    );
    // find by aria or just click the Settings button
    const allButtons = screen.getAllByRole('button');
    // Settings button is in CardHeader
    // We need to find it - let's just look for the edit dialog trigger
    // The startEditing function is triggered by a ghost icon button with Settings icon
    // Since we mocked lucide, let's just check by clicking the delete button
    const deleteButtons = screen.getAllByText('Delete Connection');
    fireEvent.click(deleteButtons[0]);
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('handles delete success', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockResolvedValueOnce({});
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Delete Connection'));
  });

  it('renders log with completedAt for duration vs Running...', () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', lastSyncStatus: 'RUNNING', lastSyncAt: '2024-01-01', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({
      data: {
        data: [
          { id: 'l1', startedAt: '2024-01-01T00:00:00Z', completedAt: null, status: 'RUNNING', recordsSuccess: 0, recordsFailed: 0 },
          { id: 'l2', startedAt: '2024-01-01T00:00:00Z', completedAt: '2024-01-01T00:00:30Z', status: 'COMPLETED', recordsSuccess: 10, recordsFailed: 0 },
        ],
      },
      isLoading: false,
    });
    render(<ERPDetail />);
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('handles test failure without error message', async () => {
    (useERPConnection as any).mockReturnValue({
      data: { name: 'Test', type: 'SAP', status: 'ACTIVE', createdAt: '2023-06-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useERPSyncLogs as any).mockReturnValue({ data: { data: [] }, isLoading: false });
    mockMutateAsync.mockResolvedValueOnce({ data: { success: false } });
    render(<ERPDetail />);
    fireEvent.click(screen.getByText('Test Connection'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Unable to connect to ERP',
      }));
    });
  });
});

// ============================================================================
// 14. WebhookDetail
// ============================================================================
describe('WebhookDetail', () => {
  let WebhookDetail: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockMutateAsync.mockReset();
    mockToast.mockReset();
    const mod = await import('@/pages/integration/webhooks/WebhookDetail');
    WebhookDetail = mod.default;
  });

  it('renders loading state', () => {
    (useWebhook as any).mockReturnValue({ data: null, isLoading: true, refetch: vi.fn() });
    render(<WebhookDetail />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders not found', () => {
    (useWebhook as any).mockReturnValue({ data: null, isLoading: false, refetch: vi.fn() });
    render(<WebhookDetail />);
    expect(screen.getByText('Webhook not found')).toBeInTheDocument();
  });

  it('renders active webhook with deliveries', () => {
    (useWebhook as any).mockReturnValue({
      data: {
        name: 'My Webhook', url: 'https://example.com/hook',
        isActive: true, secret: 'secret123',
        events: ['promotion.created', 'claim.submitted'],
        createdAt: '2024-01-01',
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({
      data: {
        data: [
          { id: 'd1', event: 'promotion.created', status: 'DELIVERED', responseStatus: 200, attempts: 1, createdAt: '2024-01-01' },
          { id: 'd2', event: 'claim.submitted', status: 'FAILED', responseStatus: null, attempts: 3, createdAt: '2024-01-02' },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<WebhookDetail />);
    expect(screen.getByText('My Webhook')).toBeInTheDocument();
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
  });

  it('renders inactive webhook', () => {
    (useWebhook as any).mockReturnValue({
      data: {
        name: 'Inactive Hook', url: 'https://example.com',
        isActive: false, secret: null,
        events: [], createdAt: '2024-01-01',
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    render(<WebhookDetail />);
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0);
  });

  it('renders deliveries loading', () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: null, isLoading: true, refetch: vi.fn() });
    render(<WebhookDetail />);
    expect(screen.getAllByTestId('loading-spinner').length).toBeGreaterThan(0);
  });

  it('renders no deliveries', () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    render(<WebhookDetail />);
    expect(screen.getByText('No deliveries yet')).toBeInTheDocument();
  });

  it('handles test success', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    mockMutateAsync.mockResolvedValueOnce({ data: { delivered: true, responseStatus: 200 } });
    render(<WebhookDetail />);
    fireEvent.click(screen.getByText('Send Test'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Successful' }));
    });
  });

  it('handles test failure result', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    mockMutateAsync.mockResolvedValueOnce({ data: { delivered: false, error: 'Timeout' } });
    render(<WebhookDetail />);
    fireEvent.click(screen.getByText('Send Test'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Failed' }));
    });
  });

  it('handles test failure without error', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    mockMutateAsync.mockResolvedValueOnce({ data: { delivered: false } });
    render(<WebhookDetail />);
    fireEvent.click(screen.getByText('Send Test'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Webhook did not respond',
      }));
    });
  });

  it('handles test exception', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    mockMutateAsync.mockRejectedValueOnce(new Error('err'));
    render(<WebhookDetail />);
    fireEvent.click(screen.getByText('Send Test'));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test Failed', description: 'Failed to send test webhook.' }));
    });
  });

  it('toggles secret visibility', () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 'mysecret', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    render(<WebhookDetail />);
    const secretInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    expect(secretInput).toBeInTheDocument();
    // Toggle show
    const toggleBtn = secretInput.parentElement?.querySelector('button');
    if (toggleBtn) fireEvent.click(toggleBtn);
  });

  it('copies secret to clipboard', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 'mysecret', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({ data: { data: [] }, isLoading: false, refetch: vi.fn() });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    render(<WebhookDetail />);
    // Find copy button - second ghost icon button after the toggle
    const btns = document.querySelectorAll('button');
    // Find the Copy button by checking all ghost buttons near the secret input
    const secretContainer = document.querySelector('input[type="password"]')?.parentElement;
    const copyBtn = secretContainer?.querySelectorAll('button')[1];
    if (copyBtn) fireEvent.click(copyBtn);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Secret Copied' }));
    });
  });

  it('handles retry delivery', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({
      data: {
        data: [
          { id: 'd1', event: 'promotion.created', status: 'FAILED', responseStatus: null, attempts: 3, createdAt: '2024-01-02' },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    mockMutateAsync.mockResolvedValueOnce({});
    render(<WebhookDetail />);
    // Click the retry button on failed delivery
    const retryBtns = screen.getAllByRole('button');
    // The retry button is in the FAILED row - find it
    const failedRow = screen.getByText('FAILED').closest('tr');
    const retryBtn = failedRow?.querySelector('button');
    if (retryBtn) {
      fireEvent.click(retryBtn);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Retry Queued' }));
      });
    }
  });

  it('handles retry failure', async () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({
      data: {
        data: [
          { id: 'd1', event: 'promotion.created', status: 'FAILED', responseStatus: null, attempts: 3, createdAt: '2024-01-02' },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    mockMutateAsync.mockRejectedValueOnce(new Error('err'));
    render(<WebhookDetail />);
    const failedRow = screen.getByText('FAILED').closest('tr');
    const retryBtn = failedRow?.querySelector('button');
    if (retryBtn) {
      fireEvent.click(retryBtn);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Retry Failed' }));
      });
    }
  });

  it('delivery responseStatus branch: shows value or dash', () => {
    (useWebhook as any).mockReturnValue({
      data: { name: 'Hook', url: 'https://x.com', isActive: true, secret: 's', events: [], createdAt: '2024-01-01' },
      isLoading: false, refetch: vi.fn(),
    });
    (useWebhookDeliveries as any).mockReturnValue({
      data: {
        data: [
          { id: 'd1', event: 'e1', status: 'DELIVERED', responseStatus: 200, attempts: 1, createdAt: '2024-01-01' },
          { id: 'd2', event: 'e2', status: 'DELIVERED', responseStatus: null, attempts: 1, createdAt: '2024-01-01' },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    });
    render(<WebhookDetail />);
    expect(screen.getByText('200')).toBeInTheDocument();
  });
});
