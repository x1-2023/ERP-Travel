import nodemailer from 'nodemailer'
import Handlebars from 'handlebars'
import { db } from '@/lib/db'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

export async function getSmtpConfig(tenantId: string): Promise<SmtpConfig | null> {
  const config = await db.systemConfig.findUnique({
    where: {
      tenantId_category_key: {
        tenantId,
        category: 'email',
        key: 'smtp',
      },
    },
  })
  return config?.value as unknown as SmtpConfig | null
}

export async function saveSmtpConfig(tenantId: string, config: SmtpConfig, userId: string) {
  return db.systemConfig.upsert({
    where: {
      tenantId_category_key: {
        tenantId,
        category: 'email',
        key: 'smtp',
      },
    },
    update: {
      value: JSON.parse(JSON.stringify(config)),
      updatedBy: userId,
    },
    create: {
      tenantId,
      category: 'email',
      key: 'smtp',
      value: JSON.parse(JSON.stringify(config)),
      updatedBy: userId,
    },
  })
}

export async function createTransporter(tenantId: string) {
  const config = await getSmtpConfig(tenantId)
  if (!config) return null

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
}

export async function sendEmail(
  tenantId: string,
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = await createTransporter(tenantId)
  if (!transporter) {
    return { success: false, error: 'Email chưa được cấu hình' }
  }

  const config = await getSmtpConfig(tenantId)

  try {
    await transporter.sendMail({
      from: config!.from,
      to,
      subject,
      html,
      text,
    })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export function renderTemplate(template: string, data: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)
  return compiled(data)
}

export async function testSmtpConnection(config: SmtpConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })

    await transporter.verify()
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}
