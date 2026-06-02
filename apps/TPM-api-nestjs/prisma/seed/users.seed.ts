import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = 'admin123';

export async function seedUsers(
  prisma: PrismaClient,
  companyId: string,
) {
  console.log('  Seeding users...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const usersData = [
    {
      email: 'admin@your-domain.com',
      name: 'Nguyen Van Admin',
      role: Role.ADMIN,
      avatar: null,
    },
    {
      email: 'manager@your-domain.com',
      name: 'Tran Thi Manager',
      role: Role.MANAGER,
      avatar: null,
    },
    {
      email: 'manager2@your-domain.com',
      name: 'Le Hoang Minh',
      role: Role.MANAGER,
      avatar: null,
    },
    {
      email: 'kam1@your-domain.com',
      name: 'Pham Thanh Tung',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'kam2@your-domain.com',
      name: 'Vo Thi Lan',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'kam3@your-domain.com',
      name: 'Dang Quoc Bao',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'kam4@your-domain.com',
      name: 'Bui Ngoc Anh',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'finance@your-domain.com',
      name: 'Hoang Thi Thu',
      role: Role.FINANCE,
      avatar: null,
    },
    {
      email: 'finance2@your-domain.com',
      name: 'Ngo Duc Tai',
      role: Role.FINANCE,
      avatar: null,
    },
    {
      email: 'kam5@your-domain.com',
      name: 'Ly Minh Hoa',
      role: Role.KAM,
      avatar: null,
    },
  ];

  const users = await prisma.$transaction(
    usersData.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: passwordHash,
          role: u.role,
          avatar: u.avatar,
          isActive: true,
          companyId,
        },
      }),
    ),
  );

  console.log(`  Created ${users.length} users (password: ${DEFAULT_PASSWORD})`);
  return users;
}
