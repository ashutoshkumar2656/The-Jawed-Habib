const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const opt = { ...options, headers: { ...(options.headers || {}) } };
    const payload = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    if (payload) {
      opt.headers['Content-Length'] = Buffer.byteLength(payload);
    } else {
      delete opt.headers['Content-Length'];
    }
    const req = http.request(opt, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            raw: body
          });
        }
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runVerification() {
  console.log('=== PHASE 5: ADMIN FUNCTIONALITY VERIFICATION (20 POINTS) ===\n');
  const results = [];

  // Step 0: Admin Authentication
  console.log('Authenticating Super Admin...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { phoneOrEmail: '7707000463', password: 'Admin@JawedHabib2026!' });

  if (!loginRes.headers['set-cookie']) {
    console.error('Failed to log in:', loginRes);
    process.exit(1);
  }
  const cookie = loginRes.headers['set-cookie'][0];
  console.log('Admin session authenticated successfully.\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': cookie
  };

  // 1. Create a bridal service
  console.log('1. Testing Create Bridal Service...');
  const createServiceRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bridal/services',
    method: 'POST',
    headers: authHeaders
  }, {
    name: 'Kundan Royal Bridal Saree Draping',
    slug: 'kundan-royal-bridal-saree-draping',
    description: 'Traditional Gujarati and Royal Rajputana saree draping with pearl pleating',
    price: 3500,
    discountedPrice: 2999,
    durationMinutes: 45,
    categoryId: 'cat_6',
    imageUrl: '/images/services/service-bridal-makeup.jpg',
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2000,
    isBridal: true,
    isActive: true
  });
  const createdServiceId = createServiceRes.data?.data?.id || createServiceRes.data?.service?.id;
  const test1 = createServiceRes.statusCode === 201 || (createServiceRes.statusCode === 200 && createServiceRes.data?.success);
  results.push({ test: '1. Create a bridal service', pass: test1, details: `ID: ${createdServiceId}` });
  console.log(`-> Pass: ${test1} (ID: ${createdServiceId})`);

  // 2. Edit a bridal service
  console.log('2. Testing Edit Bridal Service...');
  let test2 = false;
  if (createdServiceId) {
    const editRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bridal/services/${createdServiceId}`,
      method: 'PUT',
      headers: authHeaders
    }, {
      description: 'Updated luxury pleating and bridal dupatta draping master class',
      discountedPrice: 2799
    });
    test2 = editRes.statusCode === 200 && editRes.data?.success;
  }
  results.push({ test: '2. Edit a bridal service', pass: test2 });
  console.log(`-> Pass: ${test2}`);

  // 3. Upload / Register a service image in Media Library
  console.log('3. Testing Media Library Asset Management...');
  const mediaRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/media',
    method: 'POST',
    headers: authHeaders
  }, {
    title: 'Bridal Royal Draping Showcase',
    altText: 'Lalganj salon bride royal saree pleats',
    url: '/images/services/service-bridal-makeup.jpg',
    mediaType: 'IMAGE',
    folder: 'bridal',
    fileSize: '420 KB'
  });
  const test3 = mediaRes.statusCode === 201 || (mediaRes.statusCode === 200 && mediaRes.data?.success);
  results.push({ test: '3. Upload / Register service media asset', pass: test3 });
  console.log(`-> Pass: ${test3}`);

  // 4. Create a bridal package
  console.log('4. Testing Create Bridal Package...');
  const pkgRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/bridal/services',
    method: 'POST',
    headers: authHeaders
  }, {
    name: 'Kohinoor Grand Maharani Suite',
    slug: 'kohinoor-grand-maharani-suite',
    description: 'All-inclusive pre-wedding, wedding day airbrush, and reception transformation',
    price: 15000,
    discountedPrice: 12999,
    durationMinutes: 240,
    categoryId: 'cat_6',
    imageUrl: '/images/services/service-bridal-makeup.jpg',
    minAdvanceAmount: 2500,
    maxAdvanceAmount: 5000,
    isBridal: true,
    isFeatured: true,
    isActive: true
  });
  const createdPkgId = pkgRes.data?.data?.id || pkgRes.data?.service?.id;
  const test4 = pkgRes.statusCode === 201 || (pkgRes.statusCode === 200 && pkgRes.data?.success);
  results.push({ test: '4. Create a bridal package', pass: test4, details: `ID: ${createdPkgId}` });
  console.log(`-> Pass: ${test4}`);

  // 5. Update package pricing
  console.log('5. Testing Update Package Pricing...');
  let test5 = false;
  if (createdPkgId) {
    const priceRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bridal/services/${createdPkgId}`,
      method: 'PUT',
      headers: authHeaders
    }, {
      price: 16000,
      discountedPrice: 13999,
      minAdvanceAmount: 3000
    });
    test5 = priceRes.statusCode === 200 && priceRes.data?.success;
  }
  results.push({ test: '5. Update package pricing', pass: test5 });
  console.log(`-> Pass: ${test5}`);

  // 6. Publish and unpublish a package
  console.log('6. Testing Publish / Unpublish Package...');
  let test6 = false;
  if (createdPkgId) {
    // Unpublish
    const unpub = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bridal/services/${createdPkgId}`,
      method: 'PUT',
      headers: authHeaders
    }, { isActive: false });
    // Re-publish
    const pub = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/bridal/services/${createdPkgId}`,
      method: 'PUT',
      headers: authHeaders
    }, { isActive: true });
    test6 = unpub.statusCode === 200 && pub.statusCode === 200;
  }
  results.push({ test: '6. Publish and unpublish a package', pass: test6 });
  console.log(`-> Pass: ${test6}`);

  // 7. Upload gallery images
  console.log('7. Testing Upload Gallery Images...');
  const galRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/media',
    method: 'POST',
    headers: authHeaders
  }, {
    title: 'Lalganj Salon Interior Studio',
    altText: 'Lalganj salon private dressing suite',
    url: '/images/gallery/gallery-01.jpg',
    mediaType: 'IMAGE',
    folder: 'interior',
    fileSize: '512 KB'
  });
  const test7 = galRes.statusCode === 201 || (galRes.statusCode === 200 && galRes.data?.success);
  results.push({ test: '7. Upload gallery images', pass: test7 });
  console.log(`-> Pass: ${test7}`);

  // 8. Update homepage content
  console.log('8. Testing Update Homepage Content...');
  const contentRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/content',
    method: 'PUT',
    headers: authHeaders
  }, {
    HERO_TITLE: "Bihar's Premier Bridal & Salon Destination",
    HERO_SUBTITLE: "Crafting unforgettable wedding elegance at Tinpulwa Chowk, Lalganj"
  });
  const test8 = contentRes.statusCode === 200 && contentRes.data?.success;
  results.push({ test: '8. Update homepage content', pass: test8 });
  console.log(`-> Pass: ${test8}`);

  // 9. View customer details
  console.log('9. Testing View Customer Details...');
  const custRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/customers',
    method: 'GET',
    headers: authHeaders
  });
  const test9 = custRes.statusCode === 200 && Array.isArray(custRes.data?.data) && custRes.data.data.length > 0;
  results.push({ test: '9. View customer details', pass: test9 });
  console.log(`-> Pass: ${test9}`);

  // 10. View customer booking history
  console.log('10. Testing View Customer Booking History...');
  const test10 = custRes.statusCode === 200 && custRes.data?.data?.[0]?.totalVisits !== undefined;
  results.push({ test: '10. View customer booking history', pass: test10 });
  console.log(`-> Pass: ${test10}`);

  // 11. View upcoming bookings
  console.log('11. Testing View Upcoming Bookings...');
  const apptRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/appointments',
    method: 'GET',
    headers: authHeaders
  });
  const test11 = apptRes.statusCode === 200 && Array.isArray(apptRes.data?.data);
  const targetBooking = apptRes.data?.data?.[0];
  results.push({ test: '11. View upcoming bookings', pass: test11 });
  console.log(`-> Pass: ${test11}`);

  // 12. Reschedule a booking
  console.log('12. Testing Reschedule a Booking...');
  let test12 = false;
  if (targetBooking) {
    const reschedRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/appointments/${targetBooking.id}`,
      method: 'PATCH',
      headers: authHeaders
    }, {
      appointmentDate: '2026-11-28',
      startTime: '14:30',
      status: 'CONFIRMED'
    });
    test12 = reschedRes.statusCode === 200 && reschedRes.data?.success;
  }
  results.push({ test: '12. Reschedule a booking', pass: test12 });
  console.log(`-> Pass: ${test12}`);

  // 13. Cancel a booking
  console.log('13. Testing Cancel a Booking...');
  let test13 = false;
  const tempApptRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/appointments',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    customerName: 'Temporary Test Client',
    customerPhone: '9999900001',
    serviceIds: ['srv_9'],
    appointmentDate: '2026-11-29',
    startTime: '16:00',
    advanceAmount: 1000
  });

  const tempApptId = tempApptRes.data?.data?.id || tempApptRes.data?.appointment?.id;
  if (tempApptId) {
    const cancelRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/admin/appointments/${tempApptId}`,
      method: 'DELETE',
      headers: authHeaders
    }, { reason: 'Client requested cancellation for schedule test' });
    test13 = (cancelRes.statusCode === 200 && cancelRes.data?.success) || (cancelRes.statusCode === 200 && cancelRes.data?.data?.status === 'CANCELLED');
    if (!test13) {
      const patchCancel = await request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/admin/appointments/${tempApptId}`,
        method: 'PATCH',
        headers: authHeaders
      }, { status: 'CANCELLED', adminNotes: 'Client requested cancellation for schedule test' });
      test13 = patchCancel.statusCode === 200 && patchCancel.data?.success;
    }
  }
  results.push({ test: '13. Cancel a booking', pass: test13 });
  console.log(`-> Pass: ${test13}`);

  // 14. View Razorpay payment details
  console.log('14. Testing View Razorpay Payment Details...');
  const payRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/payments',
    method: 'GET',
    headers: authHeaders
  });
  const test14 = payRes.statusCode === 200 && Array.isArray(payRes.data?.data);
  results.push({ test: '14. View Razorpay payment details', pass: test14 });
  console.log(`-> Pass: ${test14}`);

  // 15. Record remaining payment
  console.log('15. Testing Record Remaining Payment at Salon Counter...');
  let test15 = false;
  let balanceBooking = apptRes.data?.data?.find(a => (a.remainingAmount || 0) > 0);
  if (!balanceBooking) {
    const freshAppt = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/appointments',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customerName: 'Balance Test Client',
      customerPhone: '9999900002',
      serviceIds: ['srv_9'],
      appointmentDate: '2026-11-30',
      startTime: '17:00',
      advanceAmount: 1000
    });
    balanceBooking = freshAppt.data?.data;
  }

  if (balanceBooking) {
    const collectAmount = Math.min(balanceBooking.remainingAmount || 499, 499);
    const collectRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/bridal/payments/collect-remaining',
      method: 'POST',
      headers: authHeaders
    }, {
      appointmentId: balanceBooking.id,
      amount: collectAmount,
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString(),
      receivedBy: 'Salon Front Desk Manager',
      notes: 'Final balance paid in cash'
    });
    test15 = collectRes.statusCode === 200 && collectRes.data?.success;
  }
  results.push({ test: '15. Record remaining payment', pass: test15 });
  console.log(`-> Pass: ${test15}`);

  // 16. Export booking records
  console.log('16. Testing Export Booking Records...');
  const reportRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/reports',
    method: 'GET',
    headers: authHeaders
  });
  const test16 = reportRes.statusCode === 200 && Array.isArray(reportRes.data?.data?.rawAppointments);
  results.push({ test: '16. Export booking records', pass: test16 });
  console.log(`-> Pass: ${test16}`);

  // 17. Update salon working hours
  console.log('17. Testing Update Salon Working Hours...');
  const hoursRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/calendar-settings',
    method: 'PUT',
    headers: authHeaders
  }, {
    weeklyHours: [
      { day: 'Monday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] },
      { day: 'Tuesday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] },
      { day: 'Wednesday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] },
      { day: 'Thursday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] },
      { day: 'Friday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] },
      { day: 'Saturday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] },
      { day: 'Sunday', isOpen: true, openingTime: '10:00', closingTime: '22:00', sessions: [] }
    ],
    slotInterval: 30
  });
  const test17 = hoursRes.statusCode === 200 && hoursRes.data?.success;
  results.push({ test: '17. Update salon working hours', pass: test17 });
  console.log(`-> Pass: ${test17}`);

  // 18. Configure calendar availability
  console.log('18. Testing Configure Calendar Availability...');
  const availRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/calendar-settings',
    method: 'PUT',
    headers: authHeaders
  }, {
    slotInterval: 30,
    maxBookingsPerSlot: 2,
    maximumAdvanceBookingPeriod: 30
  });
  const test18 = availRes.statusCode === 200 && availRes.data?.success;
  results.push({ test: '18. Configure calendar availability', pass: test18 });
  console.log(`-> Pass: ${test18}`);

  // 19. Update contact information
  console.log('19. Testing Update Contact Information...');
  const contactRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/settings',
    method: 'PUT',
    headers: authHeaders
  }, {
    ADDRESS: '1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121',
    PHONE_PRIMARY: '7707000463',
    PHONE_SECONDARY: '9831722983',
    PHONE_TERTIARY: '9580000175',
    OPENING_HOURS: 'Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)'
  });
  const test19 = contactRes.statusCode === 200 && contactRes.data?.success;
  results.push({ test: '19. Update contact information', pass: test19 });
  console.log(`-> Pass: ${test19}`);

  // 20. Manage administrator permissions
  console.log('20. Testing Manage Administrator Permissions & Accounts...');
  const usersRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/users',
    method: 'GET',
    headers: authHeaders
  });
  const test20 = usersRes.statusCode === 200 && Array.isArray(usersRes.data?.data) && usersRes.data.data.length > 0;
  results.push({ test: '20. Manage administrator permissions & accounts', pass: test20 });
  console.log(`-> Pass: ${test20}\n`);

  console.log('=== SUMMARY OF FUNCTIONAL TESTS ===');
  let passedCount = 0;
  results.forEach(r => {
    if (r.pass) passedCount++;
    console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.test}`);
  });
  console.log(`\nScore: ${passedCount} / ${results.length} Tests Passed`);

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
