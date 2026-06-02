// src/app/api/ai/conversations/route.ts
// AI Conversations List API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { aiChatService } from '@/services/ai-chat.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const conversations = await aiChatService.getUserConversations(
      session.user.tenantId,
      session.user.id
    )

    return NextResponse.json({ data: conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await aiChatService.clearAllConversations(
      session.user.tenantId,
      session.user.id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear conversations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
