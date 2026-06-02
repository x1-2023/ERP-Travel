import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, parsePagination, type AuthenticatedRequest } from '../_lib/auth';

// Phase 6: Enhanced Claims CRUD
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { status, customerId, promotionId, type, source, dateFrom, dateTo, search } =
        req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const userRecord = await prisma.user.findUnique({ where: { id: req.auth.userId } });
      if (!userRecord) return res.status(404).json({ success: false, error: 'User not found' });

      const where: Record<string, unknown> = {
        customer: { companyId: userRecord.companyId },
      };

      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (promotionId) where.promotionId = promotionId;
      if (type) where.type = type;
      if (source) where.source = source;
      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (dateFrom || dateTo) {
        where.claimDate = {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo) } : {}),
        };
      }

      const [claims, total] = await Promise.all([
        prisma.claim.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, channel: true } },
            promotion: { select: { id: true, code: true, name: true, status: true } },
            _count: { select: { lineItems: true, settlements: true, approvals: true } },
          },
        }),
        prisma.claim.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: claims,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const {
        code, amount, customerId, promotionId, claimDate, description,
        type, source, claimPeriodStart, claimPeriodEnd, dueDate, priority,
        invoiceNumber, invoiceDate, invoiceAmount, customerNotes, lineItems,
      } = req.body;

      if (!code || !amount || !customerId || !claimDate) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: code, amount, customerId, claimDate' },
        });
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Amount must be a positive number' },
        });
      }

      const userRecord = await prisma.user.findUnique({ where: { id: req.auth.userId } });

      const claim = await prisma.$transaction(async (tx) => {
        const c = await tx.claim.create({
          data: {
            code,
            amount: parsedAmount,
            claimedAmount: parsedAmount,
            customerId,
            promotionId: promotionId || null,
            claimDate: new Date(claimDate),
            description: description || null,
            companyId: userRecord?.companyId || null,
            type: type || null,
            source: source || 'MANUAL',
            claimPeriodStart: claimPeriodStart ? new Date(claimPeriodStart) : null,
            claimPeriodEnd: claimPeriodEnd ? new Date(claimPeriodEnd) : null,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority: priority || 0,
            invoiceNumber: invoiceNumber || null,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
            invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : null,
            customerNotes: customerNotes || null,
            createdBy: req.auth.userId,
            status: 'DRAFT',
          },
        });

        // Create line items if provided
        if (lineItems && Array.isArray(lineItems) && lineItems.length > 0) {
          await tx.claimLineItem.createMany({
            data: lineItems.map((item: Record<string, unknown>) => ({
              claimId: c.id,
              productId: (item.productId as string) || null,
              productName: (item.productName as string) || null,
              productSku: (item.productSku as string) || null,
              quantity: item.quantity ? Number(item.quantity) : null,
              unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
              amount: Number(item.amount || 0),
              description: (item.description as string) || null,
            })),
          });
        }

        // Create audit log
        await tx.claimAuditLog.create({
          data: {
            claimId: c.id,
            action: 'CREATED',
            toStatus: 'DRAFT',
            userId: req.auth.userId,
            userName: userRecord?.name,
          },
        });

        return c;
      });

      return res.status(201).json({ success: true, data: claim });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Claims error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
