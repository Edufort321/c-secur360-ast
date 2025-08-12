const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      subdomain: 'demo',
      companyName: 'Version Démo C-Secur360',
      plan: 'demo'
    }
  });

  const futureClientTenant = await prisma.tenant.upsert({
    where: { subdomain: 'futureclient' },
    update: {},
    create: {
      subdomain: 'futureclient',
      companyName: 'Client Potentiel',
      plan: 'trial'
    }
  });

  const csecurTenant = await prisma.tenant.upsert({
    where: { subdomain: 'c-secur360' },
    update: {},
    create: {
      subdomain: 'c-secur360',
      companyName: 'C-Secur360 (Admin)',
      plan: 'admin'
    }
  });

  console.log('Tenants seeded:', {
    demo: demoTenant.companyName,
    futureclient: futureClientTenant.companyName,
    admin: csecurTenant.companyName
  });
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
