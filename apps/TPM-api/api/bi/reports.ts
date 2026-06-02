/**
 * BI Reports API
 * GET /api/bi/reports - List reports
 * POST /api/bi/reports - Create report
 * Sprint 0 Fix 3: MANAGER+ only
 */

import type { VercelResponse } from '@vercel/node';
import { managerPlus, type AuthenticatedRequest } from '../../_lib/auth';

const mockReports = [
  {
    id: 'rpt-001',
    name: 'Monthly Promotion Summary',
    description: 'Overview of all promotions by status and spend',
    type: 'TABLE',
    config: {
      dataSource: 'PROMOTIONS',
      columns: [
        { field: 'code', header: 'Code', type: 'STRING' },
        { field: 'name', header: 'Name', type: 'STRING' },
        { field: 'status', header: 'Status', type: 'STRING' },
        { field: 'budget', header: 'Budget', type: 'CURRENCY' },
        { field: 'spentAmount', header: 'Spent', type: 'CURRENCY' },
      ],
    },
    lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdById: 'user-001',
  },
  {
    id: 'rpt-002',
    name: 'Claim Analysis by Status',
    description: 'Claims grouped by approval status',
    type: 'CHART',
    config: {
      dataSource: 'CLAIMS',
      chartType: 'PIE',
      groupBy: ['status'],
    },
    lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'user-001',
  },
  {
    id: 'rpt-003',
    name: 'Customer Performance',
    description: 'Top customers by promotion value',
    type: 'MIXED',
    config: {
      dataSource: 'PROMOTIONS',
      groupBy: ['customerId'],
      chartType: 'BAR',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'user-001',
  },
];

export default managerPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    const { type, search, page = '1', pageSize = '20' } = req.query;

    let filtered = [...mockReports];

    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower)
      );
    }

    const pageNum = parseInt(page as string, 10);
    const pageSizeNum = parseInt(pageSize as string, 10);
    const start = (pageNum - 1) * pageSizeNum;
    const end = start + pageSizeNum;

    const paginatedData = filtered.slice(start, end);

    return res.status(200).json({
      success: true,
      data: paginatedData,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSizeNum),
      },
      categories: ['TABLE', 'CHART', 'KPI', 'MIXED'],
    });
  }

  if (req.method === 'POST') {
    const { name, description, type, config, schedule } = req.body;

    if (!name || !type || !config) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and config are required',
      });
    }

    const newReport = {
      id: `rpt-${Date.now()}`,
      name,
      description,
      type,
      config,
      schedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdById: 'current-user',
    };

    return res.status(201).json({
      success: true,
      data: newReport,
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
});
