import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      // Get recent voice commands
      const { page = '1', limit = '20', status } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where: Record<string, unknown> = {
        userId: user.userId,
      };
      if (status) where.status = status;

      const [commands, total] = await Promise.all([
        prisma.voiceCommand.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.voiceCommand.count({ where }),
      ]);

      return res.status(200).json({
        data: commands,
        pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
      });
    }

    if (req.method === 'POST') {
      const { transcript, audioUrl } = req.body;

      if (!transcript) {
        return res.status(400).json({ error: 'Missing required field: transcript' });
      }

      // Create voice command record
      const command = await prisma.voiceCommand.create({
        data: {
          transcript,
          audioUrl: audioUrl || null,
          userId: user.userId,
          status: 'PROCESSING',
        },
      });

      // Placeholder: In production, this would trigger voice processing
      // For now, simulate intent detection
      const intent = detectIntent(transcript);

      // Update with detected intent
      const updated = await prisma.voiceCommand.update({
        where: { id: command.id },
        data: {
          intent: intent.intent,
          entities: intent.entities,
          status: 'COMPLETED',
          result: {
            message: `Detected intent: ${intent.intent}`,
            suggestion: intent.suggestion,
          },
        },
      });

      return res.status(201).json({ data: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Voice command error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Simple intent detection (placeholder)
function detectIntent(transcript: string): { intent: string; entities: Record<string, string>; suggestion: string } {
  const lower = transcript.toLowerCase();

  if (lower.includes('create') && lower.includes('promotion')) {
    return {
      intent: 'CREATE_PROMOTION',
      entities: {},
      suggestion: 'Navigate to Promotions > New to create a promotion',
    };
  }

  if (lower.includes('status') || lower.includes('how') || lower.includes('performance')) {
    return {
      intent: 'QUERY_STATUS',
      entities: {},
      suggestion: 'Check the Dashboard for promotion status and performance',
    };
  }

  if (lower.includes('claim') || lower.includes('submit')) {
    return {
      intent: 'SUBMIT_CLAIM',
      entities: {},
      suggestion: 'Navigate to Claims > New to submit a claim',
    };
  }

  return {
    intent: 'UNKNOWN',
    entities: {},
    suggestion: 'Try commands like "Create promotion", "Check status", or "Submit claim"',
  };
}
