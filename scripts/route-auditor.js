const http = require('http');

const routesToTest = [
  // Public Routes
  '/',
  '/booking',
  '/services',
  '/packages',
  '/about',
  '/consultation',
  '/contact',
  '/faq',
  '/gallery',
  '/offers',
  '/pricing',
  '/privacy',
  '/stylists',
  '/team',
  '/terms',
  '/transformations',
  
  // Auth Routes
  '/login',
  '/register',
  '/forgot-password',

  // Admin Routes (Note: may redirect to /admin/login if unauthenticated, which is correct behavior)
  '/admin',
  '/admin/login',
  '/admin/dashboard',
  '/admin/analytics',
  '/admin/appointments',
  '/admin/brands',
  '/admin/bridal/bookings',
  '/admin/bridal/calendar',
  '/admin/bridal/payments',
  '/admin/bridal/services',
  '/admin/calendar',
  '/admin/calendar-settings',
  '/admin/categories',
  '/admin/content',
  '/admin/coupons',
  '/admin/customers',
  '/admin/enquiries',
  '/admin/faqs',
  '/admin/gallery',
  '/admin/import',
  '/admin/offers',
  '/admin/packages',
  '/admin/payments',
  '/admin/reports',
  '/admin/reviews',
  '/admin/services',
  '/admin/settings',
  '/admin/settings/payment-gateway',
  '/admin/settings/razorpay',
  '/admin/staff',
  '/admin/transformations',
  '/admin/users',
  '/admin/videos',

  // Core API Routes
  '/api/health',
  '/api/appointments/availability?date=2026-11-20',
  '/api/bridal/services',
  '/api/services',
  '/api/packages',
  '/api/categories',
  '/api/brands',
  '/api/gallery',
  '/api/reviews',
  '/api/faqs',
  '/api/offers'
];

async function checkRoute(urlPath) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path: urlPath,
          statusCode: res.statusCode,
          location: res.headers.location || null,
          contentLength: data.length,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        path: urlPath,
        statusCode: 0,
        error: err.message,
        ok: false
      });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path: urlPath,
        statusCode: 408,
        error: 'Timeout',
        ok: false
      });
    });
  });
}

async function run() {
  console.log(`Starting HTTP route audit across ${routesToTest.length} endpoints...`);
  const results = [];
  for (const r of routesToTest) {
    const res = await checkRoute(r);
    results.push(res);
    const statusNote = res.statusCode === 200 ? '✅ 200 OK' : 
                       (res.statusCode === 307 || res.statusCode === 308) ? `↪️ ${res.statusCode} -> ${res.location}` :
                       `❌ ${res.statusCode} ${res.error || ''}`;
    console.log(`${r.padEnd(45)} ${statusNote} (${res.contentLength || 0} bytes)`);
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`\nROUTE AUDIT COMPLETE: ${passed} passed, ${failed} failed.`);
}

run();
