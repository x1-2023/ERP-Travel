// src/app/api/ai/automation/suggest/route.ts
// Workflow Suggestions API

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createWorkflowSuggester, createSmartFormAssistant } from '@/lib/ai/automation'
import { z } from 'zod'

// Get workflow suggestions
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suggester = createWorkflowSuggester(session.user.tenantId)
    const suggestions = await suggester.getSuggestions({
      tenantId: session.user.tenantId,
      userId: session.user.id,
      employeeId: session.user.employeeId || undefined,
      role: session.user.role
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Workflow suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}

// Get smart form suggestions
const formSuggestionSchema = z.object({
  formType: z.string(),
  currentValues: z.record(z.string(), z.unknown()).optional().default({}),
  fieldDescription: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { formType, currentValues, fieldDescription } = formSuggestionSchema.parse(body)

    const assistant = createSmartFormAssistant(session.user.tenantId)

    // If specific field description provided, use AI
    if (fieldDescription) {
      const suggestions = await assistant.getAISuggestions(
        formType,
        fieldDescription,
        currentValues
      )
      return NextResponse.json({ suggestions })
    }

    // Otherwise use rule-based suggestions
    const result = await assistant.getSuggestions({
      formType,
      currentValues,
      userContext: {
        employeeId: session.user.employeeId || undefined,
        role: session.user.role
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Form suggestions error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get form suggestions' },
      { status: 500 }
    )
  }
}
