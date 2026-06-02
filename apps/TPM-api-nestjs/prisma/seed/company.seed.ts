import { PrismaClient } from '@prisma/client';

export async function seedCompany(prisma: PrismaClient) {
  console.log('  Seeding company...');

  const company = await prisma.company.create({
    data: {
      code: 'DEMO',
      name: 'Demo FMCG Vietnam',
      logo: null,
      settings: {
        currency: 'VND',
        locale: 'vi-VN',
        timezone: 'Asia/Ho_Chi_Minh',
        fiscalYearStart: 1,
      },
    },
  });

  console.log(`  Created company: ${company.name} (${company.id})`);
  return company;
}
