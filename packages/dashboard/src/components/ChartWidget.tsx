/**
 * Chart Widget Component - Wrapper around recharts
 * Thành phần Widget Biểu đồ - Bao bọc xung quanh recharts
 */

import React, { Suspense } from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import clsx from 'clsx';
import { ChartData } from '../types';

interface ChartWidgetProps {
  title?: string;
  data: ChartData;
  height?: number;
  loading?: boolean;
  error?: string | null;
}

// Color palette for pie/doughnut charts
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

// Skeleton loader for chart
const ChartSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div
    className="animate-pulse rounded-lg bg-gray-200"
    style={{ height: `${height}px` }}
  />
);

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  data,
  height = 300,
  loading = false,
  error = null,
}) => {
  const chartData = data.datasets[0]?.data.map((value, idx) => ({
    name: data.labels[idx],
    value: value,
  })) || [];

  if (error) {
    return (
      <div className={clsx('flex flex-col rounded-lg border border-red-200 bg-red-50 p-6')} style={{ height: `${height}px` }}>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-red-700">Error loading chart</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6">
      {title && <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>}

      <Suspense fallback={<ChartSkeleton height={height} />}>
        {loading ? (
          <ChartSkeleton height={height} />
        ) : data.type === 'line' ? (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets.map((dataset, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey="value"
                  stroke={dataset.borderColor || COLORS[idx % COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : data.type === 'bar' ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.datasets.map((dataset, idx) => (
                <Bar
                  key={idx}
                  dataKey="value"
                  fill={dataset.backgroundColor || COLORS[idx % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : data.type === 'pie' || data.type === 'doughnut' ? (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={data.type === 'doughnut' ? 60 : 0}
                outerRadius={100}
                label
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <p className="text-gray-500">Unsupported chart type</p>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default ChartWidget;
