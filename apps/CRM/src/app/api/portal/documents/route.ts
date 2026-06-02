import { NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = session.portalUser.companyId

  // Get documents belonging to the customer's company or their deals
  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { companyId },
        { deal: { companyId } },
      ],
    },
    select: {
      id: true,
      name: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      category: true,
      version: true,
      createdAt: true,
      uploadedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ data: documents })
}
