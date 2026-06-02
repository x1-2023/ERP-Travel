import { PrismaClient, Channel } from '@prisma/client';

export async function seedCustomers(
  prisma: PrismaClient,
  companyId: string,
) {
  console.log('  Seeding customers...');

  const customersData = [
    // MT (Modern Trade) - 5
    {
      code: 'CUST-MT-001',
      name: 'Big C Viet Nam',
      channel: Channel.MT,
      subChannel: 'Hypermarket',
      address: '222 Tran Duy Hung, Ha Noi',
      taxCode: '0101234001',
    },
    {
      code: 'CUST-MT-002',
      name: 'VinMart (WinMart)',
      channel: Channel.MT,
      subChannel: 'Supermarket',
      address: '72 Le Thanh Ton, Q1, Ho Chi Minh',
      taxCode: '0101234002',
    },
    {
      code: 'CUST-MT-003',
      name: 'Co.op Mart',
      channel: Channel.MT,
      subChannel: 'Supermarket',
      address: '199C Nguyen Van Troi, Q. Phu Nhuan, Ho Chi Minh',
      taxCode: '0101234003',
    },
    {
      code: 'CUST-MT-004',
      name: 'AEON Mall Vietnam',
      channel: Channel.MT,
      subChannel: 'Hypermarket',
      address: '30 Bo Bao Tan Thang, Tan Phu, Ho Chi Minh',
      taxCode: '0101234004',
    },
    {
      code: 'CUST-MT-005',
      name: 'Lotte Mart',
      channel: Channel.MT,
      subChannel: 'Hypermarket',
      address: '469 Nguyen Huu Tho, Q7, Ho Chi Minh',
      taxCode: '0101234005',
    },
    // GT (General Trade) - 5
    {
      code: 'CUST-GT-001',
      name: 'Dai Ly Hoang Long',
      channel: Channel.GT,
      subChannel: 'Distributor',
      address: '45 Tran Hung Dao, Ha Noi',
      taxCode: '0102345001',
    },
    {
      code: 'CUST-GT-002',
      name: 'Dai Ly Phuong Nam',
      channel: Channel.GT,
      subChannel: 'Distributor',
      address: '88 Le Loi, Da Nang',
      taxCode: '0102345002',
    },
    {
      code: 'CUST-GT-003',
      name: 'Tap Hoa Thanh Binh',
      channel: Channel.GT,
      subChannel: 'Retail Store',
      address: '12 Nguyen Trai, Q5, Ho Chi Minh',
      taxCode: '0102345003',
    },
    {
      code: 'CUST-GT-004',
      name: 'Cua Hang Minh Tam',
      channel: Channel.GT,
      subChannel: 'Retail Store',
      address: '56 Hai Ba Trung, Hai Phong',
      taxCode: '0102345004',
    },
    {
      code: 'CUST-GT-005',
      name: 'Dai Ly Mekong',
      channel: Channel.GT,
      subChannel: 'Distributor',
      address: '23 Hoa Binh, Can Tho',
      taxCode: '0102345005',
    },
    // HORECA - 3
    {
      code: 'CUST-HR-001',
      name: 'Highland Coffee',
      channel: Channel.HORECA,
      subChannel: 'Coffee Chain',
      address: '1A Nguyen Du, Q1, Ho Chi Minh',
      taxCode: '0103456001',
    },
    {
      code: 'CUST-HR-002',
      name: 'Lotteria Vietnam',
      channel: Channel.HORECA,
      subChannel: 'QSR',
      address: '123 Le Dai Hanh, Q11, Ho Chi Minh',
      taxCode: '0103456002',
    },
    {
      code: 'CUST-HR-003',
      name: 'The Coffee House',
      channel: Channel.HORECA,
      subChannel: 'Coffee Chain',
      address: '86-88 Cao Thang, Q3, Ho Chi Minh',
      taxCode: '0103456003',
    },
    // ECOMMERCE - 2
    {
      code: 'CUST-EC-001',
      name: 'Shopee Vietnam',
      channel: Channel.ECOMMERCE,
      subChannel: 'Marketplace',
      address: 'Mapletree Business Centre, Q7, Ho Chi Minh',
      taxCode: '0104567001',
    },
    {
      code: 'CUST-EC-002',
      name: 'Lazada Vietnam',
      channel: Channel.ECOMMERCE,
      subChannel: 'Marketplace',
      address: '19 Nguyen Huu Tho, Q7, Ho Chi Minh',
      taxCode: '0104567002',
    },
  ];

  const customers = await prisma.$transaction(
    customersData.map((c) =>
      prisma.customer.create({
        data: {
          code: c.code,
          name: c.name,
          channel: c.channel,
          subChannel: c.subChannel,
          address: c.address,
          taxCode: c.taxCode,
          isActive: true,
          companyId,
        },
      }),
    ),
  );

  console.log(`  Created ${customers.length} customers`);
  return customers;
}
