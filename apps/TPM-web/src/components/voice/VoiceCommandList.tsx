/**
 * Voice Command List Component
 */

import { CheckCircle, XCircle, Clock } from 'lucide-react';
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
import type { VoiceCommand } from '@/types/advanced';

interface VoiceCommandListProps {
  commands: VoiceCommand[];
  compact?: boolean;
}

export function VoiceCommandList({ commands, compact = false }: VoiceCommandListProps) {
  if (commands.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No voice commands yet
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {commands.slice(0, 5).map((command) => (
          <div
            key={command.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
          >
            {command.success ? (
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{command.transcript}</p>
              <p className="text-xs text-muted-foreground">{command.intent}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(command.createdAt)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Command</TableHead>
          <TableHead>Intent</TableHead>
          <TableHead>Response</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commands.map((command) => (
          <TableRow key={command.id}>
            <TableCell>
              {command.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{command.transcript}</TableCell>
            <TableCell>
              <Badge variant="outline">{command.intent}</Badge>
            </TableCell>
            <TableCell className="max-w-[250px] truncate text-sm text-muted-foreground">
              {command.response}
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {command.duration}ms
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatRelativeTime(command.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
