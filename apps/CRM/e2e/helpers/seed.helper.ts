import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

// Prefix for all test data — used for identification and cleanup
export const TEST_PREFIX = '[TEST]'
export const E2E_PREFIX = '[E2E]'

// Known portal session token for E2E tests
export const PORTAL_SESSION_TOKEN = 'e2e-portal-session-token-' + '0'.repeat(32)

// ── Supabase Admin Client ───────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return null
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Test User Definitions ───────────────────────────────────────────

const TEST_USER_DEFS = [
  { email: 'admin@test.rtr.com', password: 'TestAdmin123!', name: `${TEST_PREFIX} Admin User`, role: 'ADMIN' as const },
  { email: 'manager@test.rtr.com', password: 'TestManager123!', name: `${TEST_PREFIX} Manager User`, role: 'MANAGER' as const },
  { email: 'member@test.rtr.com', password: 'TestMember123!', name: `${TEST_PREFIX} Member User`, role: 'MEMBER' as const },
  { email: 'viewer@test.rtr.com', password: 'TestViewer123!', name: `${TEST_PREFIX} Viewer User`, role: 'VIEWER' as const },
]

// ── Seed Test Users ─────────────────────────────────────────────────

/**
 * Create test users in Supabase Auth + Prisma User table.
 * Idempotent: skips if user already exists.
 * Requires SUPABASE_SERVICE_ROLE_KEY for Supabase admin API.
 * Falls back to Prisma-only if service key unavailable.
 */
export async function seedTestUsers(): Promise<void> {
  const supabase = getSupabaseAdmin()

  for (const def of TEST_USER_DEFS) {
    // Check if user already exists in Prisma
    const existing = await prisma.user.findUnique({
      where: { email: def.email },
    })

    if (existing) {
      console.log(`  [seed] User ${def.email} already exists (${def.role}), skipping`)
      continue
    }

    if (supabase) {
      // Create in Supabase Auth first
      const { data, error } = await supabase.auth.admin.createUser({
        email: def.email,
        password: def.password,
        email_confirm: true,
      })

      if (error) {
        // User might already exist in Supabase but not in Prisma
        if (error.message?.includes('already been registered')) {
          // Look up existing Supabase user
          const { data: listData } = await supabase.auth.admin.listUsers()
          const existingAuth = listData?.users?.find(u => u.email === def.email)
          if (existingAuth) {
            await prisma.user.create({
              data: {
                id: existingAuth.id,
                email: def.email,
                name: def.name,
                role: def.role,
              },
            })
            console.log(`  [seed] Created Prisma user for existing Supabase user: ${def.email}`)
            continue
          }
        }
        console.error(`  [seed] Failed to create Supabase user ${def.email}:`, error.message)
        continue
      }

      // Create in Prisma with Supabase user ID
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: def.email,
          name: def.name,
          role: def.role,
        },
      })
      console.log(`  [seed] Created user: ${def.email} (${def.role})`)
    } else {
      console.warn(`  [seed] No SUPABASE_SERVICE_ROLE_KEY — cannot create auth user for ${def.email}`)
      console.warn(`  [seed] Create test users manually in Supabase Dashboard, then re-run seed`)
    }
  }
}

// ── Seed Test Data ──────────────────────────────────────────────────

/**
 * Create test CRM data: companies, contacts, deals, activities,
 * quotes, portal user, audience, campaign, tickets.
 * All prefixed with "[TEST]" for easy identification and cleanup.
 * Requires test users to exist.
 */
export async function seedTestData(): Promise<void> {
  // Find test users
  const memberUser = await prisma.user.findUnique({
    where: { email: 'member@test.rtr.com' },
  })
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@test.rtr.com' },
  })

  if (!memberUser || !adminUser) {
    console.warn('  [seed] Test users not found — skipping CRM data seed')
    return
  }

  // Check if test data already exists
  const existingCompany = await prisma.company.findFirst({
    where: { name: { startsWith: TEST_PREFIX } },
  })
  if (existingCompany) {
    console.log('  [seed] Test CRM data already exists, skipping')
    return
  }

  // Create test companies
  const companyA = await prisma.company.create({
    data: {
      name: `${TEST_PREFIX} Công ty ABC`,
      industry: 'Technology',
      size: 'MEDIUM',
      email: 'abc@test.rtr.com',
      phone: '0901234567',
      city: 'Ho Chi Minh',
      ownerId: memberUser.id,
    },
  })

  const companyB = await prisma.company.create({
    data: {
      name: `${TEST_PREFIX} Công ty XYZ`,
      industry: 'Manufacturing',
      size: 'LARGE',
      email: 'xyz@test.rtr.com',
      phone: '0907654321',
      city: 'Ha Noi',
      ownerId: adminUser.id,
    },
  })

  console.log('  [seed] Created 2 test companies')

  // Create test contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: `${TEST_PREFIX} Nguyễn`,
        lastName: 'Test A',
        email: 'nguyen.a@test.rtr.com',
        phone: '0901111111',
        jobTitle: 'Giám đốc',
        status: 'ACTIVE',
        source: 'WEBSITE',
        companyId: companyA.id,
        ownerId: memberUser.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: `${TEST_PREFIX} Trần`,
        lastName: 'Test B',
        email: 'tran.b@test.rtr.com',
        phone: '0902222222',
        jobTitle: 'Trưởng phòng',
        status: 'CUSTOMER',
        source: 'REFERRAL',
        companyId: companyA.id,
        ownerId: memberUser.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: `${TEST_PREFIX} Lê`,
        lastName: 'Test C',
        email: 'le.c@test.rtr.com',
        phone: '0903333333',
        jobTitle: 'Kế toán',
        status: 'LEAD',
        source: 'COLD_CALL',
        companyId: companyB.id,
        ownerId: adminUser.id,
      },
    }),
  ])

  console.log(`  [seed] Created ${contacts.length} test contacts`)

  // Get or create default pipeline + stage for deals
  let pipeline = await prisma.pipelineConfig.findFirst({
    where: { isDefault: true },
    include: { stages: { orderBy: { order: 'asc' } } },
  })

  if (!pipeline || pipeline.stages.length === 0) {
    console.warn('  [seed] No default pipeline found — skipping deals')
    return
  }

  const firstStage = pipeline.stages[0]

  // Create test deals
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: `${TEST_PREFIX} Deal phần mềm`,
        value: 50_000_000,
        stageId: firstStage.id,
        pipelineId: pipeline.id,
        companyId: companyA.id,
        ownerId: memberUser.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: `${TEST_PREFIX} Deal thiết bị`,
        value: 120_000_000,
        stageId: firstStage.id,
        pipelineId: pipeline.id,
        companyId: companyB.id,
        ownerId: adminUser.id,
      },
    }),
  ])

  console.log(`  [seed] Created ${deals.length} test deals`)

  // Create test activities
  await prisma.activity.createMany({
    data: [
      {
        type: 'CALL',
        subject: `${TEST_PREFIX} Gọi điện tư vấn`,
        contactId: contacts[0].id,
        userId: memberUser.id,
      },
      {
        type: 'EMAIL',
        subject: `${TEST_PREFIX} Gửi báo giá`,
        contactId: contacts[1].id,
        dealId: deals[0].id,
        userId: memberUser.id,
      },
      {
        type: 'MEETING',
        subject: `${TEST_PREFIX} Họp demo sản phẩm`,
        contactId: contacts[2].id,
        dealId: deals[1].id,
        userId: adminUser.id,
      },
    ],
  })

  console.log('  [seed] Created 3 test activities')

  // ── Quotes with items ───────────────────────────────────────────
  const year = new Date().getFullYear()
  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: `QUO-${year}-9901`,
      status: 'DRAFT',
      contactId: contacts[0].id,
      companyId: companyA.id,
      createdById: memberUser.id,
      subtotal: 10_000_000,
      taxPercent: 10,
      taxAmount: 1_000_000,
      total: 11_000_000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      terms: 'Thanh toán trong 30 ngày',
      items: {
        create: [
          {
            description: `${TEST_PREFIX} Dịch vụ hosting`,
            quantity: 2,
            unitPrice: 5_000_000,
            discount: 0,
            total: 10_000_000,
            sortOrder: 0,
          },
        ],
      },
    },
  })

  const quote2 = await prisma.quote.create({
    data: {
      quoteNumber: `QUO-${year}-9902`,
      status: 'SENT',
      contactId: contacts[1].id,
      companyId: companyA.id,
      createdById: memberUser.id,
      sentAt: new Date(),
      subtotal: 15_000_000,
      taxPercent: 10,
      taxAmount: 1_500_000,
      total: 16_500_000,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            description: `${TEST_PREFIX} Phần mềm CRM`,
            quantity: 1,
            unitPrice: 15_000_000,
            discount: 0,
            total: 15_000_000,
            sortOrder: 0,
          },
        ],
      },
    },
  })

  console.log(`  [seed] Created 2 test quotes`)

  // ── Portal User + Session ───────────────────────────────────────
  const portalUser = await prisma.portalUser.create({
    data: {
      email: 'portal-test@test.rtr.com',
      firstName: `${TEST_PREFIX} Portal`,
      lastName: 'User',
      companyId: companyA.id,
      isActive: true,
    },
  })

  // Create a known session token for E2E portal tests
  await prisma.portalSession.create({
    data: {
      token: PORTAL_SESSION_TOKEN,
      portalUserId: portalUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUsed: true,
    },
  })

  console.log('  [seed] Created portal user + session')

  // ── Support Ticket ──────────────────────────────────────────────
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TK-9901',
      subject: `${TEST_PREFIX} Hỏi về đơn hàng`,
      status: 'OPEN',
      priority: 'MEDIUM',
      portalUserId: portalUser.id,
      companyId: companyA.id,
      messages: {
        create: [
          {
            content: `${TEST_PREFIX} Tôi muốn hỏi về đơn hàng gần nhất`,
            portalUserId: portalUser.id,
          },
        ],
      },
    },
  })

  console.log('  [seed] Created 1 test ticket')

  // ── Audience + Campaign ─────────────────────────────────────────
  const audience = await prisma.audience.create({
    data: {
      name: `${TEST_PREFIX} Khách VIP`,
      description: 'Test audience for E2E',
      type: 'STATIC',
      createdById: adminUser.id,
      members: {
        create: contacts.map((c) => ({
          contactId: c.id,
        })),
      },
    },
  })

  await prisma.campaign.create({
    data: {
      name: `${TEST_PREFIX} Chiến dịch Email`,
      subject: `${TEST_PREFIX} Ưu đãi tháng 2`,
      content: 'Xin chào {{first_name}}, đây là ưu đãi đặc biệt!',
      status: 'DRAFT',
      type: 'EMAIL',
      audienceId: audience.id,
      createdById: adminUser.id,
      variants: {
        create: [
          {
            name: 'Original',
            subject: `${TEST_PREFIX} Ưu đãi tháng 2`,
            content: 'Xin chào {{first_name}}, đây là ưu đãi đặc biệt!',
            splitPercent: 100,
          },
        ],
      },
    },
  })

  console.log('  [seed] Created 1 test audience + 1 test campaign')
}

// ── Cleanup ─────────────────────────────────────────────────────────

/**
 * Remove all test CRM data (prefixed with "[TEST]" and "[E2E]").
 * Keeps test users for reuse across test runs.
 */
export async function cleanupTestData(): Promise<void> {
  const prefixFilter = (field: string) => ({
    OR: [{ [field]: { startsWith: TEST_PREFIX } }, { [field]: { startsWith: E2E_PREFIX } }],
  })

  // Delete ticket messages first (FK to tickets)
  await prisma.ticketMessage.deleteMany({
    where: { content: { startsWith: TEST_PREFIX } },
  })
  await prisma.ticketMessage.deleteMany({
    where: { content: { startsWith: E2E_PREFIX } },
  })

  // Delete tickets
  await prisma.supportTicket.deleteMany({
    where: prefixFilter('subject'),
  })

  // Delete portal sessions for test portal users
  const testPortalUsers = await prisma.portalUser.findMany({
    where: { email: { contains: 'test.rtr.com' } },
    select: { id: true },
  })
  if (testPortalUsers.length > 0) {
    await prisma.portalSession.deleteMany({
      where: { portalUserId: { in: testPortalUsers.map((u) => u.id) } },
    })
  }

  // Delete portal users
  await prisma.portalUser.deleteMany({
    where: { email: { contains: 'test.rtr.com' } },
  })
  console.log('  [cleanup] Deleted test portal data')

  // Delete campaign sends, variants, campaigns
  const testCampaigns = await prisma.campaign.findMany({
    where: prefixFilter('name'),
    select: { id: true },
  })
  if (testCampaigns.length > 0) {
    const ids = testCampaigns.map((c) => c.id)
    await prisma.campaignSend.deleteMany({ where: { campaignId: { in: ids } } })
    await prisma.campaignVariant.deleteMany({ where: { campaignId: { in: ids } } })
    await prisma.campaign.deleteMany({ where: { id: { in: ids } } })
  }

  // Delete audience members + audiences
  const testAudiences = await prisma.audience.findMany({
    where: prefixFilter('name'),
    select: { id: true },
  })
  if (testAudiences.length > 0) {
    const ids = testAudiences.map((a) => a.id)
    await prisma.audienceMember.deleteMany({ where: { audienceId: { in: ids } } })
    await prisma.audience.deleteMany({ where: { id: { in: ids } } })
  }
  console.log('  [cleanup] Deleted test campaigns + audiences')

  // Delete quote items + quotes
  const testQuotes = await prisma.quote.findMany({
    where: { quoteNumber: { startsWith: 'QUO-' } },
    select: { id: true, quoteNumber: true },
  })
  const e2eQuotes = testQuotes.filter(
    (q) => q.quoteNumber.includes('990') || q.quoteNumber.includes('E2E')
  )
  // Also delete quotes created by test users that have [E2E] in notes
  const e2eCreatedQuotes = await prisma.quote.findMany({
    where: { notes: { startsWith: E2E_PREFIX } },
    select: { id: true },
  })
  const quoteIdsToDelete = [...e2eQuotes, ...e2eCreatedQuotes].map((q) => q.id)
  if (quoteIdsToDelete.length > 0) {
    await prisma.quoteItem.deleteMany({ where: { quoteId: { in: quoteIdsToDelete } } })
    await prisma.quote.deleteMany({ where: { id: { in: quoteIdsToDelete } } })
  }
  console.log('  [cleanup] Deleted test quotes')

  // Delete activities
  await prisma.activity.deleteMany({
    where: prefixFilter('subject'),
  })
  console.log('  [cleanup] Deleted test activities')

  // Delete deals
  await prisma.deal.deleteMany({
    where: prefixFilter('title'),
  })
  console.log('  [cleanup] Deleted test deals')

  // Delete contacts (must happen after quotes, deals, activities, audience members)
  await prisma.contact.deleteMany({
    where: prefixFilter('firstName'),
  })
  console.log('  [cleanup] Deleted test contacts')

  // Delete companies (must happen after contacts, quotes, portal users, tickets)
  await prisma.company.deleteMany({
    where: prefixFilter('name'),
  })
  console.log('  [cleanup] Deleted test companies')
}

/**
 * Disconnect Prisma client — call in global teardown.
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect()
}
