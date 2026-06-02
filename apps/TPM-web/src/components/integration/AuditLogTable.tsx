/**
 * Audit Log Table Component
 */

import { User, Clock, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { AuditLog } from '@/types/integration';

interface AuditLogTableProps {
  logs: AuditLog[];
  compact?: boolean;
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-600 text-white dark:bg-emerald-500',
  update: 'bg-blue-500 text-white dark:bg-blue-600',
  delete: 'bg-red-500 text-white dark:bg-red-600',
  approve: 'bg-emerald-600 text-white dark:bg-emerald-500',
  reject: 'bg-red-500 text-white dark:bg-red-600',
  login: 'bg-slate-500 text-white dark:bg-slate-600',
  logout: 'bg-slate-500 text-white dark:bg-slate-600',
  revoke: 'bg-amber-500 text-white dark:bg-amber-600',
  sync: 'bg-blue-500 text-white dark:bg-blue-600',
  import: 'bg-violet-500 text-white dark:bg-violet-600',
  export: 'bg-violet-500 text-white dark:bg-violet-600',
};

export function AuditLogTable({ logs, compact = false }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No audit logs found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          {!compact && <TableHead>Details</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(log.timestamp)}
              </span>
            </TableCell>
            <TableCell>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                {log.user?.name || 'System'}
              </span>
            </TableCell>
            <TableCell>
              <Badge className={ACTION_COLORS[log.action] || 'bg-surface-hover text-foreground-muted'}>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <span className="font-medium">{log.entityType}</span>
                {log.entityId && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({log.entityId.slice(0, 8)}...)
                  </span>
                )}
              </div>
            </TableCell>
            {!compact && (
              <TableCell className="max-w-[200px]">
                {log.newValue && (
                  <pre className="text-xs truncate">
                    {JSON.stringify(log.newValue).slice(0, 50)}...
                  </pre>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
