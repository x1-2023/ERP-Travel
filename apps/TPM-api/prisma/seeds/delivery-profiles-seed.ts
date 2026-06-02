import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDeliveryProfiles() {
  console.log('🌱 Seeding Delivery Profiles...');

  // Get existing company and customers
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('⚠️ No company found, skipping delivery profiles seed');
    return;
  }

  const customers = await prisma.customer.findMany({
    where: { companyId: company.id },
    take: 10,
  });

  if (customers.length === 0) {
    console.log('⚠️ No customers found, skipping');
    return;
  }

  const deliveryDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const regions = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
  const zones = ['Zone A', 'Zone B', 'Zone C'];

  let profilesCreated = 0;
  let schedulesCreated = 0;

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];

    // Check if profile already exists
    const existing = await prisma.deliveryProfile.findUnique({
      where: { customerId: customer.id },
    });

    if (existing) continue;

    // Random delivery days (2-3 days per week)
    const numDays = Math.floor(Math.random() * 2) + 2;
    const shuffledDays = [...deliveryDays].sort(() => Math.random() - 0.5);
    const preferredDays = shuffledDays.slice(0, numDays) as any[];

    // Create delivery profile
    const profile = await prisma.deliveryProfile.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        deliveryAddress: customer.address || `${i + 1} Nguyễn Huệ, Quận 1`,
        deliveryCity: regions[i % regions.length],
        deliveryRegion: regions[i % regions.length],
        deliveryZone: zones[i % zones.length],
        contactPerson: `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
        contactPhone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        contactEmail: `contact${i}@example.com`,
        preferredDays,
        preferredTimeStart: '08:00',
        preferredTimeEnd: '17:00',
        standardLeadTime: 2,
        expressLeadTime: 1,
        maxDeliveriesPerWeek: 3,
        maxUnitsPerDelivery: 500,
        warehouseCapacity: 2000,
        requiresAppointment: i % 3 === 0,
        requiresPOD: true,
        specialInstructions: i % 2 === 0 ? 'Giao hàng tầng hầm B2' : null,
        routeCode: `R${String(Math.floor(i / 3) + 1).padStart(2, '0')}`,
        routeSequence: (i % 3) + 1,
        distanceFromDC: Math.floor(Math.random() * 50) + 5,
        avgDeliveryTime: Math.floor(Math.random() * 60) + 30,
        onTimeRate: 85 + Math.floor(Math.random() * 15),
        isActive: true,
      },
    });
    profilesCreated++;

    // Create delivery schedules for each preferred day
    for (const day of preferredDays) {
      await prisma.deliverySchedule.create({
        data: {
          companyId: company.id,
          profileId: profile.id,
          scheduleType: 'RECURRING',
          frequency: 'WEEKLY',
          dayOfWeek: day,
          timeWindowStart: '09:00',
          timeWindowEnd: '12:00',
          estimatedUnits: Math.floor(Math.random() * 100) + 50,
          estimatedValue: Math.floor(Math.random() * 50000000) + 10000000,
          priority: i % 4 === 0 ? 'HIGH' : 'NORMAL',
          isActive: true,
          effectiveFrom: new Date(),
        },
      });
      schedulesCreated++;
    }
  }

  console.log(`✅ Created ${profilesCreated} delivery profiles`);
  console.log(`✅ Created ${schedulesCreated} delivery schedules`);

  // Create some promotion deliveries if promotions exist
  const promotions = await prisma.promotion.findMany({
    where: { customer: { companyId: company.id } },
    take: 5,
  });

  const profiles = await prisma.deliveryProfile.findMany({
    where: { companyId: company.id },
    take: 5,
  });

  let deliveriesCreated = 0;

  if (promotions.length > 0 && profiles.length > 0) {
    for (const promotion of promotions) {
      for (const profile of profiles.slice(0, 2)) {
        const plannedDate = new Date();
        plannedDate.setDate(plannedDate.getDate() + Math.floor(Math.random() * 14) + 1);

        await prisma.promotionDelivery.create({
          data: {
            companyId: company.id,
            promotionId: promotion.id,
            profileId: profile.id,
            plannedDate,
            plannedUnits: Math.floor(Math.random() * 200) + 50,
            plannedValue: Math.floor(Math.random() * 100000000) + 20000000,
            status: 'PLANNED',
            priority: 'NORMAL',
          },
        });
        deliveriesCreated++;
      }
    }
  }

  console.log(`✅ Created ${deliveriesCreated} promotion deliveries`);
  console.log('✅ Delivery Profiles seed completed!');
}

// Run if called directly
if (require.main === module) {
  seedDeliveryProfiles()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
