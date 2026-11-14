const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const apts = await prisma.appointment.findMany({
      select: {
        id: true,
        appointmentNumber: true,
        customerName: true,
        customerPhone: true,
        appointmentDate: true,
        startTime: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        depositAmount: true,
        remainingAmount: true,
        source: true,
        createdAt: true,
      }
    });
    console.log('--- APPOINTMENTS IN NEON ---');
    console.log(JSON.stringify(apts, null, 2));

    const payments = await prisma.paymentRecord.findMany({
      select: {
        id: true,
        appointmentId: true,
        transactionRef: true,
        amount: true,
        status: true,
        gateway: true,
        gatewayPaymentId: true,
        createdAt: true,
      }
    });
    console.log('--- PAYMENT RECORDS IN NEON ---');
    console.log(JSON.stringify(payments, null, 2));

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        roleType: true,
        createdAt: true,
      }
    });
    console.log('--- USERS IN NEON ---');
    console.log(JSON.stringify(users, null, 2));

  } catch (err) {
    console.error('Error querying Neon:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
