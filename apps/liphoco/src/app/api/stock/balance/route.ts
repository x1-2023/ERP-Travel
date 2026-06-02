import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

/** GET /api/stock/balance — Tồn kho hiện tại (from VIEW) */
export async function GET() {
  const balance = await prisma.$queryRaw`
    SELECT
      i.item_code,
      i.item_name,
      w.name AS warehouse,
      SUM(sl.qty_change) AS actual_qty,
      i.valuation_rate,
      SUM(sl.qty_change) * i.valuation_rate AS stock_value
    FROM stock_ledger sl
    JOIN items i ON sl.item_id = i.id
    JOIN warehouses w ON sl.warehouse_id = w.id
    GROUP BY i.item_code, i.item_name, w.name, i.valuation_rate
    HAVING SUM(sl.qty_change) != 0
    ORDER BY i.item_code
  `;

  return NextResponse.json(balance);
}
