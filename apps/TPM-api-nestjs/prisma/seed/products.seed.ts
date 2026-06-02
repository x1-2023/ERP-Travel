import { PrismaClient } from '@prisma/client';

export async function seedProducts(
  prisma: PrismaClient,
  companyId: string,
) {
  console.log('  Seeding products...');

  const productsData = [
    {
      sku: 'PEPSI-330ML',
      name: 'Pepsi Lon 330ml',
      category: 'Nuoc Giai Khat',
      brand: 'Pepsi',
      cogs: 4500,
      price: 8000,
      unit: 'LON',
    },
    {
      sku: 'PEPSI-1.5L',
      name: 'Pepsi Chai 1.5L',
      category: 'Nuoc Giai Khat',
      brand: 'Pepsi',
      cogs: 8000,
      price: 14000,
      unit: 'CHAI',
    },
    {
      sku: '7UP-330ML',
      name: '7UP Lon 330ml',
      category: 'Nuoc Giai Khat',
      brand: '7UP',
      cogs: 4200,
      price: 7500,
      unit: 'LON',
    },
    {
      sku: 'AQUA-500ML',
      name: 'Aquafina Chai 500ml',
      category: 'Nuoc Tinh Khiet',
      brand: 'Aquafina',
      cogs: 2000,
      price: 5000,
      unit: 'CHAI',
    },
    {
      sku: 'STING-330ML',
      name: 'Sting Dau Lon 330ml',
      category: 'Nuoc Tang Luc',
      brand: 'Sting',
      cogs: 4000,
      price: 8500,
      unit: 'LON',
    },
    {
      sku: 'MIRINDA-330ML',
      name: 'Mirinda Cam Lon 330ml',
      category: 'Nuoc Giai Khat',
      brand: 'Mirinda',
      cogs: 4300,
      price: 7500,
      unit: 'LON',
    },
    {
      sku: 'TWISTER-455ML',
      name: 'Twister Cam 455ml',
      category: 'Nuoc Trai Cay',
      brand: 'Twister',
      cogs: 6000,
      price: 12000,
      unit: 'CHAI',
    },
    {
      sku: 'LIPTON-455ML',
      name: 'Lipton Tra Chanh 455ml',
      category: 'Tra',
      brand: 'Lipton',
      cogs: 5000,
      price: 10000,
      unit: 'CHAI',
    },
    {
      sku: 'LAYS-52G',
      name: 'Lay\'s Khoai Tay Chien 52g',
      category: 'Snack',
      brand: 'Lay\'s',
      cogs: 5500,
      price: 10000,
      unit: 'GOI',
    },
    {
      sku: 'OSTAR-80G',
      name: 'O\'Star Snack Cua 80g',
      category: 'Snack',
      brand: 'O\'Star',
      cogs: 6500,
      price: 12000,
      unit: 'GOI',
    },
  ];

  const products = await prisma.$transaction(
    productsData.map((p) =>
      prisma.product.create({
        data: {
          sku: p.sku,
          name: p.name,
          category: p.category,
          brand: p.brand,
          cogs: p.cogs,
          price: p.price,
          unit: p.unit,
          isActive: true,
          companyId,
        },
      }),
    ),
  );

  console.log(`  Created ${products.length} products`);
  return products;
}
