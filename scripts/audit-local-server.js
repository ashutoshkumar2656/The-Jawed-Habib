const { spawn } = require('child_process');
const http = require('http');

console.log('====================================================');
console.log('STARTING AUTOMATED LOCAL SERVER AUDIT & PROBE SUITE');
console.log('====================================================');

const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
  env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let serverReady = false;
let stdoutLog = '';
let stderrLog = '';

server.stdout.on('data', d => {
  const s = d.toString();
  stdoutLog += s;
  if (s.includes('Ready in') || s.includes('started server on') || s.includes('http://localhost:3000')) {
    serverReady = true;
  }
});

server.stderr.on('data', d => {
  stderrLog += d.toString();
});

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
          method: reqOptions.method,
          status: res.statusCode,
          headers: res.headers,
          durationMs: Date.now() - start,
          bodyLength: Buffer.byteLength(data, 'utf8'),
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ path, method: reqOptions.method, status: 0, error: err.message, durationMs: Date.now() - start, body: '' });
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('Waiting for Next.js production server on http://localhost:3000...');
  for (let i = 0; i < 40; i++) {
    if (serverReady) break;
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('Server readiness:', serverReady);

  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/packages',
    '/pricing',
    '/transformations',
    '/gallery',
    '/contact',
    '/faq',
    '/offers',
    '/team',
    '/stylists',
    '/consultation',
    '/booking',
    '/login',
    '/register',
    '/forgot-password',
    '/privacy',
    '/terms',
    '/sitemap.xml',
    '/robots.txt'
  ];

  console.log('\n--- 1. AUDITING PUBLIC PAGES ---');
  const publicResults = [];
  for (const p of publicRoutes) {
    const res = await request(p);
    const hasHydrationError = res.body.includes('Hydration failed') || res.body.includes('Minified React error');
    const isSuccess = res.status >= 200 && res.status < 400;
    console.log(`[${res.status}] ${p} - ${res.durationMs}ms, ${res.bodyLength} bytes ${hasHydrationError ? '⚠️ [HYDRATION ISSUE]' : '✅'}`);
    publicResults.push({ path: p, status: res.status, durationMs: res.durationMs, bytes: res.bodyLength, ok: isSuccess, hydrationIssue: hasHydrationError });
  }

  console.log('\n--- 2. AUDITING BACKEND API ROUTES ---');
  const apiRoutes = [
    '/api/health',
    '/api/health/database',
    '/api/services',
    '/api/categories',
    '/api/packages',
    '/api/bridal/services',
    '/api/transformations',
    '/api/gallery',
    '/api/reviews',
    '/api/offers',
    '/api/faqs',
    '/api/brands',
    '/api/videos',
    '/api/content',
    '/api/notifications'
  ];

  const apiResults = [];
  for (const a of apiRoutes) {
    const res = await request(a);
    let jsonOk = false;
    let itemCount = null;
    try {
      const parsed = JSON.parse(res.body);
      jsonOk = true;
      if (Array.isArray(parsed)) itemCount = parsed.length;
      else if (parsed.data && Array.isArray(parsed.data)) itemCount = parsed.data.length;
    } catch(e) {}
    console.log(`[${res.status}] ${a} - ${res.durationMs}ms, ${res.bodyLength} bytes (JSON: ${jsonOk}${itemCount !== null ? ', items: ' + itemCount : ''})`);
    apiResults.push({ path: a, status: res.status, durationMs: res.durationMs, bytes: res.bodyLength, jsonOk });
  }

  console.log('\n--- 3. AUDITING ADMIN AUTHENTICATION & ADMIN PORTAL ---');
  // Try authenticating with phone or email
  const loginPayload = JSON.stringify({
    phoneOrEmail: process.env.ADMIN_DEFAULT_EMAIL || '7707000463',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@JawedHabib2026!'
  });

  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    },
    body: loginPayload
  });

  console.log(`[${loginRes.status}] POST /api/auth/login - ${loginRes.durationMs}ms`);
  let authToken = '';
  let authCookie = '';
  try {
    const loginData = JSON.parse(loginRes.body);
    if (loginData.success && loginData.data?.token) {
      authToken = loginData.data.token;
      authCookie = `habib_session_token=${authToken}`;
      console.log(`✅ Admin authenticated successfully as ${loginData.data.user?.name} (${loginData.data.user?.role})`);
    } else {
      console.log(`Admin login attempt message:`, loginData.error || loginData);
    }
  } catch (e) {
    console.log('Login parse error:', e.message);
  }

  const setCookie = loginRes.headers['set-cookie'];
  if (setCookie) {
    authCookie = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  }

  const adminHeaders = {};
  if (authCookie) adminHeaders['Cookie'] = authCookie;
  if (authToken) adminHeaders['Authorization'] = `Bearer ${authToken}`;

  const adminRoutes = [
    '/admin/login',
    '/admin/dashboard',
    '/admin/bookings',
    '/admin/bridal',
    '/admin/calendar',
    '/admin/customers',
    '/admin/services',
    '/admin/packages',
    '/admin/staff',
    '/admin/payments',
    '/admin/gallery',
    '/admin/transformations',
    '/admin/reviews',
    '/admin/content',
    '/admin/enquiries',
    '/admin/settings'
  ];

  console.log('\nAdmin Portal Module Responses (with session token):');
  for (const adm of adminRoutes) {
    const res = await request(adm, { headers: adminHeaders });
    console.log(`[${res.status}] ${adm} - ${res.durationMs}ms, ${res.bodyLength} bytes`);
  }

  console.log('\n--- 4. AUDITING BOOKING WORKFLOW & AVAILABILITY ---');
  // Check available slots endpoint
  const slotsRes = await request('/api/services');
  console.log(`[${slotsRes.status}] GET /api/services (Services loaded for booking flow) - ${slotsRes.durationMs}ms`);

  // Check Razorpay payment order generation endpoint validation (without creating fake booking)
  const orderInvalidRes = await request('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  console.log(`[${orderInvalidRes.status}] POST /api/payments/create-order (Empty payload validation check) - ${orderInvalidRes.durationMs}ms`);

  console.log('\n--- 5. CHECKING SERVER CONSOLE LOGS & ERRORS ---');
  if (stderrLog.trim()) {
    console.log('STDERR output during audit probe:');
    console.log(stderrLog);
  } else {
    console.log('Zero runtime STDERR errors logged by Next.js server during full audit probe.');
  }

  console.log('\nShutting down audit server...');
  server.kill('SIGTERM');

  console.log('\nAudit probe completed successfully.');
}

run().catch(err => {
  console.error('Fatal probe error:', err);
  server.kill('SIGTERM');
});
