const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables without printing
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

const prisma = new PrismaClient();

async function run() {
  console.log('=== NEON POSTGRESQL DATABASE DETAILED AUDIT ===\n');

  // 1. Connection & Target Database Verification
  const [dbInfo] = await prisma.$queryRaw`SELECT current_database(), current_user, inet_server_addr(), version()`;
  console.log('1. DATABASE TARGET:');
  console.log(`   Database Name: ${dbInfo.current_database}`);
  console.log(`   Database User: ${dbInfo.current_user}`);
  console.log(`   Postgres Version: ${dbInfo.version.split(' ')[0]} ${dbInfo.version.split(' ')[1]}\n`);

  // 2. Users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, email: true, roleType: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`2. USERS IN DATABASE (${users.length}):`);
  users.forEach((u, i) => {
    console.log(`   [${i+1}] ${u.name} | Phone: ${u.phone} | Email: ${u.email || 'None'} | Role: ${u.roleType} | Created: ${u.createdAt.toISOString()}`);
  });
  console.log('');

  // 3. Staff
  const staff = await prisma.staff.findMany({
    include: { user: { select: { name: true, phone: true, email: true } } }
  });
  console.log(`3. STAFF MEMBERS IN DATABASE (${staff.length}):`);
  staff.forEach((s, i) => {
    console.log(`   [${i+1}] ID: ${s.id} | Name: ${s.user.name} | Phone: ${s.user.phone} | Designation: ${s.designation} | Active: ${s.isAvailable}`);
  });
  console.log('');

  // 4. Customer Profiles
  const profiles = await prisma.customerProfile.findMany({
    include: { user: { select: { name: true, phone: true } } }
  });
  console.log(`4. CUSTOMER PROFILES IN DATABASE (${profiles.length}):`);
  profiles.forEach((p, i) => {
    console.log(`   [${i+1}] Profile ID: ${p.id} | User: ${p.user.name} (${p.user.phone}) | Visits: ${p.totalVisits} | Spent: ₹${p.totalSpent} | Address: ${p.address || 'None'}`);
  });
  console.log('');

  // 5. Appointments
  const appointments = await prisma.appointment.findMany({
    include: {
      customerProfile: { include: { user: { select: { name: true, phone: true } } } },
      payments: true,
      razorpayOrders: true,
      appointmentServices: { include: { service: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'asc' }
  });
  console.log(`5. APPOINTMENTS IN DATABASE (${appointments.length}):`);
  appointments.forEach((a, i) => {
    const srvs = a.appointmentServices.map(as => as.service.name).join(', ');
    const pays = a.payments.map(p => `${p.transactionRef} (₹${p.amount}, ${p.status})`).join('; ');
    const orders = a.razorpayOrders.map(o => `${o.orderId} (${o.environment}, ${o.status})`).join('; ');
    console.log(`   [${i+1}] Apt #: ${a.appointmentNumber} | Status: ${a.status} | PayStatus: ${a.paymentStatus} | Date: ${a.appointmentDate.toISOString().split('T')[0]} ${a.startTime}`);
    console.log(`       Client: ${a.customerName || a.customerProfile?.user?.name || 'N/A'} (${a.customerPhone || a.customerProfile?.user?.phone || 'N/A'})`);
    console.log(`       Services: ${srvs || 'None'} | Total: ₹${a.totalAmount} | Deposit: ₹${a.depositAmount || 0} | Remaining: ₹${a.remainingAmount || 0}`);
    console.log(`       Payments: ${pays || 'None'}`);
    console.log(`       Orders: ${orders || 'None'}`);
    console.log(`       Created: ${a.createdAt.toISOString()}`);
  });
  console.log('');

  // 6. Payments & Orders
  const payments = await prisma.paymentRecord.findMany();
  const offlinePayments = await prisma.offlinePaymentRecord.findMany();
  const razorpayOrders = await prisma.razorpayOrderRecord.findMany();
  console.log(`6. PAYMENT RECORDS: ${payments.length} | OFFLINE PAYMENTS: ${offlinePayments.length} | RAZORPAY ORDERS: ${razorpayOrders.length}`);
  payments.forEach((p, i) => {
    console.log(`   [Pay ${i+1}] ${p.transactionRef} | Amount: ₹${p.amount} | Gateway: ${p.gateway} | GatewayPayId: ${p.gatewayPaymentId || 'None'} | Status: ${p.status}`);
  });
  console.log('');

  // 7. Other Modules
  const categoriesCount = await prisma.serviceCategory.count();
  const servicesCount = await prisma.service.count();
  const packagesCount = await prisma.package.count();
  const addonsCount = await prisma.serviceAddon.count();
  const galleryCount = await prisma.galleryImage.count();
  const reviewsCount = await prisma.review.count();
  const enquiriesCount = await prisma.enquiry.count();
  const notificationsCount = await prisma.notification.count();
  const sessionsCount = await prisma.adminSession.count();
  const settingsCount = await prisma.siteSetting.count();

  console.log('7. CATALOG & OPERATIONAL SUMMARY:');
  console.log(`   Categories: ${categoriesCount}`);
  console.log(`   Services: ${servicesCount}`);
  console.log(`   Packages: ${packagesCount}`);
  console.log(`   Add-ons: ${addonsCount}`);
  console.log(`   Gallery Images: ${galleryCount}`);
  console.log(`   Reviews: ${reviewsCount}`);
  console.log(`   Enquiries: ${enquiriesCount}`);
  console.log(`   Notifications: ${notificationsCount}`);
  console.log(`   Admin Sessions: ${sessionsCount}`);
  console.log(`   Site Settings: ${settingsCount}`);
  console.log('');

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

