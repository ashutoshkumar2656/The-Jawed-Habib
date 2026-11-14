const http = require('http');

async function testBookingFlow() {
  console.log('=== STEP 1: Test with past date (2026-11-13) as mentioned in user report ===');
  try {
    const pastRes = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Priya Sharma',
        customerPhone: '9831722983',
        customerEmail: 'priya@example.com',
        serviceIds: ['srv_bridal_1'],
        selectedAddons: ['addon_hair_ext', 'addon_family_glam'],
        appointmentDate: '2026-11-13',
        startTime: '11:30 AM',
        advanceAmount: 2000,
      })
    });
    const pastData = await pastRes.json();
    console.log('Past date response (status ' + pastRes.status + '):', pastData);
  } catch (err) {
    console.error('Past date fetch error:', err.message);
  }

  console.log('\n=== STEP 2: Test with future date (2026-11-20) ===');
  let createdAppointment = null;
  try {
    const futureRes = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Priya Sharma',
        customerPhone: '9831722983',
        customerEmail: 'priya@example.com',
        serviceIds: ['srv_bridal_1'],
        selectedAddons: ['addon_hair_ext', 'addon_family_glam'],
        appointmentDate: '2026-11-20',
        startTime: '11:30 AM',
        advanceAmount: 2000,
      })
    });
    const futureData = await futureRes.json();
    console.log('Future date response (status ' + futureRes.status + '):', futureData);
    if (futureData.success) {
      createdAppointment = futureData.data;
    }
  } catch (err) {
    console.error('Future date fetch error:', err.message);
  }

  if (createdAppointment) {
    console.log('\n=== STEP 3: Test Razorpay Order Creation (/api/payments/create-order) ===');
    try {
      const orderRes = await fetch('http://localhost:3000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: createdAppointment.id,
          paymentPurpose: 'ADVANCE_DEPOSIT',
        })
      });
      const orderData = await orderRes.json();
      console.log('Create order response (status ' + orderRes.status + '):', orderData);
    } catch (err) {
      console.error('Create order fetch error:', err.message);
    }
  }
}

testBookingFlow();
