/**
 * Anomaly Alert Component
 */

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { AIInsight } from '@/types/advanced';

interface AnomalyAlertProps {
  insights: AIInsight[];
}

export function AnomalyAlert({ insights }: AnomalyAlertProps) {
  const criticalCount = insights.filter((i) => i.severity === 'CRITICAL').length;

  if (criticalCount === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Critical Issues Detected</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {criticalCount} critical insight{criticalCount !== 1 ? 's' : ''} require
          {criticalCount === 1 ? 's' : ''} immediate attention
        </span>
        <Link to="/ai/insights?severity=CRITICAL">
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
