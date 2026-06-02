/**
 * Voice Transcript Component
 */

import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceTranscriptProps {
  transcript: string;
  isListening?: boolean;
  response?: string;
}

export function VoiceTranscript({
  transcript,
  isListening = false,
  response,
}: VoiceTranscriptProps) {
  return (
    <div className="space-y-4">
      {/* User's speech */}
      <div
        className={cn(
          'rounded-lg p-4 transition-colors',
          isListening ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30' : 'bg-muted'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-full shrink-0',
              isListening ? 'bg-red-100 dark:bg-red-900/50' : 'bg-blue-100 dark:bg-blue-900/50'
            )}
          >
            <Mic className={cn('h-4 w-4', isListening ? 'text-red-600' : 'text-primary')} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">You said:</p>
            <p className={cn('text-sm', !transcript && 'text-muted-foreground italic')}>
              {transcript || (isListening ? 'Listening...' : 'No speech detected')}
            </p>
          </div>
        </div>
      </div>

      {/* AI Response */}
      {response && (
        <div className="rounded-lg p-4 bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Assistant:</p>
              <p className="text-sm">{response}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
