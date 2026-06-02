import { PrismaClient, TourMarket, TourPackageStatus, TourType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenantId = process.env.TRAVELOPS_SEED_TENANT_ID ?? "demo-tenant";

  const tourPackage = await prisma.tourPackage.upsert({
    where: {
      tenantId_code: {
        tenantId,
        code: "VN-NORTH-5D4N"
      }
    },
    update: {
      status: TourPackageStatus.ACTIVE,
      defaultAdultPrice: "16900000",
      defaultCostEstimate: "11800000"
    },
    create: {
      tenantId,
      code: "VN-NORTH-5D4N",
      name: "Northern Vietnam Highlights 5D4N",
      description: "Hanoi, Ha Long, Ninh Binh package for inbound and domestic operators.",
      market: TourMarket.DOMESTIC,
      type: TourType.PACKAGE,
      status: TourPackageStatus.ACTIVE,
      destinationCountry: "VN",
      destinationRegion: "Northern Vietnam",
      startCity: "Hanoi",
      endCity: "Hanoi",
      durationDays: 5,
      durationNights: 4,
      minPax: 2,
      maxPax: 24,
      defaultCurrency: "VND",
      defaultAdultPrice: "16900000",
      defaultCostEstimate: "11800000",
      tags: ["domestic", "hanoi", "halong", "ninhbinh"]
    }
  });

  await prisma.tourItineraryDay.upsert({
    where: {
      packageId_dayNumber: {
        packageId: tourPackage.id,
        dayNumber: 1
      }
    },
    update: {},
    create: {
      tenantId,
      packageId: tourPackage.id,
      dayNumber: 1,
      title: "Arrival in Hanoi",
      city: "Hanoi",
      description: "Airport pickup, hotel check-in, and welcome dinner.",
      meals: ["Dinner"]
    }
  });

  await prisma.tourPriceTier.createMany({
    data: [
      {
        tenantId,
        packageId: tourPackage.id,
        name: "FIT 2-5 pax",
        minPax: 2,
        maxPax: 5,
        currency: "VND",
        adultPrice: "16900000",
        childPrice: "13500000"
      },
      {
        tenantId,
        packageId: tourPackage.id,
        name: "Group 10-24 pax",
        minPax: 10,
        maxPax: 24,
        currency: "VND",
        adultPrice: "13900000",
        childPrice: "11100000"
      }
    ],
    skipDuplicates: true
  });

  await prisma.tourDeparture.upsert({
    where: {
      tenantId_code: {
        tenantId,
        code: "VN-NORTH-2026-07-15"
      }
    },
    update: {},
    create: {
      tenantId,
      packageId: tourPackage.id,
      code: "VN-NORTH-2026-07-15",
      startDate: new Date("2026-07-15T00:00:00.000Z"),
      endDate: new Date("2026-07-19T00:00:00.000Z"),
      capacity: 24,
      revenueTarget: "333600000",
      costBudget: "244800000"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
