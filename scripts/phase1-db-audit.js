const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Safe environment loading
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      let v = trimmed.slice(eqIdx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

const prisma = new PrismaClient();

async function runPhase1Audit() {
  console.log('===========================================================');
  console.log('PHASE 1 DATABASE DIRECT AUDIT');
  console.log('===========================================================');

  // 1. PostgreSQL Engine Version
  console.log('\n[1. ENGINE VERSION]');
  const versionRes = await prisma.$queryRaw`SELECT version()`;
  console.log('Connected Engine Version:', versionRes[0]?.version);

  // 2. All stored Appointments
  console.log('\n[2. ALL STORED APPOINTMENTS]');
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      customerProfile: { include: { user: true } },
      appointmentServices: { include: { service: true } },
      payments: true,
      razorpayOrders: true,
    },
  });
  console.log(`Total appointments in Neon: ${appointments.length}`);
  for (const a of appointments) {
    console.log({
      id: a.id,
      appointmentNumber: a.appointmentNumber,
      createdAt: a.createdAt,
      customerName: a.customerProfile?.user?.name,
      customerPhone: a.customerProfile?.user?.phone,
      totalAmount: a.totalAmount,
      depositAmount: a.depositAmount,
      remainingAmount: a.remainingAmount,
      status: a.status,
      paymentStatus: a.paymentStatus,
      paymentMethod: a.paymentMethod,
      serviceCount: a.appointmentServices.length,
      serviceNames: a.appointmentServices.map(as => as.service.name),
      paymentsCount: a.payments.length,
      razorpayOrdersCount: a.razorpayOrders.length,
    });
  }

  // 3. Razorpay Orders in Neon
  console.log('\n[3. STORED RAZORPAY ORDERS]');
  const orders = await prisma.razorpayOrderRecord.findMany({
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Total orders in Neon: ${orders.length}`);
  for (const o of orders) {
    console.log({
      id: o.id,
      orderId: o.orderId,
      appointmentId: o.appointmentId,
      amountInPaise: o.amountInPaise,
      currency: o.currency,
      purpose: o.purpose,
      environment: o.environment,
      status: o.status,
      createdAt: o.createdAt,
    });
  }

  // 4. Payment Records in Neon
  console.log('\n[4. STORED PAYMENT RECORDS]');
  const payments = await prisma.paymentRecord.findMany({
    orderBy: { createdAt: 'asc' },
  });
  console.log(`Total payments in Neon: ${payments.length}`);
  for (const p of payments) {
    console.log({
      id: p.id,
      transactionRef: p.transactionRef,
      gateway: p.gateway,
      gatewayPaymentId: p.gatewayPaymentId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt,
    });
  }

  // 5. _prisma_migrations table
  console.log('\n[5. ACTIVE MIGRATIONS IN NEON]');
  const migrations = await prisma.$queryRaw`
    SELECT id, migration_name, started_at, finished_at, applied_steps_count 
    FROM "_prisma_migrations" 
    ORDER BY started_at ASC
  `;
  console.log(migrations);

  await prisma.$disconnect();
}

runPhase1Audit().catch(e => {
  console.error('Audit Error:', e);
  process.exit(1);
});
