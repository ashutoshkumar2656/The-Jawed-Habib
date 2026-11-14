const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const { spawn } = require('child_process');
const http = require('http');

const prisma = new PrismaClient();

async function measureDatabaseDirect() {
  console.log('====================================================');
  console.log('1. DIRECT NEON POSTGRESQL QUERY LATENCY BENCHMARK');
  console.log('====================================================');
  
  // Cold start query
  const coldStart = Date.now();
  await prisma.$queryRaw`SELECT 1 as ping`;
  const coldPingMs = Date.now() - coldStart;
  console.log(`[COLD PING] Neon PostgreSQL ping: ${coldPingMs}ms`);

  // Measure 10 queries for Services
  const serviceQueryTimes = [];
  for (let i = 0; i < 10; i++) {
    const t0 = Date.now();
    await prisma.service.findMany({ where: { isActive: true }, include: { category: true } });
    serviceQueryTimes.push(Date.now() - t0);
  }
  serviceQueryTimes.sort((a, b) => a - b);
  const medianServices = serviceQueryTimes[Math.floor(serviceQueryTimes.length / 2)];
  const p95Services = serviceQueryTimes[Math.floor(serviceQueryTimes.length * 0.95)];
  console.log(`[NEON DB] Service.findMany (10 runs): Min=${serviceQueryTimes[0]}ms, Median=${medianServices}ms, P95=${p95Services}ms`);

  // Measure 10 queries for Appointments
  const aptQueryTimes = [];
  for (let i = 0; i < 10; i++) {
    const t0 = Date.now();
    await prisma.appointment.findMany({ take: 20, orderBy: { createdAt: 'desc' } });
    aptQueryTimes.push(Date.now() - t0);
  }
  aptQueryTimes.sort((a, b) => a - b);
  const medianApts = aptQueryTimes[Math.floor(aptQueryTimes.length / 2)];
  const p95Apts = aptQueryTimes[Math.floor(aptQueryTimes.length * 0.95)];
  console.log(`[NEON DB] Appointment.findMany (10 runs): Min=${aptQueryTimes[0]}ms, Median=${medianApts}ms, P95=${p95Apts}ms`);

  return { coldPingMs, medianServices, p95Services, medianApts, p95Apts };
}

function request(path, options = {}) {
  return new Promise((resolve) => {
    const start = Date.now();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          durationMs: Date.now() - start,
          bytes: Buffer.byteLength(data, 'utf8'),
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, status: 0, error: err.message, durationMs: Date.now() - start, bytes: 0 });
    });

    if (options.body) req.write(options.body);
    req.end();
  });
}

async function measureHttpEndpoints() {
  console.log('\n====================================================');
  console.log('2. NEXT.JS LIVE HTTP ENDPOINT LATENCY BENCHMARK');
  console.log('====================================================');

  const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
    env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverReady = false;
  server.stdout.on('data', d => {
    const s = d.toString();
    if (s.includes('Ready in') || s.includes('started server on') || s.includes('http://localhost:3000')) {
      serverReady = true;
    }
  });

  for (let i = 0; i < 40; i++) {
    if (serverReady) break;
    await new Promise(r => setTimeout(r, 500));
  }

  // Admin Login to get session
  const loginPayload = JSON.stringify({
    phoneOrEmail: process.env.ADMIN_DEFAULT_EMAIL || '7707000463',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@JawedHabib2026!'
  });

  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) },
    body: loginPayload
  });

  let authCookie = '';
  const setCookie = loginRes.headers?.['set-cookie'];
  if (setCookie) authCookie = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  const adminHeaders = authCookie ? { Cookie: authCookie } : {};

  const targets = [
    { name: 'Homepage', path: '/', isAdmin: false },
    { name: 'Services API', path: '/api/services', isAdmin: false },
    { name: 'Packages API', path: '/api/packages', isAdmin: false },
    { name: 'Bridal Services API', path: '/api/bridal/services', isAdmin: false },
    { name: 'Availability API', path: '/api/appointments/availability?date=2026-11-20&serviceIds=srv_1', isAdmin: false },
    { name: 'Admin Dashboard', path: '/admin/dashboard', isAdmin: true },
    { name: 'Booking Management', path: '/admin/bookings', isAdmin: true },
    { name: 'Customer Directory', path: '/admin/customers', isAdmin: true },
  ];

  const results = [];

  for (const t of targets) {
    // Cold run
    const cold = await request(t.path, { headers: t.isAdmin ? adminHeaders : {} });

    // 5 warm runs
    const warmDurations = [];
    for (let i = 0; i < 5; i++) {
      const warm = await request(t.path, { headers: t.isAdmin ? adminHeaders : {} });
      warmDurations.push(warm.durationMs);
    }
    warmDurations.sort((a, b) => a - b);
    const medianWarm = warmDurations[Math.floor(warmDurations.length / 2)];
    const p95Warm = warmDurations[warmDurations.length - 1];

    console.log(`[${cold.status}] ${t.name.padEnd(22)}: Cold=${String(cold.durationMs).padStart(4)}ms, WarmMedian=${String(medianWarm).padStart(3)}ms, WarmP95=${String(p95Warm).padStart(3)}ms, Payload=${String(cold.bytes).padStart(6)} bytes`);
    results.push({ name: t.name, path: t.path, coldMs: cold.durationMs, warmMedianMs: medianWarm, warmP95Ms: p95Warm, bytes: cold.bytes });
  }

  server.kill('SIGTERM');
  return results;
}

async function main() {
  try {
    await measureDatabaseDirect();
    await measureHttpEndpoints();
    console.log('\nPerformance audit finished successfully.');
  } catch (err) {
    console.error('Performance audit error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
