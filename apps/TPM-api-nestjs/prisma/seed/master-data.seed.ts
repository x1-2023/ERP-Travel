import { PrismaClient, GeographicLevel } from '@prisma/client';

export async function seedGeographicUnits(prisma: PrismaClient) {
  console.log('  Seeding geographic units...');

  // 1. Country
  const vietnam = await prisma.geographicUnit.create({
    data: {
      code: 'VN',
      name: 'Viet Nam',
      nameEn: 'Vietnam',
      level: GeographicLevel.COUNTRY,
      sortOrder: 1,
      isActive: true,
    },
  });

  // 2. Regions
  const regionsData = [
    { code: 'VN-N', name: 'Mien Bac', nameEn: 'Northern Region', sortOrder: 1 },
    { code: 'VN-C', name: 'Mien Trung', nameEn: 'Central Region', sortOrder: 2 },
    { code: 'VN-S', name: 'Mien Nam', nameEn: 'Southern Region', sortOrder: 3 },
  ];

  const regions = await prisma.$transaction(
    regionsData.map((r) =>
      prisma.geographicUnit.create({
        data: {
          code: r.code,
          name: r.name,
          nameEn: r.nameEn,
          level: GeographicLevel.REGION,
          parentId: vietnam.id,
          sortOrder: r.sortOrder,
          isActive: true,
        },
      }),
    ),
  );

  // 3. Provinces (key provinces per region)
  const provincesData = [
    // Northern
    { code: 'VN-HN', name: 'Ha Noi', nameEn: 'Hanoi', regionIndex: 0, sortOrder: 1 },
    { code: 'VN-HP', name: 'Hai Phong', nameEn: 'Hai Phong', regionIndex: 0, sortOrder: 2 },
    { code: 'VN-QN', name: 'Quang Ninh', nameEn: 'Quang Ninh', regionIndex: 0, sortOrder: 3 },
    { code: 'VN-BN', name: 'Bac Ninh', nameEn: 'Bac Ninh', regionIndex: 0, sortOrder: 4 },
    // Central
    { code: 'VN-DN', name: 'Da Nang', nameEn: 'Da Nang', regionIndex: 1, sortOrder: 1 },
    { code: 'VN-TTH', name: 'Thua Thien Hue', nameEn: 'Thua Thien Hue', regionIndex: 1, sortOrder: 2 },
    { code: 'VN-KH', name: 'Khanh Hoa', nameEn: 'Khanh Hoa', regionIndex: 1, sortOrder: 3 },
    // Southern
    { code: 'VN-HCM', name: 'Ho Chi Minh', nameEn: 'Ho Chi Minh City', regionIndex: 2, sortOrder: 1 },
    { code: 'VN-BD', name: 'Binh Duong', nameEn: 'Binh Duong', regionIndex: 2, sortOrder: 2 },
    { code: 'VN-DN2', name: 'Dong Nai', nameEn: 'Dong Nai', regionIndex: 2, sortOrder: 3 },
    { code: 'VN-CT', name: 'Can Tho', nameEn: 'Can Tho', regionIndex: 2, sortOrder: 4 },
  ];

  const provinces = await prisma.$transaction(
    provincesData.map((p) =>
      prisma.geographicUnit.create({
        data: {
          code: p.code,
          name: p.name,
          nameEn: p.nameEn,
          level: GeographicLevel.PROVINCE,
          parentId: regions[p.regionIndex].id,
          sortOrder: p.sortOrder,
          isActive: true,
        },
      }),
    ),
  );

  const allUnits = [vietnam, ...regions, ...provinces];
  console.log(`  Created ${allUnits.length} geographic units (1 country, ${regions.length} regions, ${provinces.length} provinces)`);

  return {
    country: vietnam,
    regions,
    provinces,
    all: allUnits,
  };
}
