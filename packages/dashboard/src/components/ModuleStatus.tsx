/**
 * Module Status Component - Grid of module health cards
 * Thành phần Trạng thái Mô-đun - Lưới các thẻ sức khỏe mô-đun
 */

import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { ModuleStatus as ModuleStatusType } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ModuleStatusProps {
  modules: ModuleStatusType[];
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
}

export const ModuleStatus: React.FC<ModuleStatusProps> = ({
  modules,
  columns = 3,
  loading = false,
}) => {
  const getStatusIcon = (status: 'online' | 'offline' | 'degraded') => {
    switch (status) {
      case 'online':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'offline':
        return <AlertCircle size={24} className="text-red-600" />;
      case 'degraded':
        return <Clock size={24} className="text-yellow-600" />;
    }
  };

  const getStatusColor = (
    status: 'online' | 'offline' | 'degraded',
  ): 'success' | 'danger' | 'warning' => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'danger';
      case 'degraded':
        return 'warning';
    }
  };

  const getStatusLabel = (status: 'online' | 'offline' | 'degraded') => {
    const labels: Record<string, { en: string; vi: string }> = {
      online: { en: 'Online', vi: 'Trực tuyến' },
      offline: { en: 'Offline', vi: 'Ngoại tuyến' },
      degraded: { en: 'Degraded', vi: 'Suy giảm' },
    };
    return labels[status];
  };

  const colorMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      dot: 'bg-green-600',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      dot: 'bg-red-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      dot: 'bg-yellow-600',
    },
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  if (loading) {
    return (
      <div className={clsx('grid gap-4', gridColsClass[columns])}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-32 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('grid gap-4', gridColsClass[columns])}>
      {modules.map((module) => {
        const statusColor = getStatusColor(module.status);
        const colors = colorMap[statusColor];
        const statusLabel = getStatusLabel(module.status);

        return (
          <div
            key={module.moduleName}
            className={clsx(
              'flex flex-col rounded-lg border p-4 transition-all',
              colors.bg,
              colors.border,
            )}
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {module.moduleName}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <div className={clsx('h-2 w-2 rounded-full', colors.dot)} />
                  <span className="text-xs font-medium text-gray-700">
                    {statusLabel.en} | {statusLabel.vi}
                  </span>
                </div>
              </div>
              {getStatusIcon(module.status)}
            </div>

            {/* Stats */}
            <div className="space-y-2 border-t border-gray-200 pt-3">
              {/* Uptime */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Uptime | Thời gian hoạt động</span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-300">
                    <div
                      className={clsx('h-full', colors.dot)}
                      style={{ width: `${module.uptime}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900">
                    {module.uptime.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Response Time */}
              {module.responseTime !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Response Time | Thời gian phản hồi</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {module.responseTime}ms
                  </span>
                </div>
              )}

              {/* Last Error */}
              {module.lastError && (
                <div className="mt-3 rounded bg-white bg-opacity-50 p-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Last Error | Lỗi cuối cùng
                  </p>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {module.lastError}
                  </p>
                  {module.lastErrorTime && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDistanceToNow(module.lastErrorTime, {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {modules.length === 0 && (
        <div className="col-span-full rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          <p>No modules found | Không tìm thấy mô-đun</p>
        </div>
      )}
    </div>
  );
};

export default ModuleStatus;
