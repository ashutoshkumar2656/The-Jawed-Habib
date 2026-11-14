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

async function testConnection(label, url) {
  console.log(`Testing ${label}...`);
  const client = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    const res = await client.$queryRaw`SELECT 1 as connected`;
    console.log(`[SUCCESS] ${label}:`, res);
    await client.$disconnect();
    return true;
  } catch (e) {
    console.log(`[FAIL] ${label}:`, e.message);
    await client.$disconnect();
    return false;
  }
}

async function main() {
  await testConnection('DIRECT_URL', process.env.DIRECT_URL);
  await testConnection('DATABASE_URL', process.env.DATABASE_URL);
}

main().catch(console.error);
