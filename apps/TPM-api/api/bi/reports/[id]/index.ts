/**
 * Single BI Report API
 * GET /api/bi/reports/:id
 * PUT /api/bi/reports/:id
 * DELETE /api/bi/reports/:id
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const report = {
      id,
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
        ],
      },
      lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdById: 'user-001',
    };

    return res.status(200).json({ success: true, data: report });
  }

  if (req.method === 'PUT') {
    const updates = req.body;

    return res.status(200).json({
      success: true,
      data: {
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  if (req.method === 'DELETE') {
    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
