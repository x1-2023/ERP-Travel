import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('Seeding users...');

  // Create default company first
  const company = await prisma.company.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: {
      code: 'DEMO',
      name: 'Demo Company',
    },
  });

  console.log(`Company created/found: ${company.name}`);

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create users
  const users = [
    {
      email: 'admin@your-domain.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN' as const,
      companyId: company.id,
    },
    {
      email: 'manager@your-domain.com',
      name: 'Manager User',
      password: managerPassword,
      role: 'MANAGER' as const,
      companyId: company.id,
    },
    {
      email: 'user@your-domain.com',
      name: 'Regular User',
      password: userPassword,
      role: 'KAM' as const,
      companyId: company.id,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: userData.password,
        name: userData.name,
        role: userData.role,
      },
      create: userData,
    });
    console.log(`User created/updated: ${user.email} (${user.role})`);
  }

  console.log('Users seeded successfully!');
}
