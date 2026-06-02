import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedGeographicUnits } from './geographic-units';
import { seedDemoData } from './demo-data';
import { seedPepsiData } from './seed-pepsi';
import { seedPhase6Claims } from './phase6-claims';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed Users first (creates company too)
  await seedUsers();
  console.log('');

  // Seed Geographic Units (hierarchy data)
  await seedGeographicUnits();
  console.log('');

  // Seed Demo Data (budgets, targets, allocations, activities)
  await seedDemoData();
  console.log('');

  // Seed Pepsi V3 Data (products, stores, contracts, suggestions)
  try {
    await seedPepsiData();
  } catch (e) {
    console.warn('⚠️  Pepsi seed skipped (missing migration):', (e as Error).message?.slice(0, 80));
  }
  console.log('');

  // Phase 6: Claims & Settlement seed data
  try {
    await seedPhase6Claims();
  } catch (e) {
    console.warn('⚠️  Phase 6 seed skipped:', (e as Error).message?.slice(0, 80));
  }
  console.log('');

  console.log('🎉 Database seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
