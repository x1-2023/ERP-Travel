import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { validateRequest } from '@/lib/validations/utils'
import { audienceRulesSchema } from '@/lib/validations/audience'
import { countAudienceByRules } from '@/lib/campaigns/rule-engine'
import { handleApiError } from '@/lib/api/errors'

// POST /api/audiences/preview — Preview count for dynamic rules
export async function POST(req: NextRequest) {
  try {
    await getCurrentUser()

    const body = await req.json()
    const rules = validateRequest(audienceRulesSchema, body)
    const count = await countAudienceByRules(rules)

    return NextResponse.json({ count })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, 'POST /api/audiences/preview')
  }
}
