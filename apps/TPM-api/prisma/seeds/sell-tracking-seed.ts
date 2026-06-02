import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSellTracking() {
  console.log('🌱 Seeding Sell Tracking data...');

  // Get existing company, customers, products
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('⚠️ No company found, skipping sell tracking seed');
    return;
  }

  const customers = await prisma.customer.findMany({
    where: { companyId: company.id },
    take: 5,
  });

  const products = await prisma.product.findMany({
    where: { companyId: company.id },
    take: 10,
  });

  if (customers.length === 0 || products.length === 0) {
    console.log('⚠️ No customers or products found, skipping');
    return;
  }

  // Generate sell-in data for last 3 months
  const sellInData = [];
  const sellOutData = [];
  const inventoryData = [];

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);

    for (const customer of customers) {
      for (const product of products.slice(0, 5)) {
        const transactionDate = new Date(date);
        transactionDate.setDate(Math.floor(Math.random() * 28) + 1);

        const quantity = Math.floor(Math.random() * 500) + 100;
        const price = Number(product.price) || 50000;
        const grossValue = quantity * price;
        const discountValue = grossValue * (Math.random() * 0.1);
        const netValue = grossValue - discountValue;

        // Sell-In
        sellInData.push({
          companyId: company.id,
          transactionCode: `SI-${customer.code}-${product.sku}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          transactionDate,
          customerId: customer.id,
          productId: product.id,
          quantity,
          grossValue,
          discountValue,
          netValue,
          sourceSystem: 'SEED',
          periodYear: transactionDate.getFullYear(),
          periodMonth: transactionDate.getMonth() + 1,
          periodWeek: getWeekNumber(transactionDate),
        });

        // Sell-Out (80% of sell-in)
        const sellOutQty = Math.floor(quantity * 0.8);
        const sellingPrice = price * 1.2;
        sellOutData.push({
          companyId: company.id,
          transactionCode: `SO-${customer.code}-${product.sku}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          transactionDate,
          customerId: customer.id,
          productId: product.id,
          quantity: sellOutQty,
          sellingPrice,
          totalValue: sellOutQty * sellingPrice,
          sourceSystem: 'SEED',
          periodYear: transactionDate.getFullYear(),
          periodMonth: transactionDate.getMonth() + 1,
          periodWeek: getWeekNumber(transactionDate),
        });
      }
    }
  }

  // Create sell-in records
  const sellInResult = await prisma.sellIn.createMany({
    data: sellInData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${sellInResult.count} sell-in records`);

  // Create sell-out records
  const sellOutResult = await prisma.sellOut.createMany({
    data: sellOutData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${sellOutResult.count} sell-out records`);

  // Create inventory snapshots
  const today = new Date();
  for (const customer of customers) {
    for (const product of products.slice(0, 5)) {
      inventoryData.push({
        companyId: company.id,
        snapshotDate: today,
        customerId: customer.id,
        productId: product.id,
        openingStock: Math.floor(Math.random() * 200) + 50,
        receivedQty: Math.floor(Math.random() * 100) + 20,
        soldQty: Math.floor(Math.random() * 80) + 10,
        adjustments: Math.floor(Math.random() * 10) - 5,
        closingStock: Math.floor(Math.random() * 150) + 30,
        avgDailySales: Math.floor(Math.random() * 20) + 5,
        daysOfStock: Math.floor(Math.random() * 30) + 5,
        stockValue: Math.floor(Math.random() * 10000000) + 1000000,
        periodYear: today.getFullYear(),
        periodMonth: today.getMonth() + 1,
        sourceSystem: 'SEED',
      });
    }
  }

  const inventoryResult = await prisma.customerInventory.createMany({
    data: inventoryData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${inventoryResult.count} inventory records`);

  console.log('✅ Sell Tracking seed completed!');
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Run if called directly
if (require.main === module) {
  seedSellTracking()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
