import { PrismaClient } from '@prisma/client';
import { seedCompany } from './company.seed';
import { seedUsers } from './users.seed';
import { seedGeographicUnits } from './master-data.seed';
import { seedCustomers } from './customers.seed';
import { seedProducts } from './products.seed';
import { seedBudgets } from './budgets.seed';
import { seedPromotions } from './promotions.seed';
import { seedClaims } from './claims.seed';
import { seedTransactions } from './transactions.seed';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing database...');

  // Use TRUNCATE CASCADE to handle all FK constraints across 101 models
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  // Disable FK checks temporarily
  await prisma.$executeRaw`SET session_replication_role = 'replica'`;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }

  // Re-enable FK checks
  await prisma.$executeRaw`SET session_replication_role = 'origin'`;

  console.log('Database cleared.\n');
}

async function main() {
  console.log('=== Promo Master V3 - Database Seed ===\n');

  await clearDatabase();

  // 1. Company (required for all other models)
  const company = await seedCompany(prisma);

  // 2. Users (requires company)
  const users = await seedUsers(prisma, company.id);

  // 3. Geographic Units (master data, no company dependency)
  const geoUnits = await seedGeographicUnits(prisma);

  // 4. Customers (requires company)
  const customers = await seedCustomers(prisma, company.id);

  // 5. Products (requires company)
  const products = await seedProducts(prisma, company.id);

  // 6. Budgets, Allocations & Funds (requires company, users, geo units)
  const adminUser = users.find((u) => u.role === 'ADMIN') || users[0];
  const { budgets, allocations, funds } = await seedBudgets(
    prisma,
    company.id,
    adminUser.id,
    geoUnits,
  );

  // 7. Promotions (requires customers, funds, users)
  const promotions = await seedPromotions(prisma, {
    companyId: company.id,
    customers,
    funds,
    users,
  });

  // 8. Claims & Settlements (requires customers, promotions, users)
  const { claims, settlements } = await seedClaims(prisma, {
    customers,
    promotions,
    users,
  });

  // 9. Transactions (requires funds, promotions, claims)
  const transactions = await seedTransactions(prisma, {
    funds,
    promotions,
    claims,
  });

  console.log('\n=== Seed Summary ===');
  console.log(`  Company:       1`);
  console.log(`  Users:         ${users.length}`);
  console.log(`  Geo Units:     ${geoUnits.all.length}`);
  console.log(`  Customers:     ${customers.length}`);
  console.log(`  Products:      ${products.length}`);
  console.log(`  Budgets:       ${budgets.length}`);
  console.log(`  Allocations:   ${allocations.length}`);
  console.log(`  Funds:         ${funds.length}`);
  console.log(`  Promotions:    ${promotions.length}`);
  console.log(`  Claims:        ${claims.length}`);
  console.log(`  Settlements:   ${settlements.length}`);
  console.log(`  Transactions:  ${transactions.length}`);
  console.log('\n=== Seed Complete ===');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
