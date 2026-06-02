/**
 * Voice Process Command API
 * POST /api/voice/process
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple intent detection patterns
const intentPatterns = [
  { pattern: /show.*active.*promotion|list.*promotion/i, intent: 'LIST_PROMOTIONS' },
  { pattern: /status.*(?:of|for)?\s*(promo[a-z0-9-]*)/i, intent: 'GET_PROMOTION_STATUS' },
  { pattern: /approve.*claim\s*(clm[a-z0-9-]*)/i, intent: 'APPROVE_CLAIM' },
  { pattern: /reject.*claim\s*(clm[a-z0-9-]*)/i, intent: 'REJECT_CLAIM' },
  { pattern: /show.*report|report.*for/i, intent: 'SHOW_REPORT' },
  { pattern: /expir.*promotion|promotion.*expir/i, intent: 'EXPIRING_PROMOTIONS' },
  { pattern: /show.*dashboard|go.*dashboard/i, intent: 'SHOW_DASHBOARD' },
  { pattern: /help|what can you do/i, intent: 'HELP' },
];

function detectIntent(transcript: string): { intent: string; entities: Record<string, unknown> } {
  for (const { pattern, intent } of intentPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const entities: Record<string, unknown> = {};

      // Extract entities based on intent
      if (intent === 'GET_PROMOTION_STATUS' && match[1]) {
        entities.promotionCode = match[1].toUpperCase();
      }
      if ((intent === 'APPROVE_CLAIM' || intent === 'REJECT_CLAIM') && match[1]) {
        entities.claimCode = match[1].toUpperCase();
      }
      if (intent === 'SHOW_REPORT') {
        const periodMatch = transcript.match(/(?:for\s+)?(last\s+(?:month|week|year)|this\s+(?:month|week|year))/i);
        entities.period = periodMatch ? periodMatch[1] : 'last month';
        entities.reportType = 'sales';
      }

      return { intent, entities };
    }
  }

  return { intent: 'UNKNOWN', entities: {} };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({
      success: false,
      error: 'Transcript is required',
    });
  }

  const startTime = Date.now();
  const { intent, entities } = detectIntent(transcript);

  let action: { type: string; params: Record<string, unknown> } | null = null;
  let response: string;
  let data: unknown = null;
  let success = true;

  switch (intent) {
    case 'LIST_PROMOTIONS':
      response = 'Found 15 active promotions. Showing the list now.';
      action = { type: 'NAVIGATE', params: { path: '/promotions?status=ACTIVE' } };
      data = { count: 15 };
      break;

    case 'GET_PROMOTION_STATUS':
      response = `Promotion ${entities.promotionCode} is ACTIVE. Budget: 100,000,000 VND, Spent: 45,000,000 VND.`;
      action = { type: 'NAVIGATE', params: { path: `/promotions/${entities.promotionCode}` } };
      break;

    case 'APPROVE_CLAIM':
      response = `Claim ${entities.claimCode} has been approved successfully.`;
      action = { type: 'NOTIFY', params: { message: 'Claim approved' } };
      break;

    case 'REJECT_CLAIM':
      response = `Claim ${entities.claimCode} has been rejected.`;
      action = { type: 'NOTIFY', params: { message: 'Claim rejected' } };
      break;

    case 'SHOW_REPORT':
      response = `Opening ${entities.reportType} report for ${entities.period}.`;
      action = {
        type: 'NAVIGATE',
        params: { path: `/bi/reports?type=${entities.reportType}&period=${entities.period}` },
      };
      break;

    case 'EXPIRING_PROMOTIONS':
      response = '3 promotions are expiring this week. Showing the list now.';
      action = { type: 'NAVIGATE', params: { path: '/promotions?expiring=true' } };
      data = { count: 3 };
      break;

    case 'SHOW_DASHBOARD':
      response = 'Opening dashboard.';
      action = { type: 'NAVIGATE', params: { path: '/dashboard' } };
      break;

    case 'HELP':
      response =
        'You can say: "Show me active promotions", "What\'s the status of PROMO-001", "Approve claim CLM-0042", "Show sales report for last month", or "What promotions are expiring this week?"';
      break;

    default:
      success = false;
      response =
        "Sorry, I didn't understand that command. Try saying 'Show me active promotions' or 'Help' for more options.";
  }

  const duration = Date.now() - startTime;

  return res.status(200).json({
    success,
    intent,
    entities,
    action,
    response,
    data,
    duration,
  });
}
