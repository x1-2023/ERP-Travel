// src/app/api/ai/copilot/route.ts
// HR Copilot API - Advanced AI with Tool Calling

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createHRCopilot } from '@/lib/ai/hr-copilot'
import { db } from '@/lib/db'
import { z } from 'zod'

const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, 'Tin nhắn không được để trống')
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if AI is enabled
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI features are not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { conversationId, message } = chatSchema.parse(body)

    // Get or create conversation
    let conversation = conversationId
      ? await db.aIConversation.findFirst({
          where: {
            id: conversationId,
            tenantId: session.user.tenantId,
            userId: session.user.id
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 20 // Last 20 messages for context
            }
          }
        })
      : null

    if (!conversation) {
      conversation = await db.aIConversation.create({
        data: {
          tenantId: session.user.tenantId,
          userId: session.user.id,
          title: message.slice(0, 50)
        },
        include: { messages: true }
      })
    }

    // Build message history
    const messages = conversation.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
    messages.push({ role: 'user', content: message })

    // Create HR Copilot instance
    const copilot = await createHRCopilot(
      session.user.tenantId,
      session.user.id
    )

    // Get AI response
    const response = await copilot.chat(messages, conversation.id)

    // Save user message
    await db.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        intent: response.intent
      }
    })

    // Save assistant message
    const assistantMessage = await db.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: response.message,
        intent: response.intent,
        actionType: response.actions?.[0]?.type,
        actionData: response.actions?.[0]?.params
          ? JSON.parse(JSON.stringify(response.actions[0].params))
          : undefined
      }
    })

    // Update conversation
    await db.aIConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
        title: conversation.messages.length === 0
          ? message.slice(0, 50)
          : conversation.title
      }
    })

    return NextResponse.json({
      conversationId: conversation.id,
      message: {
        id: assistantMessage.id,
        role: 'assistant',
        content: response.message,
        intent: response.intent,
        actions: response.actions,
        suggestions: response.suggestions,
        createdAt: assistantMessage.createdAt
      }
    })
  } catch (error) {
    console.error('HR Copilot API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Get conversation history
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Get specific conversation
      const conversation = await db.aIConversation.findFirst({
        where: {
          id: conversationId,
          tenantId: session.user.tenantId,
          userId: session.user.id
        },
        include: {
          messages: { orderBy: { createdAt: 'asc' } }
        }
      })

      if (!conversation) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }

      return NextResponse.json({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          intent: m.intent,
          actions: m.actionData ? [{
            type: m.actionType,
            params: m.actionData
          }] : undefined,
          createdAt: m.createdAt
        })),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      })
    }

    // List conversations
    const conversations = await db.aIConversation.findMany({
      where: {
        tenantId: session.user.tenantId,
        userId: session.user.id
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      conversations: conversations.map(c => ({
        id: c.id,
        title: c.title || 'Cuộc hội thoại mới',
        messageCount: c._count.messages,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
