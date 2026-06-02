/**
 * Voice Transcribe API
 * POST /api/voice/transcribe
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // In a real implementation, this would use a speech-to-text service
  // For now, we simulate the response
  const { audio, language = 'vi-VN' } = req.body;

  if (!audio) {
    return res.status(400).json({
      success: false,
      error: 'Audio data is required',
    });
  }

  // Simulated transcription
  return res.status(200).json({
    success: true,
    transcript: 'Show me active promotions',
    confidence: 0.92,
    language,
  });
}
