export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} phút`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: Date | string | null | undefined): 'active' | 'warning' | 'expired' | 'none' {
  if (!expiryDate) return 'none';
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 90) return 'warning';
  return 'active';
}

export function generateCourseCode(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}
