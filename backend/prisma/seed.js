import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if demo tenant already exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { shopDomain: 'demo-store.myshopify.com' },
  });

  if (existingTenant) {
    console.log('✅ Demo tenant already exists, skipping...');
    return;
  }

  // Create demo tenant
  const demoTenant = await prisma.tenant.create({
    data: {
      shopDomain: 'demo-store.myshopify.com',
      accessToken: 'shpat_demo_token_for_testing_only',
      name: 'Demo Shopify Store',
      isActive: true,
    },
  });

  console.log('✅ Created demo tenant:', demoTenant);

  // Create some demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '1001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        totalSpent: 1250.50,
        ordersCount: 5,
        shopifyCreatedAt: new Date('2024-01-15'),
        shopifyUpdatedAt: new Date('2024-12-01'),
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '1002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        totalSpent: 890.25,
        ordersCount: 3,
        shopifyCreatedAt: new Date('2024-02-20'),
        shopifyUpdatedAt: new Date('2024-11-15'),
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '1003',
        email: 'bob.wilson@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        totalSpent: 2100.00,
        ordersCount: 8,
        shopifyCreatedAt: new Date('2024-01-10'),
        shopifyUpdatedAt: new Date('2024-12-03'),
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} demo customers`);

  // Create some demo products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '2001',
        title: 'Premium T-Shirt',
        handle: 'premium-t-shirt',
        description: 'High quality cotton t-shirt',
        vendor: 'Demo Brand',
        productType: 'Apparel',
        status: 'active',
        totalSales: 1250.50,
        shopifyCreatedAt: new Date('2024-01-01'),
        shopifyUpdatedAt: new Date('2024-12-01'),
      },
    }),
    prisma.product.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '2002',
        title: 'Wireless Headphones',
        handle: 'wireless-headphones',
        description: 'Noise-cancelling wireless headphones',
        vendor: 'Tech Corp',
        productType: 'Electronics',
        status: 'active',
        totalSales: 890.25,
        shopifyCreatedAt: new Date('2024-02-01'),
        shopifyUpdatedAt: new Date('2024-11-15'),
      },
    }),
    prisma.product.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '2003',
        title: 'Leather Wallet',
        handle: 'leather-wallet',
        description: 'Genuine leather wallet',
        vendor: 'Accessories Inc',
        productType: 'Accessories',
        status: 'active',
        totalSales: 420.00,
        shopifyCreatedAt: new Date('2024-03-01'),
        shopifyUpdatedAt: new Date('2024-10-20'),
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} demo products`);

  // Create some demo orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '3001',
        orderNumber: '1001',
        customerId: customers[0].id,
        email: 'john.doe@example.com',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        totalPrice: 450.50,
        subtotalPrice: 400.00,
        totalTax: 50.50,
        currency: 'USD',
        orderDate: new Date('2024-11-15'),
        shopifyCreatedAt: new Date('2024-11-15'),
        shopifyUpdatedAt: new Date('2024-11-16'),
        lineItems: {
          create: [
            {
              shopifyId: '4001',
              productId: products[0].id,
              title: 'Premium T-Shirt',
              quantity: 2,
              price: 200.00,
            },
            {
              shopifyId: '4002',
              productId: products[2].id,
              title: 'Leather Wallet',
              quantity: 1,
              price: 200.00,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '3002',
        orderNumber: '1002',
        customerId: customers[1].id,
        email: 'jane.smith@example.com',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        totalPrice: 320.25,
        subtotalPrice: 290.25,
        totalTax: 30.00,
        currency: 'USD',
        orderDate: new Date('2024-11-20'),
        shopifyCreatedAt: new Date('2024-11-20'),
        shopifyUpdatedAt: new Date('2024-11-21'),
        lineItems: {
          create: [
            {
              shopifyId: '4003',
              productId: products[1].id,
              title: 'Wireless Headphones',
              quantity: 1,
              price: 290.25,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        tenantId: demoTenant.id,
        shopifyId: '3003',
        orderNumber: '1003',
        customerId: customers[2].id,
        email: 'bob.wilson@example.com',
        financialStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        totalPrice: 800.00,
        subtotalPrice: 750.00,
        totalTax: 50.00,
        currency: 'USD',
        orderDate: new Date('2024-12-01'),
        shopifyCreatedAt: new Date('2024-12-01'),
        shopifyUpdatedAt: new Date('2024-12-02'),
        lineItems: {
          create: [
            {
              shopifyId: '4004',
              productId: products[0].id,
              title: 'Premium T-Shirt',
              quantity: 4,
              price: 750.00,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${orders.length} demo orders`);

  console.log('\n🎉 Database seeded successfully!');
  console.log(`📊 Demo Tenant ID: ${demoTenant.id}`);
  console.log('📝 You can now test the API endpoints with this demo tenant');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

