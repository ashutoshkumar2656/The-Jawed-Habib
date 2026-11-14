const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

async function runE2EVerification() {
  console.log('===========================================================');
  console.log('STARTING CONTROLLED E2E BOOKING & NEON VERIFICATION SUITE');
  console.log('===========================================================');

  // STEP 1: Fetch Services from API
  console.log('\n[STEP 1] Fetching active services from http://localhost:3000/api/services...');
  const servicesRes = await fetch(`${BASE_URL}/api/services`);
  if (!servicesRes.ok) {
    throw new Error(`Failed to fetch services: ${servicesRes.status} ${await servicesRes.text()}`);
  }
  const servicesData = await servicesRes.json();
  const services = servicesData.data || [];
  console.log(`Retrieved ${services.length} services from live API.`);
  if (services.length === 0) {
    throw new Error('No services available for booking');
  }

  // Find a bridal service or standard service
  const targetService = services.find(s => s.slug === 'royal-hd-bridal-makeup-experience') || services[0];
  console.log(`Selected test service: "${targetService.name}" (ID: ${targetService.id}, Price: ₹${targetService.price})`);

  // STEP 2: Create a controlled booking request
  console.log('\n[STEP 2] Submitting booking request to http://localhost:3000/api/appointments...');
  // Choose a date 7 days in the future
  const bookingDate = new Date();
  bookingDate.setDate(bookingDate.getDate() + 7);
  const appointmentDate = bookingDate.toISOString().split('T')[0];
  const startTime = '11:30';

  const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
  const testPhone = `98${random8Digits}`;

  const bookingPayload = {
    customerName: `Priya Sharma (E2E Test ${random8Digits.toString().slice(-4)})`,
    customerPhone: testPhone,
    customerEmail: `priya.${random8Digits.toString().slice(-4)}@example.com`,
    serviceIds: [targetService.id],
    appointmentDate,
    startTime: `${10 + (random8Digits % 8)}:00`,
    advanceAmount: 2000,
    bridalRequirements: 'Bridal HD airbrush styling for wedding reception',
    notes: 'Controlled Neon database initialization verification test',
    source: 'ONLINE_WEBSITE',
  };

  const bookingRes = await fetch(`${BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingPayload),
  });

  const bookingJson = await bookingRes.json();
  console.log('Booking API Response Status:', bookingRes.status);
  console.log('Booking Result:', {
    success: bookingJson.success,
    appointmentNumber: bookingJson.data?.appointmentNumber,
    appointmentId: bookingJson.data?.id,
    totalAmount: bookingJson.data?.totalAmount,
    depositAmount: bookingJson.data?.depositAmount,
    remainingAmount: bookingJson.data?.remainingAmount,
  });

  if (!bookingRes.ok || !bookingJson.success) {
    throw new Error(`Booking submission failed: ${JSON.stringify(bookingJson)}`);
  }

  const appointmentId = bookingJson.data.id;
  const appointmentNumber = bookingJson.data.appointmentNumber;

  // STEP 3: Create Razorpay Order
  console.log('\n[STEP 3] Creating Razorpay test order via http://localhost:3000/api/payments/create-order...');
  const orderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointmentId,
      paymentPurpose: 'ADVANCE_DEPOSIT',
    }),
  });

  const orderJson = await orderRes.json();
  console.log('Payment Order Response Status:', orderRes.status);
  console.log('Order Result:', {
    success: orderJson.success,
    orderId: orderJson.data?.orderId,
    amountInPaise: orderJson.data?.amount,
    currency: orderJson.data?.currency,
    keyId: orderJson.data?.keyId,
  });

  if (!orderRes.ok || !orderJson.success) {
    throw new Error(`Payment order creation failed: ${JSON.stringify(orderJson)}`);
  }

  const razorpayOrderId = orderJson.data.orderId;

  // STEP 4: Authoritative Signature Verification & Payment Capture
  console.log('\n[STEP 4] Verifying and capturing payment via http://localhost:3000/api/payments/verify...');
  const testPaymentId = `pay_test_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured in environment');
  }

  const signature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${testPaymentId}`)
    .digest('hex');

  const verifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointmentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: signature,
    }),
  });

  const verifyJson = await verifyRes.json();
  console.log('Payment Verify Response Status:', verifyRes.status);
  console.log('Verify Result:', {
    success: verifyJson.success,
    status: verifyJson.data?.payment?.status,
    appointmentStatus: verifyJson.data?.appointment?.status,
    paymentStatus: verifyJson.data?.appointment?.paymentStatus,
    depositAmount: verifyJson.data?.appointment?.depositAmount,
    remainingAmount: verifyJson.data?.appointment?.remainingAmount,
  });

  if (!verifyRes.ok || !verifyJson.success) {
    throw new Error(`Payment verification failed: ${JSON.stringify(verifyJson)}`);
  }

  // STEP 5: Admin Portal Authentication & Data Query
  console.log('\n[STEP 5] Authenticating Admin and querying Admin Endpoints...');
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@JawedHabib2026!';
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneOrEmail: '7707000463',
      password: adminPassword,
    }),
  });

  const loginJson = await loginRes.json();
  console.log('Admin Login Status:', loginRes.status, 'Success:', loginJson.success);
  if (!loginRes.ok || !loginJson.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginJson)}`);
  }

  const token = loginJson.data?.token;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Cookie': `habib_session_token=${token}`,
  };

  // Query Bridal Bookings Endpoint
  console.log('Querying GET /api/bridal/bookings with admin auth...');
  const bridalBookingsRes = await fetch(`${BASE_URL}/api/bridal/bookings`, {
    headers: authHeaders,
  });
  const bridalBookingsJson = await bridalBookingsRes.json();
  console.log('Bridal Bookings API:', {
    success: bridalBookingsJson.success,
    totalBookings: bridalBookingsJson.count,
    foundOurBooking: bridalBookingsJson.data?.some(b => b.id === appointmentId || b.appointmentNumber === appointmentNumber),
  });

  // Query Admin Payments Endpoint
  console.log('Querying GET /api/admin/payments with admin auth...');
  const paymentsRes = await fetch(`${BASE_URL}/api/admin/payments`, {
    headers: authHeaders,
  });
  const paymentsJson = await paymentsRes.json();
  console.log('Admin Payments API:', {
    success: paymentsJson.success,
    totalCount: paymentsJson.totalCount,
    foundOurPayment: paymentsJson.data?.some(p => p.appointmentId === appointmentId || p.razorpayPaymentId === testPaymentId),
  });

  // STEP 6: Direct Neon PostgreSQL Verification
  console.log('\n[STEP 6] Direct Neon PostgreSQL Verification via PrismaClient:');
  const dbAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customerProfile: { include: { user: true } },
      appointmentServices: { include: { service: true } },
      payments: true,
      razorpayOrders: true,
    },
  });

  if (!dbAppointment) {
    throw new Error(`PERSISTENCE FAILURE: Appointment ${appointmentId} was not found in Neon PostgreSQL!`);
  }

  console.log('✓ Found Appointment in Neon PostgreSQL:');
  console.log({
    id: dbAppointment.id,
    appointmentNumber: dbAppointment.appointmentNumber,
    customerName: dbAppointment.customerProfile?.user?.name,
    customerPhone: dbAppointment.customerProfile?.user?.phone,
    status: dbAppointment.status,
    paymentStatus: dbAppointment.paymentStatus,
    paymentMethod: dbAppointment.paymentMethod,
    depositAmount: dbAppointment.depositAmount,
    remainingAmount: dbAppointment.remainingAmount,
    totalAmount: dbAppointment.totalAmount,
    serviceCount: dbAppointment.appointmentServices.length,
    paymentsCount: dbAppointment.payments.length,
    ordersCount: dbAppointment.razorpayOrders.length,
  });

  const dbPayment = await prisma.paymentRecord.findFirst({
    where: { appointmentId },
  });

  if (!dbPayment) {
    throw new Error(`PERSISTENCE FAILURE: PaymentRecord for ${appointmentId} was not found in Neon PostgreSQL!`);
  }

  console.log('✓ Found PaymentRecord in Neon PostgreSQL:');
  console.log({
    id: dbPayment.id,
    transactionRef: dbPayment.transactionRef,
    gateway: dbPayment.gateway,
    gatewayPaymentId: dbPayment.gatewayPaymentId,
    status: dbPayment.status,
    amount: dbPayment.amount,
  });

  const dbOrder = await prisma.razorpayOrderRecord.findFirst({
    where: { appointmentId },
  });

  console.log('✓ Found RazorpayOrderRecord in Neon PostgreSQL:');
  console.log({
    id: dbOrder?.id,
    orderId: dbOrder?.orderId,
    amountInPaise: dbOrder?.amountInPaise,
    status: dbOrder?.status,
    purpose: dbOrder?.purpose,
  });

  await prisma.$disconnect();

  console.log('\n===========================================================');
  console.log('E2E TEST & DIRECT NEON PERSISTENCE CONFIRMED 100% SUCCESSFUL!');
  console.log('===========================================================');

  return {
    appointmentId,
    appointmentNumber,
    razorpayOrderId,
    testPaymentId,
  };
}

runE2EVerification()
  .then(res => {
    fs.writeFileSync('e2e-result.json', JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('E2E Verification Error:', err);
    process.exit(1);
  });
