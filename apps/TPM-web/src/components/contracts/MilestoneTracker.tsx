import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  name: string;
  targetVolume: number;
  achievedVolume: number;
  deadline: string;
  achievedDate?: string | null;
  isAchieved: boolean;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onAchieve?: (milestoneId: string) => void;
}

export default function MilestoneTracker({ milestones, onAchieve }: MilestoneTrackerProps) {
  const now = new Date();

  return (
    <div className="space-y-1">
      {milestones.map((m, index) => {
        const deadline = new Date(m.deadline);
        const isPast = deadline < now;
        const progress = m.targetVolume > 0 ? (m.achievedVolume / m.targetVolume) * 100 : 0;

        return (
          <div key={m.id} className="flex items-start gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              {m.isAchieved ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : isPast ? (
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              ) : progress >= 50 ? (
                <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-border flex-shrink-0" />
              )}
              {index < milestones.length - 1 && (
                <div className={cn('w-0.5 h-8 mt-1', m.isAchieved ? 'bg-green-300' : 'bg-muted')} />
              )}
            </div>

            {/* Milestone content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center justify-between">
                <p className={cn('text-sm font-medium', m.isAchieved ? 'text-green-700' : 'text-foreground')}>
                  {m.name}
                </p>
                <span className="text-xs text-muted-foreground">
                  {deadline.toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      m.isAchieved ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-border'
                    )}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {m.achievedVolume.toLocaleString()} / {m.targetVolume.toLocaleString()}
                </span>
              </div>
              {!m.isAchieved && progress >= 95 && onAchieve && (
                <button
                  onClick={() => onAchieve(m.id)}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark as Achieved
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
