import type { VercelResponse } from '@vercel/node';
import { adminOnly, type AuthenticatedRequest } from '../../_lib/auth';

// ERP Integration placeholder - Sprint 0 Fix 3: ADMIN ONLY
export default adminOnly(async (req: AuthenticatedRequest, res: VercelResponse) => {

  try {
    if (req.method === 'GET') {
      // Get ERP connection status
      return res.status(200).json({
        data: {
          status: 'not_configured',
          message: 'ERP integration not configured. Please contact administrator.',
          supportedSystems: ['SAP', 'Oracle', 'Microsoft Dynamics', 'NetSuite'],
        },
      });
    }

    if (req.method === 'POST') {
      const { action, system, config } = req.body;

      if (!action) {
        return res.status(400).json({ error: 'Missing required field: action' });
      }

      switch (action) {
        case 'connect':
          // Placeholder for ERP connection
          return res.status(200).json({
            data: {
              status: 'pending',
              message: `ERP connection to ${system || 'unknown'} initiated. Configuration required.`,
            },
          });

        case 'sync':
          // Placeholder for data sync
          return res.status(200).json({
            data: {
              status: 'pending',
              message: 'Data sync not available. Please configure ERP connection first.',
            },
          });

        case 'mapping':
          // Placeholder for field mapping
          return res.status(200).json({
            data: {
              status: 'not_configured',
              availableMappings: ['customers', 'products', 'orders', 'invoices'],
              configuredMappings: [],
            },
          });

        default:
          return res.status(400).json({ error: `Unknown action: ${action}` });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('ERP integration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
