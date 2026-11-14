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

async function unlock() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Checking active advisory locks...');
    const locks = await prisma.$queryRaw`
      SELECT pid, locktype, mode, granted 
      FROM pg_locks 
      WHERE locktype = 'advisory'
    `;
    console.log('Active advisory locks:', locks);

    console.log('Releasing all advisory locks...');
    await prisma.$queryRaw`SELECT pg_advisory_unlock_all()`;
    console.log('pg_advisory_unlock_all() completed.');

    // Also terminate idle connections holding locks if any
    const idles = await prisma.$queryRaw`
      SELECT pid, query, state, age(clock_timestamp(), query_start) 
      FROM pg_stat_activity 
      WHERE state = 'idle' AND pid <> pg_backend_pid()
    `;
    console.log('Other connections:', idles.length);
    for (const conn of idles) {
      console.log('Terminating stale connection pid:', conn.pid);
      await prisma.$queryRawUnsafe(`SELECT pg_terminate_backend(${conn.pid})`).catch(() => {});
    }

  } catch (err) {
    console.error('Unlock error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

unlock();
