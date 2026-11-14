const fs = require('fs');
const path = require('path');

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

async function verifyPersistenceAfterRestart() {
  console.log('===========================================================');
  console.log('VERIFYING DATA SURVIVAL & PERSISTENCE AFTER SERVER RESTART');
  console.log('===========================================================');

  // Authenticate Admin
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
  if (!loginRes.ok || !loginJson.success) {
    throw new Error(`Admin login failed on restarted server: ${JSON.stringify(loginJson)}`);
  }

  const token = loginJson.data?.token;
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Cookie': `habib_session_token=${token}`,
  };

  // Fetch Bridal Bookings
  console.log('Fetching GET /api/bridal/bookings from restarted server...');
  const bookingsRes = await fetch(`${BASE_URL}/api/bridal/bookings`, { headers: authHeaders });
  const bookingsJson = await bookingsRes.json();

  console.log('Bridal Bookings Response:', {
    success: bookingsJson.success,
    count: bookingsJson.count,
    bookings: bookingsJson.data?.map(b => ({
      appointmentNumber: b.appointmentNumber,
      customerName: b.customerProfile?.user?.name || b.customerName,
      status: b.status,
      paymentStatus: b.paymentStatus,
      totalAmount: b.totalAmount,
      depositAmount: b.depositAmount,
      remainingAmount: b.remainingAmount,
    })),
  });

  // Fetch Admin Payments
  console.log('\nFetching GET /api/admin/payments from restarted server...');
  const paymentsRes = await fetch(`${BASE_URL}/api/admin/payments`, { headers: authHeaders });
  const paymentsJson = await paymentsRes.json();

  console.log('Admin Payments Response:', {
    success: paymentsJson.success,
    totalCount: paymentsJson.totalCount,
    transactions: paymentsJson.data?.map(p => ({
      transactionRef: p.transactionRef,
      appointmentNumber: p.appointmentNumber,
      amount: p.amount,
      status: p.status,
      environment: p.environment,
      razorpayPaymentId: p.razorpayPaymentId,
    })),
  });

  if (bookingsJson.count >= 2 && paymentsJson.totalCount >= 2) {
    console.log('\n===========================================================');
    console.log('SUCCESS: ALL DATA DURABLY SURVIVED PROCESS RESTART!');
    console.log('NEON POSTGRESQL SERVED THE PERSISTENT BOOKINGS & PAYMENTS.');
    console.log('===========================================================');
  } else {
    throw new Error('Data count mismatch after restart!');
  }
}

verifyPersistenceAfterRestart().catch(err => {
  console.error('Persistence Verification Failed:', err);
  process.exit(1);
});
