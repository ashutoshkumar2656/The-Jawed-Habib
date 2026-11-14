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

async function run() {
  const users = await prisma.user.count();
  const categories = await prisma.serviceCategory.count();
  const services = await prisma.service.count();
  const appointments = await prisma.appointment.count();
  const payments = await prisma.paymentRecord.count();
  const orders = await prisma.razorpayOrderRecord.count();
  const sessions = await prisma.adminSession.count();
  const settings = await prisma.siteSetting.count();
  const packages = await prisma.package.count();

  console.log({
    users,
    categories,
    services,
    appointments,
    payments,
    orders,
    sessions,
    settings,
    packages,
  });

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
