/**
 * Export Button Component
 */

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { useExport } from '@/hooks/bi';
import type { ExportRequest } from '@/types/advanced';

interface ExportButtonProps {
  type: ExportRequest['type'];
  reportId?: string;
  filters?: Record<string, unknown>;
  columns?: string[];
  dateRange?: { from: string; to: string };
  disabled?: boolean;
}

export function ExportButton({
  type,
  reportId,
  filters,
  columns,
  dateRange,
  disabled = false,
}: ExportButtonProps) {
  const [exportFormat, setExportFormat] = useState<'EXCEL' | 'CSV' | 'PDF' | null>(null);
  const { toast } = useToast();
  const exportMutation = useExport();

  const handleExport = async (format: 'EXCEL' | 'CSV' | 'PDF') => {
    setExportFormat(format);
    try {
      const result = await exportMutation.mutateAsync({
        type,
        reportId,
        filters,
        columns,
        dateRange,
        format,
      });

      if (result.url) {
        // Trigger download
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename || `export.${format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup blob URL
        if (result.url.startsWith('blob:')) {
          URL.revokeObjectURL(result.url);
        }

        toast({
          title: 'Export Successful',
          description: `Data exported as ${format}`,
        });
      }
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExportFormat(null);
    }
  };

  const isExporting = exportMutation.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('EXCEL')}
          disabled={exportFormat === 'EXCEL'}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('CSV')}
          disabled={exportFormat === 'CSV'}
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('PDF')}
          disabled={exportFormat === 'PDF'}
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
