const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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

async function inspectNeon() {
  const apt = await prisma.appointment.findFirst({
    include: {
      customerProfile: { include: { user: true } },
      appointmentServices: { include: { service: true } },
      payments: true,
      razorpayOrders: true,
    },
  });

  console.log('--- APPOINTMENT IN NEON ---');
  console.log({
    id: apt.id,
    appointmentNumber: apt.appointmentNumber,
    customerName: apt.customerProfile.user.name,
    customerPhone: apt.customerProfile.user.phone,
    status: apt.status,
    paymentStatus: apt.paymentStatus,
    paymentMethod: apt.paymentMethod,
    depositAmount: apt.depositAmount,
    remainingAmount: apt.remainingAmount,
    totalAmount: apt.totalAmount,
    service: apt.appointmentServices.map(as => as.service.name),
  });

  console.log('--- PAYMENT RECORD IN NEON ---');
  for (const p of apt.payments) {
    console.log({
      id: p.id,
      transactionRef: p.transactionRef,
      gateway: p.gateway,
      gatewayPaymentId: p.gatewayPaymentId,
      status: p.status,
      amount: p.amount,
      createdAt: p.createdAt,
    });
  }

  console.log('--- RAZORPAY ORDER RECORD IN NEON ---');
  for (const o of apt.razorpayOrders) {
    console.log({
      id: o.id,
      orderId: o.orderId,
      amountInPaise: o.amountInPaise,
      purpose: o.purpose,
      status: o.status,
      environment: o.environment,
    });
  }

  await prisma.$disconnect();
}

inspectNeon().catch(console.error);
