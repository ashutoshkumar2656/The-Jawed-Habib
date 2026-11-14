const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected, NOW() as server_time;`;
    console.log('Neon DB Connection: SUCCESS');
    console.log('Result:', result);

    const counts = {
      services: await prisma.service.count(),
      packages: await prisma.package.count(),
      categories: await prisma.serviceCategory.count(),
      appointments: await prisma.appointment.count(),
      customerProfiles: await prisma.customerProfile.count(),
      paymentRecords: await prisma.paymentRecord.count(),
      razorpayOrders: await prisma.razorpayOrderRecord.count(),
      reviews: await prisma.review.count(),
      users: await prisma.user.count(),
      staff: await prisma.staff.count(),
      auditLogs: await prisma.auditLog.count(),
      emailLogs: await prisma.emailLog.count(),
    };
    console.log('Database Table Counts:', counts);
  } catch (err) {
    console.error('Neon DB Connection: FAILED', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
