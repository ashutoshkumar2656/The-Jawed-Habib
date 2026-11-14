const fs = require('fs');
const path = require('path');

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

// 1. Strip BOM from migration.sql
const migPath = 'prisma/migrations/20261114000000_canonical_initial_database_architecture/migration.sql';
let raw = fs.readFileSync(migPath, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) {
  console.log('Detected BOM at start of migration.sql! Stripping...');
  raw = raw.slice(1);
}
// Also remove any other non-ascii whitespace at start
raw = raw.trimStart();
fs.writeFileSync(migPath, raw, 'utf8');
console.log('migration.sql rewritten cleanly without BOM. First 50 chars:', JSON.stringify(raw.slice(0, 50)));

// Also rewrite canonical_baseline.sql
fs.writeFileSync('prisma/canonical_baseline.sql', raw, 'utf8');

// 2. Check DB
const { PrismaClient } = require('@prisma/client');
async function cleanDb() {
  const prisma = new PrismaClient();
  try {
    const migs = await prisma.$queryRaw`SELECT * FROM "_prisma_migrations"`;
    console.log('Current _prisma_migrations in DB:', migs);

    // If there is a failed migration record, resolve it
    const failed = migs.filter(m => m.finished_at === null);
    if (failed.length > 0) {
      console.log('Found un-finished migration entry:', failed.map(m => m.migration_name));
      await prisma.$executeRaw`DELETE FROM "_prisma_migrations" WHERE finished_at IS NULL`;
      console.log('Deleted un-finished migration entry from _prisma_migrations so Prisma can re-run it.');
    }
  } catch (err) {
    console.log('Query / clean error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDb();
