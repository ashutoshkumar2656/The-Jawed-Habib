const fs = require('fs');
const path = require('path');

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

const { PrismaClient } = require('@prisma/client');

async function inspectNeon() {
  const prisma = new PrismaClient();
  try {
    console.log('--- Inspecting Neon PostgreSQL Tables ---');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Tables found in public schema:', tables.map(t => t.table_name));

    // Check counts of key tables
    const counts = {};
    for (const t of tables) {
      const name = t.table_name;
      try {
        const c = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${name}"`);
        counts[name] = Number(c[0].count);
      } catch (err) {
        counts[name] = `Error: ${err.message}`;
      }
    }
    console.log('Table Counts in Neon:', JSON.stringify(counts, null, 2));

    // Check recent appointments
    try {
      const apts = await prisma.$queryRaw`
        SELECT id, "bookingReference", "appointmentDate", "startTime", status, "paymentStatus", "totalAmount", "createdAt"
        FROM "Appointment"
        ORDER BY "createdAt" DESC
        LIMIT 5;
      `;
      console.log('Recent Appointments in Neon:', apts);
    } catch (e) {
      console.log('Could not query Appointment table:', e.message);
    }

    // Check PaymentGatewaySettingRecord
    try {
      const pgs = await prisma.$queryRaw`
        SELECT id, "updatedAt"
        FROM "PaymentGatewaySettingRecord";
      `;
      console.log('PaymentGatewaySettingRecord in Neon:', pgs);
    } catch (e) {
      console.log('Could not query PaymentGatewaySettingRecord table:', e.message);
    }
  } catch (err) {
    console.error('Inspection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectNeon();
