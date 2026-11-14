const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Zero-dependency safe .env parser
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

function parseSafeUrl(rawUrl, name) {
  if (!rawUrl) {
    return { name, status: 'MISSING' };
  }
  try {
    const parsed = new URL(rawUrl);
    return {
      name,
      status: 'CONFIGURED',
      protocol: parsed.protocol.replace(':', ''),
      username: parsed.username || 'unknown',
      hasPassword: Boolean(parsed.password),
      passwordLength: parsed.password ? parsed.password.length : 0,
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: parsed.pathname.replace(/^\//, ''),
      sslmode: parsed.searchParams.get('sslmode') || 'none',
      channel_binding: parsed.searchParams.get('channel_binding') || 'none',
      isPooler: parsed.hostname.includes('-pooler'),
      neonEndpointId: parsed.hostname.split('.')[0],
      neonRegion: parsed.hostname.split('.')[1] || 'unknown',
      neonDomain: parsed.hostname.split('.').slice(2).join('.'),
    };
  } catch (err) {
    return { name, status: 'INVALID_FORMAT', error: err.message };
  }
}

const dbUrlSafe = parseSafeUrl(process.env.DATABASE_URL, 'DATABASE_URL');
const directUrlSafe = parseSafeUrl(process.env.DIRECT_URL, 'DIRECT_URL');

console.log('--- NEON DATABASE CONNECTION AUDIT (SAFE) ---');
console.log('DATABASE_URL:', JSON.stringify(dbUrlSafe, null, 2));
console.log('DIRECT_URL:', JSON.stringify(directUrlSafe, null, 2));

// Test read-only metadata probe using Prisma
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    const meta = await prisma.$queryRaw`
      SELECT 
        current_database() as "database",
        current_user as "user",
        current_schema() as "schema",
        version() as "version"
    `;
    console.log('\n--- LIVE NEON DB METADATA ---');
    console.log(meta);

    // Check if _prisma_migrations exists
    const migrationTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '_prisma_migrations'
      ) as "migrationTableExists"
    `;
    console.log('Migration Table Exists:', migrationTable);

    if (migrationTable[0] && migrationTable[0].migrationTableExists) {
      const applied = await prisma.$queryRaw`
        SELECT id, migration_name, finished_at, applied_steps_count 
        FROM "_prisma_migrations" 
        ORDER BY started_at ASC
      `;
      console.log('Applied Migrations in DB:', applied);
    } else {
      console.log('Applied Migrations in DB: NONE (_prisma_migrations table does not exist)');
    }

    // Check total count of tables in public schema
    const publicTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('All Public Tables Count:', publicTables.length);
    console.log('All Public Tables List:', publicTables.map(t => t.table_name));

  } catch (err) {
    console.error('Database query error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
