/**
 * AI Prediction API
 * POST /api/ai/predict
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { type, parameters } = req.body;

  let prediction: number;
  let confidence: number;
  let factors: { name: string; impact: number }[];

  switch (type) {
    case 'ROI':
      prediction = 25.5; // Predicted ROI percentage
      confidence = 0.78;
      factors = [
        { name: 'Promotion Type', impact: 0.3 },
        { name: 'Duration', impact: 0.2 },
        { name: 'Discount Level', impact: 0.25 },
        { name: 'Customer Segment', impact: 0.15 },
        { name: 'Seasonality', impact: 0.1 },
      ];
      break;

    case 'SALES':
      prediction = 150000000; // Predicted sales in VND
      confidence = 0.72;
      factors = [
        { name: 'Historical Sales', impact: 0.35 },
        { name: 'Promotion Discount', impact: 0.25 },
        { name: 'Market Trend', impact: 0.2 },
        { name: 'Competitor Activity', impact: 0.12 },
        { name: 'Season', impact: 0.08 },
      ];
      break;

    case 'REDEMPTION':
      prediction = 0.68; // Predicted redemption rate
      confidence = 0.82;
      factors = [
        { name: 'Promotion Attractiveness', impact: 0.3 },
        { name: 'Customer Engagement', impact: 0.25 },
        { name: 'Ease of Redemption', impact: 0.2 },
        { name: 'Channel Coverage', impact: 0.15 },
        { name: 'Communication', impact: 0.1 },
      ];
      break;

    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid prediction type. Use ROI, SALES, or REDEMPTION',
      });
  }

  return res.status(200).json({
    success: true,
    data: {
      prediction,
      confidence,
      range: {
        min: prediction * 0.7,
        max: prediction * 1.3,
      },
      factors,
    },
  });
}
