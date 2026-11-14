const fs = require('fs');
const path = require('path');

// Manually parse .env without external dependencies
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

async function testConnection() {
  console.log('Testing Prisma connection to Neon PostgreSQL...');
  console.log('Host target:', new URL(process.env.DATABASE_URL).host);
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as connected, NOW() as server_time, current_database() as db_name`;
    console.log('Connection SUCCESS! Elapsed:', Date.now() - start, 'ms');
    console.log('Result:', result);
  } catch (err) {
    console.error('Connection FAILED:', err.message);
    if (err.code) console.error('Error Code:', err.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
