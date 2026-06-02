import { db } from '@/lib/db'
import { createHmac, randomBytes } from 'crypto'

export async function dispatchWebhook(
  tenantId: string,
  event: string,
  data: unknown
) {
  const webhooks = await db.webhook.findMany({
    where: { tenantId, status: 'ACTIVE' },
  })

  const matchingWebhooks = webhooks.filter(w => {
    const events = w.events as string[]
    return events.includes(event) || events.includes('*')
  })

  for (const webhook of matchingWebhooks) {
    deliverWebhook(webhook, event, data).catch(console.error)
  }

  return matchingWebhooks.length
}

async function deliverWebhook(webhook: { id: string; url: string; secret: string; headers?: unknown }, event: string, data: unknown) {
  const payload = {
    id: `evt_${Date.now()}_${randomBytes(4).toString('hex')}`,
    type: event,
    timestamp: new Date().toISOString(),
    data,
  }

  const payloadStr = JSON.stringify(payload)
  const signature = createHmac('sha256', webhook.secret)
    .update(payloadStr)
    .digest('hex')

  const startTime = Date.now()
  let status = 'failed'
  let statusCode: number | null = null
  let responseBody: string | null = null
  let errorMessage: string | null = null

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': `sha256=${signature}`,
      'X-Webhook-Event': event,
      'X-Webhook-Id': payload.id,
      ...((webhook.headers as Record<string, string>) || {}),
    }

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadStr,
      signal: AbortSignal.timeout(30000),
    })

    statusCode = response.status
    responseBody = await response.text().catch(() => null)
    status = response.ok ? 'success' : 'failed'
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : 'Unknown error'
  }

  const duration = Date.now() - startTime

  await db.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      event,
      payload: JSON.parse(JSON.stringify(payload)),
      status,
      statusCode,
      responseBody: responseBody?.substring(0, 1000),
      errorMessage,
      duration,
    },
  })

  await db.webhook.update({
    where: { id: webhook.id },
    data: {
      totalDeliveries: { increment: 1 },
      successDeliveries: status === 'success' ? { increment: 1 } : undefined,
      failedDeliveries: status === 'failed' ? { increment: 1 } : undefined,
      lastDeliveryAt: new Date(),
    },
  })
}
