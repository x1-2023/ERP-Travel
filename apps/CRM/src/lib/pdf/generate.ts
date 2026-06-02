import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { prisma } from '@/lib/prisma'
import { QuotePDF, type QuotePDFData } from './quote-pdf'
import { OrderPDF, type OrderPDFData } from './order-pdf'
import { getCompanySettings } from './utils'

export async function generateQuotePDF(quoteId: string): Promise<Buffer> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
        include: { product: { select: { name: true } } },
      },
      contact: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      company: {
        select: {
          name: true,
          address: true,
          phone: true,
          email: true,
        },
      },
    },
  })

  if (!quote) {
    throw new Error('Quote not found')
  }

  const data: QuotePDFData = {
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    createdAt: quote.createdAt,
    validUntil: quote.validUntil,
    subtotal: Number(quote.subtotal),
    discountPercent: Number(quote.discountPercent),
    discountAmount: Number(quote.discountAmount),
    taxPercent: Number(quote.taxPercent),
    taxAmount: Number(quote.taxAmount),
    total: Number(quote.total),
    notes: quote.notes,
    terms: quote.terms,
    contact: quote.contact,
    company: quote.company,
    items: quote.items.map((item) => ({
      product: item.product,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      total: Number(item.total),
    })),
  }

  const companyInfo = await getCompanySettings()
  const element = React.createElement(QuotePDF, { quote: data, companyInfo })
  // @ts-expect-error — renderToBuffer expects DocumentProps but component wraps Document internally
  const buffer = await renderToBuffer(element)

  return Buffer.from(buffer)
}

export async function generateOrderPDF(orderId: string): Promise<Buffer> {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
      company: {
        select: {
          name: true,
          address: true,
          phone: true,
          email: true,
        },
      },
      deal: { select: { title: true } },
      quote: { select: { quoteNumber: true } },
      createdBy: { select: { name: true } },
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const data: OrderPDFData = {
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    total: Number(order.total),
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    company: order.company,
    deal: order.deal,
    quote: order.quote,
    createdBy: order.createdBy,
    items: order.items.map((item) => ({
      product: item.product,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
  }

  const companyInfo = await getCompanySettings()
  const element = React.createElement(OrderPDF, { order: data, companyInfo })
  // @ts-expect-error — renderToBuffer expects DocumentProps but component wraps Document internally
  const buffer = await renderToBuffer(element)

  return Buffer.from(buffer)
}
