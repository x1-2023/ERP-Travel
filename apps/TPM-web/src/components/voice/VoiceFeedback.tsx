/**
 * Voice Feedback Component
 */

import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProcessCommandResponse } from '@/types/advanced';

interface VoiceFeedbackProps {
  response: ProcessCommandResponse | null;
  isProcessing?: boolean;
  onNavigate?: (path: string) => void;
}

export function VoiceFeedback({ response, isProcessing = false, onNavigate }: VoiceFeedbackProps) {
  if (isProcessing) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm">Processing command...</span>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg p-4 border',
        response.success
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30'
          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30'
      )}
    >
      <div className="flex items-start gap-3">
        {response.success ? (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p
            className={cn(
              'font-medium mb-1',
              response.success ? 'text-green-700' : 'text-red-700'
            )}
          >
            {response.success ? 'Command executed' : 'Command failed'}
          </p>
          <p className="text-sm text-muted-foreground">{response.response}</p>

          {response.action?.type === 'NAVIGATE' && !!response.action.params?.path && onNavigate && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => onNavigate(response.action!.params.path as string)}
            >
              Go to page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
