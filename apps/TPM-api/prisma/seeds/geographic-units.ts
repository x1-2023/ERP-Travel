import { PrismaClient, GeographicLevel } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedGeographicUnits() {
  console.log('Seeding Geographic Units...');

  // Vietnam - Country level
  const vietnam = await prisma.geographicUnit.upsert({
    where: { code: 'VN' },
    update: {},
    create: {
      code: 'VN',
      name: 'Việt Nam',
      nameEn: 'Vietnam',
      level: GeographicLevel.COUNTRY,
      sortOrder: 1,
    },
  });
  console.log('Created country: Việt Nam');

  // Regions
  const northRegion = await prisma.geographicUnit.upsert({
    where: { code: 'REG-NORTH' },
    update: {},
    create: {
      code: 'REG-NORTH',
      name: 'Miền Bắc',
      nameEn: 'Northern Region',
      level: GeographicLevel.REGION,
      parentId: vietnam.id,
      sortOrder: 1,
    },
  });

  const centralRegion = await prisma.geographicUnit.upsert({
    where: { code: 'REG-CENTRAL' },
    update: {},
    create: {
      code: 'REG-CENTRAL',
      name: 'Miền Trung',
      nameEn: 'Central Region',
      level: GeographicLevel.REGION,
      parentId: vietnam.id,
      sortOrder: 2,
    },
  });

  const southRegion = await prisma.geographicUnit.upsert({
    where: { code: 'REG-SOUTH' },
    update: {},
    create: {
      code: 'REG-SOUTH',
      name: 'Miền Nam',
      nameEn: 'Southern Region',
      level: GeographicLevel.REGION,
      parentId: vietnam.id,
      sortOrder: 3,
    },
  });
  console.log('Created 3 regions');

  // Northern Provinces
  const hanoi = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-HN' },
    update: {},
    create: {
      code: 'PROV-HN',
      name: 'Hà Nội',
      nameEn: 'Hanoi',
      level: GeographicLevel.PROVINCE,
      parentId: northRegion.id,
      sortOrder: 1,
    },
  });

  const haiphong = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-HP' },
    update: {},
    create: {
      code: 'PROV-HP',
      name: 'Hải Phòng',
      nameEn: 'Hai Phong',
      level: GeographicLevel.PROVINCE,
      parentId: northRegion.id,
      sortOrder: 2,
    },
  });

  const quangninh = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-QN' },
    update: {},
    create: {
      code: 'PROV-QN',
      name: 'Quảng Ninh',
      nameEn: 'Quang Ninh',
      level: GeographicLevel.PROVINCE,
      parentId: northRegion.id,
      sortOrder: 3,
    },
  });

  // Central Provinces
  const danang = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-DN' },
    update: {},
    create: {
      code: 'PROV-DN',
      name: 'Đà Nẵng',
      nameEn: 'Da Nang',
      level: GeographicLevel.PROVINCE,
      parentId: centralRegion.id,
      sortOrder: 1,
    },
  });

  const hue = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-HUE' },
    update: {},
    create: {
      code: 'PROV-HUE',
      name: 'Thừa Thiên Huế',
      nameEn: 'Thua Thien Hue',
      level: GeographicLevel.PROVINCE,
      parentId: centralRegion.id,
      sortOrder: 2,
    },
  });

  const quangnam = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-QNA' },
    update: {},
    create: {
      code: 'PROV-QNA',
      name: 'Quảng Nam',
      nameEn: 'Quang Nam',
      level: GeographicLevel.PROVINCE,
      parentId: centralRegion.id,
      sortOrder: 3,
    },
  });

  // Southern Provinces
  const hcm = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-HCM' },
    update: {},
    create: {
      code: 'PROV-HCM',
      name: 'Hồ Chí Minh',
      nameEn: 'Ho Chi Minh City',
      level: GeographicLevel.PROVINCE,
      parentId: southRegion.id,
      sortOrder: 1,
    },
  });

  const binhduong = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-BD' },
    update: {},
    create: {
      code: 'PROV-BD',
      name: 'Bình Dương',
      nameEn: 'Binh Duong',
      level: GeographicLevel.PROVINCE,
      parentId: southRegion.id,
      sortOrder: 2,
    },
  });

  const dongnai = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-DNA' },
    update: {},
    create: {
      code: 'PROV-DNA',
      name: 'Đồng Nai',
      nameEn: 'Dong Nai',
      level: GeographicLevel.PROVINCE,
      parentId: southRegion.id,
      sortOrder: 3,
    },
  });

  const cantho = await prisma.geographicUnit.upsert({
    where: { code: 'PROV-CT' },
    update: {},
    create: {
      code: 'PROV-CT',
      name: 'Cần Thơ',
      nameEn: 'Can Tho',
      level: GeographicLevel.PROVINCE,
      parentId: southRegion.id,
      sortOrder: 4,
    },
  });
  console.log('Created 10 provinces');

  // Districts - Hà Nội (5)
  const districts = [
    { code: 'DIST-HN-HK', name: 'Quận Hoàn Kiếm', nameEn: 'Hoan Kiem District', parentId: hanoi.id },
    { code: 'DIST-HN-BD', name: 'Quận Ba Đình', nameEn: 'Ba Dinh District', parentId: hanoi.id },
    { code: 'DIST-HN-TX', name: 'Quận Thanh Xuân', nameEn: 'Thanh Xuan District', parentId: hanoi.id },
    { code: 'DIST-HN-CG', name: 'Quận Cầu Giấy', nameEn: 'Cau Giay District', parentId: hanoi.id },
    { code: 'DIST-HN-DD', name: 'Quận Đống Đa', nameEn: 'Dong Da District', parentId: hanoi.id },
    // Districts - Hải Phòng (2)
    { code: 'DIST-HP-LC', name: 'Quận Lê Chân', nameEn: 'Le Chan District', parentId: haiphong.id },
    { code: 'DIST-HP-HB', name: 'Quận Hồng Bàng', nameEn: 'Hong Bang District', parentId: haiphong.id },
    // Districts - HCM (5)
    { code: 'DIST-HCM-Q1', name: 'Quận 1', nameEn: 'District 1', parentId: hcm.id },
    { code: 'DIST-HCM-Q3', name: 'Quận 3', nameEn: 'District 3', parentId: hcm.id },
    { code: 'DIST-HCM-Q7', name: 'Quận 7', nameEn: 'District 7', parentId: hcm.id },
    { code: 'DIST-HCM-TB', name: 'Quận Tân Bình', nameEn: 'Tan Binh District', parentId: hcm.id },
    { code: 'DIST-HCM-BT', name: 'Quận Bình Thạnh', nameEn: 'Binh Thanh District', parentId: hcm.id },
    // Districts - Đà Nẵng (3)
    { code: 'DIST-DN-HC', name: 'Quận Hải Châu', nameEn: 'Hai Chau District', parentId: danang.id },
    { code: 'DIST-DN-TK', name: 'Quận Thanh Khê', nameEn: 'Thanh Khe District', parentId: danang.id },
    { code: 'DIST-DN-ST', name: 'Quận Sơn Trà', nameEn: 'Son Tra District', parentId: danang.id },
    // Districts - Thừa Thiên Huế (1)
    { code: 'DIST-HUE-TP', name: 'TP Huế', nameEn: 'Hue City', parentId: hue.id },
    // Districts - Bình Dương (1)
    { code: 'DIST-BD-TDM', name: 'TP Thủ Dầu Một', nameEn: 'Thu Dau Mot City', parentId: binhduong.id },
    // Districts - Đồng Nai (1)
    { code: 'DIST-DNA-BH', name: 'TP Biên Hòa', nameEn: 'Bien Hoa City', parentId: dongnai.id },
    // Districts - Cần Thơ (1)
    { code: 'DIST-CT-NK', name: 'Quận Ninh Kiều', nameEn: 'Ninh Kieu District', parentId: cantho.id },
    // Districts - Quảng Ninh (1)
    { code: 'DIST-QN-HL', name: 'TP Hạ Long', nameEn: 'Ha Long City', parentId: quangninh.id },
  ];

  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    await prisma.geographicUnit.upsert({
      where: { code: district.code },
      update: {},
      create: {
        code: district.code,
        name: district.name,
        nameEn: district.nameEn,
        level: GeographicLevel.DISTRICT,
        parentId: district.parentId,
        sortOrder: i + 1,
      },
    });
  }
  console.log(`Created ${districts.length} districts`);

  // Dealers (~30, 1-3 per district)
  const dealers = [
    // Hà Nội dealers (8)
    { code: 'DLR-HN-001', name: 'Đại lý Hoàng Long', nameEn: 'Hoang Long Dealer', parentCode: 'DIST-HN-HK' },
    { code: 'DLR-HN-002', name: 'Đại lý Minh Tâm', nameEn: 'Minh Tam Dealer', parentCode: 'DIST-HN-BD' },
    { code: 'DLR-HN-003', name: 'Đại lý Phú Thành', nameEn: 'Phu Thanh Dealer', parentCode: 'DIST-HN-CG' },
    { code: 'DLR-HN-004', name: 'Đại lý Trường Giang', nameEn: 'Truong Giang Dealer', parentCode: 'DIST-HN-DD' },
    { code: 'DLR-HN-005', name: 'Đại lý Bắc Hà', nameEn: 'Bac Ha Dealer', parentCode: 'DIST-HN-TX' },
    { code: 'DLR-HN-006', name: 'Đại lý Kim Liên', nameEn: 'Kim Lien Dealer', parentCode: 'DIST-HN-DD' },
    { code: 'DLR-HN-007', name: 'Đại lý Thăng Long', nameEn: 'Thang Long Dealer', parentCode: 'DIST-HN-HK' },
    { code: 'DLR-HN-008', name: 'Đại lý Đông Đô', nameEn: 'Dong Do Dealer', parentCode: 'DIST-HN-CG' },
    // Hải Phòng dealers (2)
    { code: 'DLR-HP-001', name: 'Đại lý Cảng Biển', nameEn: 'Cang Bien Dealer', parentCode: 'DIST-HP-LC' },
    { code: 'DLR-HP-002', name: 'Đại lý Hải Đăng', nameEn: 'Hai Dang Dealer', parentCode: 'DIST-HP-HB' },
    // Quảng Ninh dealer (1)
    { code: 'DLR-QN-001', name: 'Đại lý Vịnh Xanh', nameEn: 'Vinh Xanh Dealer', parentCode: 'DIST-QN-HL' },
    // TP.HCM dealers (8)
    { code: 'DLR-HCM-001', name: 'Đại lý Sài Gòn Xanh', nameEn: 'Sai Gon Xanh Dealer', parentCode: 'DIST-HCM-Q1' },
    { code: 'DLR-HCM-002', name: 'Đại lý Thành Công', nameEn: 'Thanh Cong Dealer', parentCode: 'DIST-HCM-Q7' },
    { code: 'DLR-HCM-003', name: 'Đại lý Việt Hưng', nameEn: 'Viet Hung Dealer', parentCode: 'DIST-HCM-TB' },
    { code: 'DLR-HCM-004', name: 'Đại lý Phú Mỹ', nameEn: 'Phu My Dealer', parentCode: 'DIST-HCM-Q7' },
    { code: 'DLR-HCM-005', name: 'Đại lý Bến Thành', nameEn: 'Ben Thanh Dealer', parentCode: 'DIST-HCM-Q1' },
    { code: 'DLR-HCM-006', name: 'Đại lý Tân Phú', nameEn: 'Tan Phu Dealer', parentCode: 'DIST-HCM-Q3' },
    { code: 'DLR-HCM-007', name: 'Đại lý Hòa Bình', nameEn: 'Hoa Binh Dealer', parentCode: 'DIST-HCM-BT' },
    { code: 'DLR-HCM-008', name: 'Đại lý Nguyễn Huệ', nameEn: 'Nguyen Hue Dealer', parentCode: 'DIST-HCM-Q1' },
    // Đà Nẵng dealers (4)
    { code: 'DLR-DN-001', name: 'Đại lý Biển Xanh', nameEn: 'Bien Xanh Dealer', parentCode: 'DIST-DN-HC' },
    { code: 'DLR-DN-002', name: 'Đại lý Sông Hàn', nameEn: 'Song Han Dealer', parentCode: 'DIST-DN-ST' },
    { code: 'DLR-DN-003', name: 'Đại lý Bạch Đằng', nameEn: 'Bach Dang Dealer', parentCode: 'DIST-DN-TK' },
    { code: 'DLR-DN-004', name: 'Đại lý Ngũ Hành Sơn', nameEn: 'Ngu Hanh Son Dealer', parentCode: 'DIST-DN-HC' },
    // Huế dealer (1)
    { code: 'DLR-HUE-001', name: 'Đại lý Cố Đô', nameEn: 'Co Do Dealer', parentCode: 'DIST-HUE-TP' },
    // Bình Dương dealer (2)
    { code: 'DLR-BD-001', name: 'Đại lý Bình Dương Xanh', nameEn: 'Binh Duong Xanh Dealer', parentCode: 'DIST-BD-TDM' },
    { code: 'DLR-BD-002', name: 'Đại lý Mỹ Phước', nameEn: 'My Phuoc Dealer', parentCode: 'DIST-BD-TDM' },
    // Đồng Nai dealer (1)
    { code: 'DLR-DNA-001', name: 'Đại lý Biên Hòa', nameEn: 'Bien Hoa Dealer', parentCode: 'DIST-DNA-BH' },
    // Cần Thơ dealers (2)
    { code: 'DLR-CT-001', name: 'Đại lý Ninh Kiều', nameEn: 'Ninh Kieu Dealer', parentCode: 'DIST-CT-NK' },
    { code: 'DLR-CT-002', name: 'Đại lý Tây Đô', nameEn: 'Tay Do Dealer', parentCode: 'DIST-CT-NK' },
  ];

  for (let i = 0; i < dealers.length; i++) {
    const dealer = dealers[i];
    const parent = await prisma.geographicUnit.findUnique({ where: { code: dealer.parentCode } });
    if (parent) {
      await prisma.geographicUnit.upsert({
        where: { code: dealer.code },
        update: {},
        create: {
          code: dealer.code,
          name: dealer.name,
          nameEn: dealer.nameEn,
          level: GeographicLevel.DEALER,
          parentId: parent.id,
          sortOrder: i + 1,
        },
      });
    }
  }
  console.log(`Created ${dealers.length} dealers`);

  console.log('Geographic Units seeding completed!');
}

// Run if executed directly
if (require.main === module) {
  seedGeographicUnits()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
