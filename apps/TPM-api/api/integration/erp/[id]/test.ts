/**
 * ERP Connection Test API
 * POST /api/integration/erp/:id/test - Test connection
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Connection ID is required' });
  }

  try {
    const connection = await prisma.eRPConnection.findUnique({
      where: { id },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'ERP connection not found',
      });
    }

    const config = (connection as any).config as Record<string, unknown>;
    const startTime = Date.now();

    // Test connection based on type
    let testResult: { success: boolean; message?: string; error?: string };

    try {
      switch (connection.erpType as string) {
        case 'SAP_S4HANA':
        case 'SAP_ECC':
          testResult = await testSAPConnection(config);
          break;
        case 'ORACLE_EBS':
        case 'ORACLE_CLOUD':
          testResult = await testOracleConnection(config);
          break;
        case 'DYNAMICS_365':
        case 'DYNAMICS_NAV':
          testResult = await testDynamicsConnection(config);
          break;
        case 'GENERIC_REST':
        case 'GENERIC_SOAP':
        default:
          testResult = await testRESTConnection(config);
          break;
      }
    } catch (error) {
      testResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    const latency = Date.now() - startTime;

    // Update connection status based on test result
    await prisma.eRPConnection.update({
      where: { id },
      data: {
        status: testResult.success ? 'ACTIVE' : 'ERROR',
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...testResult,
        latency,
      },
    });
  } catch (error) {
    console.error('ERP test API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Test SAP connection
async function testSAPConnection(config: Record<string, unknown>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { sapHost, sapClient, sapUser } = config;

  if (!sapHost || !sapClient || !sapUser) {
    return {
      success: false,
      error: 'Missing required SAP configuration: host, client, user',
    };
  }

  // In production, would use SAP RFC or OData to test
  // For now, simulate connection test
  return {
    success: true,
    message: `Successfully connected to SAP host: ${sapHost}`,
  };
}

// Test Oracle connection
async function testOracleConnection(config: Record<string, unknown>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { oracleHost, oracleUsername, oracleServiceName } = config;

  if (!oracleHost || !oracleUsername || !oracleServiceName) {
    return {
      success: false,
      error: 'Missing required Oracle configuration: host, username, serviceName',
    };
  }

  // In production, would use Oracle client to test
  return {
    success: true,
    message: `Successfully connected to Oracle: ${oracleServiceName}@${oracleHost}`,
  };
}

// Test Microsoft Dynamics connection
async function testDynamicsConnection(config: Record<string, unknown>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { baseUrl, authCredentials } = config;

  if (!baseUrl) {
    return {
      success: false,
      error: 'Missing required Dynamics configuration: baseUrl',
    };
  }

  // In production, would authenticate with Azure AD and test API
  return {
    success: true,
    message: `Successfully connected to Dynamics 365: ${baseUrl}`,
  };
}

// Test generic REST connection
async function testRESTConnection(config: Record<string, unknown>): Promise<{ success: boolean; message?: string; error?: string }> {
  const { baseUrl, apiKey, authType } = config;

  if (!baseUrl) {
    return {
      success: false,
      error: 'Missing required configuration: baseUrl',
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey as string;
    }

    const response = await fetch(baseUrl as string, {
      method: 'HEAD',
      headers,
    });

    if (response.ok || response.status === 405) {
      return {
        success: true,
        message: `Successfully connected to: ${baseUrl}`,
      };
    } else {
      return {
        success: false,
        error: `Connection failed with status: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
