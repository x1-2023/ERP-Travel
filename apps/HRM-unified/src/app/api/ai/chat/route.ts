// src/app/api/ai/chat/route.ts
// AI Chat API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiChatService } from '@/services/ai-chat.service'
import { z } from 'zod'

const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, { message: 'Tin nhắn không được để trống' }),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = sendMessageSchema.parse(body)

    const result = await aiChatService.sendMessage(
      session.user.tenantId,
      session.user.id,
      data
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI Chat error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
