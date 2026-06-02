/**
 * Dashboard Grid Component - CSS Grid layout with responsive breakpoints
 * Thành phần Lưới Dashboard - Bố cục CSS Grid với điểm dừng phản hồi
 */

import React, { CSSProperties } from 'react';
import clsx from 'clsx';
import { DashboardWidget } from '../types';

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
  className?: string;
  style?: CSSProperties;
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const sizeClasses = {
  sm: 'col-span-1',
  md: 'col-span-1 lg:col-span-2',
  lg: 'col-span-1 md:col-span-2 lg:col-span-3',
  xl: 'col-span-1 md:col-span-2 lg:col-span-4',
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  responsive = true,
  className = '',
  style,
}) => {
  return (
    <div
      className={clsx(
        'grid',
        responsive ? columnClasses[columns] : `grid-cols-${columns}`,
        gapClasses[gap],
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
};

interface WidgetContainerProps {
  widget: DashboardWidget;
  children: React.ReactNode;
  className?: string;
}

/**
 * Widget Container - Handles widget sizing and layout
 * Vùng chứa Widget - Xử lý kích thước và bố cục widget
 */
export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  children,
  className = '',
}) => {
  return (
    <div
      key={widget.id}
      className={clsx(sizeClasses[widget.size], className)}
      data-widget-id={widget.id}
    >
      {children}
    </div>
  );
};

interface ResponsiveDashboardProps {
  children: React.ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive Dashboard Container - Auto-adjusts columns based on screen size
 * Vùng chứa Dashboard Phản hồi - Tự động điều chỉnh cột dựa trên kích thước màn hình
 */
export const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  children,
  columns = 3,
  gap = 'md',
}) => {
  return (
    <div className="w-full">
      <div
        className={clsx(
          'grid auto-rows-max',
          gapClasses[gap],
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default DashboardGrid;
