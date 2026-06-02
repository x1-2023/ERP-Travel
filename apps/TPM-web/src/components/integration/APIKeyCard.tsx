/**
 * API Key Card Component
 */

import { Key, Trash2, Copy, Shield } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import type { APIKey } from '@/types/integration';

interface APIKeyCardProps {
  apiKey: APIKey;
  onRevoke: () => void;
  isRevoking?: boolean;
}

export function APIKeyCard({ apiKey, onRevoke, isRevoking = false }: APIKeyCardProps) {
  const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date();
  const isExpiringSoon =
    apiKey.expiresAt &&
    new Date(apiKey.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    !isExpired;

  return (
    <Card className={!apiKey.isActive ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{apiKey.name}</CardTitle>
              <code className="text-xs text-muted-foreground">pm_****{apiKey.keyPreview}</code>
            </div>
          </div>
          <div className="flex gap-2">
            {!apiKey.isActive && <Badge variant="secondary">Revoked</Badge>}
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {isExpiringSoon && <Badge variant="outline" className="text-yellow-600">Expiring Soon</Badge>}
            {apiKey.isActive && !isExpired && !isExpiringSoon && (
              <Badge variant="default">Active</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Permissions:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {apiKey.permissions.slice(0, 3).map((perm) => (
                <Badge key={perm} variant="outline" className="text-xs">
                  {perm}
                </Badge>
              ))}
              {apiKey.permissions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{apiKey.permissions.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Used:</span>
            <span>{apiKey.lastUsedAt ? formatRelativeTime(apiKey.lastUsedAt) : 'Never'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Usage:</span>
            <span>{apiKey.usageCount.toLocaleString()} requests</span>
          </div>
          {apiKey.expiresAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <span className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : ''}>
                {formatDate(apiKey.expiresAt)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="destructive"
          className="w-full"
          onClick={onRevoke}
          disabled={!apiKey.isActive || isRevoking}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isRevoking ? 'Revoking...' : 'Revoke Key'}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface NewAPIKeyDisplayProps {
  keyValue: string;
  onCopy: () => void;
}

export function NewAPIKeyDisplay({ keyValue, onCopy }: NewAPIKeyDisplayProps) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Key className="h-5 w-5 text-yellow-600" />
        <span className="font-medium text-yellow-800">Save your API key</span>
      </div>
      <p className="text-sm text-warning mb-3">
        This is the only time you'll see this key. Make sure to copy and save it securely.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 p-2 bg-surface rounded border border-surface-border text-sm font-mono text-foreground">{keyValue}</code>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
