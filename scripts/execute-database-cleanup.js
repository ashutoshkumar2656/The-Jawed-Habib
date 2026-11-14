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

const isDryRun = process.argv.includes('--dry-run');

async function runCleanup() {
  console.log(`=== NEON POSTGRESQL DATABASE CLEANUP (Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE EXECUTION'}) ===\n`);

  // Step 1: Verify Database Identity
  const [dbInfo] = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
  if (dbInfo.current_database !== 'neondb') {
    throw new Error(`SAFETY ABORT: Target database is ${dbInfo.current_database}, expected 'neondb'!`);
  }
  console.log(`[VERIFIED] Connected to target database: ${dbInfo.current_database} as user ${dbInfo.current_user}`);

  // Step 2: Identify Test Appointments
  const testAptNumbers = [
    'JH-LAL-2026-000130',
    'JH-LAL-2026-000131',
    'JH-LAL-2026-000132',
    'JH-LAL-2026-000133',
    'JH-LAL-2026-000134',
  ];
  const testAppointments = await prisma.appointment.findMany({
    where: { appointmentNumber: { in: testAptNumbers } },
    select: { id: true, appointmentNumber: true }
  });
  const testAptIds = testAppointments.map(a => a.id);
  console.log(`[IDENTIFIED] Test Appointments to delete: ${testAppointments.length} (${testAppointments.map(a => a.appointmentNumber).join(', ')})`);

  // Step 3: Identify Demo Staff
  const demoStaffPhones = ['9831722983', '9580000175', '9123456780'];
  const demoStaffUsers = await prisma.user.findMany({
    where: { phone: { in: demoStaffPhones } },
    include: { staff: true }
  });
  const demoStaffUserIds = demoStaffUsers.map(u => u.id);
  const demoStaffIds = demoStaffUsers.map(u => u.staff?.id).filter(Boolean);
  console.log(`[IDENTIFIED] Demo Staff to delete: ${demoStaffUsers.length} (${demoStaffUsers.map(u => u.name).join(', ')})`);

  // Step 4: Identify Test & Demo Customers
  const testCustomerPhones = [
    '9876543210', // Rohan Kumar (seeded demo customer)
    '9886024731', // Priya Sharma E2E Test 4731
    '9813147549', // Priya Sharma E2E Test 7549
    '9831722999', // Ananya Roy (QA Test)
  ];
  const testCustomerUsers = await prisma.user.findMany({
    where: { phone: { in: testCustomerPhones } },
    include: { customerProfile: true }
  });
  const testCustomerUserIds = testCustomerUsers.map(u => u.id);
  const testProfileIds = testCustomerUsers.map(u => u.customerProfile?.id).filter(Boolean);
  console.log(`[IDENTIFIED] Test Customers to delete: ${testCustomerUsers.length} (${testCustomerUsers.map(u => u.name).join(', ')})`);

  // Step 5: Safety Check - Ensure Primary Owner and Genuine Users are strictly preserved!
  const ownerUser = await prisma.user.findFirst({ where: { phone: '7707000463' } });
  if (!ownerUser) {
    throw new Error('CRITICAL SAFETY ABORT: Primary owner account (7707000463) not found in database!');
  }
  if (demoStaffUserIds.includes(ownerUser.id) || testCustomerUserIds.includes(ownerUser.id)) {
    throw new Error('CRITICAL SAFETY ABORT: Primary owner account ID was mistakenly scheduled for deletion!');
  }
  console.log(`[VERIFIED SAFETY] Primary Owner Account (7707000463, ${ownerUser.name}) is strictly PRESERVED.`);

  const genuineCustomerPhones = ['9473263768', '9546872658'];
  for (const gp of genuineCustomerPhones) {
    const gu = await prisma.user.findFirst({ where: { phone: gp } });
    if (gu) {
      if (demoStaffUserIds.includes(gu.id) || testCustomerUserIds.includes(gu.id)) {
        throw new Error(`CRITICAL SAFETY ABORT: Genuine user ${gp} was mistakenly scheduled for deletion!`);
      }
      console.log(`[VERIFIED SAFETY] Real Customer (${gp}, ${gu.name}) is strictly PRESERVED.`);
    }
  }

  // Step 6: Identify Demo Review
  const demoReviews = await prisma.review.findMany({
    where: { customerProfileId: { in: testProfileIds } }
  });
  console.log(`[IDENTIFIED] Demo Reviews to delete: ${demoReviews.length}`);

  if (isDryRun) {
    console.log('\n[DRY RUN COMPLETE] No records were modified. Run without --dry-run to execute cleanup.');
    await prisma.$disconnect();
    return;
  }

  // Step 7: Transactional Execution
  console.log('\n--- EXECUTING TRANSACTIONAL CLEANUP ---');
  const result = await prisma.$transaction(async (tx) => {
    // 1. Delete appointment services
    const delAptServices = await tx.appointmentService.deleteMany({
      where: { appointmentId: { in: testAptIds } }
    });

    // 2. Delete payment records
    const delPayments = await tx.paymentRecord.deleteMany({
      where: { appointmentId: { in: testAptIds } }
    });

    // 3. Delete razorpay orders
    const delOrders = await tx.razorpayOrderRecord.deleteMany({
      where: { appointmentId: { in: testAptIds } }
    });

    // 4. Delete offline payment records
    const delOfflinePayments = await tx.offlinePaymentRecord.deleteMany({
      where: { appointmentId: { in: testAptIds } }
    });

    // 5. Delete appointments
    const delApts = await tx.appointment.deleteMany({
      where: { id: { in: testAptIds } }
    });

    // 6. Delete reviews
    const delReviews = await tx.review.deleteMany({
      where: { customerProfileId: { in: testProfileIds } }
    });

    // 7. Delete customer profiles
    const delProfiles = await tx.customerProfile.deleteMany({
      where: { id: { in: testProfileIds } }
    });

    // 8. Delete staff services
    const delStaffServices = await tx.staffService.deleteMany({
      where: { staffId: { in: demoStaffIds } }
    });

    // 9. Delete availability rules
    const delAvailabilityRules = await tx.availabilityRule.deleteMany({
      where: { staffId: { in: demoStaffIds } }
    });

    // 10. Delete transformations referencing staff (or clear staffId)
    await tx.transformation.updateMany({
      where: { staffId: { in: demoStaffIds } },
      data: { staffId: null }
    });

    // 11. Delete staff records
    const delStaff = await tx.staff.deleteMany({
      where: { id: { in: demoStaffIds } }
    });

    // 12. Delete test notifications
    const delNotifs = await tx.notification.deleteMany();

    // 13. Delete test admin sessions
    const delSessions = await tx.adminSession.deleteMany();

    // 14. Delete test customer and staff user accounts
    const allUsersToDelete = [...demoStaffUserIds, ...testCustomerUserIds];
    const delUsers = await tx.user.deleteMany({
      where: { id: { in: allUsersToDelete } }
    });

    return {
      delAptServices: delAptServices.count,
      delPayments: delPayments.count,
      delOrders: delOrders.count,
      delOfflinePayments: delOfflinePayments.count,
      delApts: delApts.count,
      delReviews: delReviews.count,
      delProfiles: delProfiles.count,
      delStaffServices: delStaffServices.count,
      delAvailabilityRules: delAvailabilityRules.count,
      delStaff: delStaff.count,
      delNotifs: delNotifs.count,
      delSessions: delSessions.count,
      delUsers: delUsers.count,
    };
  });

  console.log('[SUCCESS] Transaction committed successfully!');
  console.log(JSON.stringify(result, null, 2));

  // Step 8: Post-Cleanup Database Verification
  console.log('\n--- POST-CLEANUP DATABASE VERIFICATION ---');
  const postCounts = {
    users: await prisma.user.count(),
    staff: await prisma.staff.count(),
    customerProfiles: await prisma.customerProfile.count(),
    appointments: await prisma.appointment.count(),
    payments: await prisma.paymentRecord.count(),
    orders: await prisma.razorpayOrderRecord.count(),
    reviews: await prisma.review.count(),
    notifications: await prisma.notification.count(),
    categories: await prisma.serviceCategory.count(),
    services: await prisma.service.count(),
    packages: await prisma.package.count(),
    addons: await prisma.serviceAddon.count(),
    settings: await prisma.siteSetting.count(),
  };
  console.log('Post-cleanup counts in Neon:', postCounts);

  const remainingUsers = await prisma.user.findMany({ select: { name: true, phone: true, roleType: true } });
  console.log('\nRemaining Users in Database:', remainingUsers);

  await prisma.$disconnect();
}

runCleanup().catch((e) => {
  console.error('CLEANUP FAILED:', e);
  process.exit(1);
});

