/**
 * HR Dashboard Preset
 * Preset Dashboard Nhân Sự
 * Focus: Headcount, attendance, leave, payroll summary
 */

import { DashboardPreset } from '../types';

export const hrDashboard: DashboardPreset = {
  id: 'hr',
  name: 'HR Dashboard',
  nameVI: 'Dashboard Nhân Sự',
  description:
    'Human resources overview including headcount, attendance, leave management, and payroll status',
  descriptionVI:
    'Tổng quan nhân sự bao gồm số lượng nhân viên, chuyên cần, quản lý nghỉ phép và trạng thái lương',
  defaultTimeRange: 'MONTH',
  autoRefreshInterval: 120000, // 2 minutes
  layout: {
    widgets: [
      // Row 1: Key HR Metrics
      {
        id: 'total-headcount-kpi',
        type: 'kpi',
        title: 'Total Headcount | Tổng Số Nhân Viên',
        module: 'HR',
        size: 'sm',
        data: {
          metricKey: 'headcount',
        },
      },
      {
        id: 'attendance-rate-kpi',
        type: 'kpi',
        title: 'Attendance Rate | Tỷ Lệ Chuyên Cần',
        module: 'HR',
        size: 'sm',
        data: {
          metricKey: 'attendanceRate',
        },
      },
      {
        id: 'leave-balance-kpi',
        type: 'kpi',
        title: 'Leave Balance | Số Ngày Nghỉ Còn Lại',
        module: 'HR',
        size: 'sm',
        data: {
          metricKey: 'leaveBalance',
        },
      },
      {
        id: 'payroll-status-kpi',
        type: 'kpi',
        title: 'Payroll Status | Trạng Thái Lương',
        module: 'HR',
        size: 'sm',
        data: {
          metricKey: 'payrollStatus',
        },
      },

      // Row 2: Headcount Trend
      {
        id: 'headcount-trend',
        type: 'chart',
        title: 'Headcount Growth | Tăng Trưởng Nhân Sự',
        module: 'HR',
        size: 'lg',
        data: {
          chartId: 'headcount-trend',
        },
        refreshInterval: 600000, // 10 minutes
      },

      // Row 2: Attendance Trend
      {
        id: 'attendance-trend',
        type: 'chart',
        title: 'Attendance Trend | Xu Hướng Chuyên Cần',
        module: 'HR',
        size: 'lg',
        data: {
          chartId: 'attendance-trend',
        },
        refreshInterval: 300000, // 5 minutes
      },

      // Row 3: Employees by Department
      {
        id: 'employees-by-department',
        type: 'chart',
        title: 'Employees by Department | Nhân Viên Theo Bộ Phận',
        module: 'HR',
        size: 'md',
        data: {
          chartId: 'employees-by-department',
        },
        refreshInterval: 600000,
      },

      // Row 3: Leave by Type
      {
        id: 'leave-by-type',
        type: 'chart',
        title: 'Leave by Type | Nghỉ Phép Theo Loại',
        module: 'HR',
        size: 'md',
        data: {
          chartId: 'leave-by-type',
        },
        refreshInterval: 600000,
      },

      // Row 4: Absent Employees
      {
        id: 'absent-today',
        type: 'table',
        title: 'Absent Today | Vắng Mặt Hôm Nay',
        module: 'HR',
        size: 'md',
        data: {
          limit: 10,
          filter: { date: 'today', status: 'absent' },
        },
        refreshInterval: 300000, // 5 minutes
      },

      // Row 4: Pending Leave Requests
      {
        id: 'pending-leave-requests',
        type: 'table',
        title: 'Pending Leave Requests | Yêu Cầu Nghỉ Phép Chưa Xử Lý',
        module: 'HR',
        size: 'md',
        data: {
          limit: 10,
          filter: { status: 'pending' },
        },
        refreshInterval: 120000,
      },

      // Row 5: Salary by Department
      {
        id: 'salary-by-department',
        type: 'chart',
        title: 'Salary by Department | Lương Theo Bộ Phận',
        module: 'HR',
        size: 'md',
        data: {
          chartId: 'salary-by-department',
        },
        refreshInterval: 600000,
      },

      // Row 5: Upcoming Payroll
      {
        id: 'upcoming-payroll',
        type: 'table',
        title: 'Upcoming Payroll | Lương Sắp Tới',
        module: 'HR',
        size: 'md',
        data: {
          limit: 10,
          filter: { status: 'pending' },
        },
        refreshInterval: 300000,
      },

      // Row 6: Module Status
      {
        id: 'hr-module-status',
        type: 'moduleStatus',
        title: 'HR System Health | Sức Khỏe Hệ Thống Nhân Sự',
        size: 'lg',
        data: {
          modules: ['HR', 'Payroll', 'Recruitment'],
        },
        refreshInterval: 120000,
      },

      // Row 7: Recent HR Activity
      {
        id: 'hr-activity',
        type: 'table',
        title: 'Recent HR Activity | Hoạt Động Nhân Sự Gần Đây',
        size: 'xl',
        data: {
          limit: 15,
        },
        refreshInterval: 300000,
      },
    ],
    columns: 4,
    gap: 'md',
  },
};

export default hrDashboard;
