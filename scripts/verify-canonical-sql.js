const fs = require('fs');
const path = require('path');

// Read the raw file
let content = fs.readFileSync('prisma/canonical_baseline.sql');

// Detect UTF-16 LE BOM or zero bytes
if (content[0] === 0xff && content[1] === 0xfe) {
  content = content.toString('utf16le');
} else if (content.indexOf('\0') !== -1) {
  content = content.toString('utf16le');
} else {
  content = content.toString('utf8');
}

// Normalize newlines
content = content.replace(/\r\n/g, '\n');

// Write clean UTF-8
fs.writeFileSync('prisma/canonical_baseline.sql', content, 'utf8');
console.log('Clean UTF-8 written. Size:', fs.statSync('prisma/canonical_baseline.sql').size, 'bytes');

// Analyze the SQL statements
const enums = [...content.matchAll(/CREATE TYPE "([^"]+)" AS ENUM/g)].map(m => m[1]);
const tables = [...content.matchAll(/CREATE TABLE "([^"]+)"/g)].map(m => m[1]);
const indexes = [...content.matchAll(/CREATE (?:UNIQUE )?INDEX "([^"]+)"/g)].map(m => m[1]);
const foreignKeys = [...content.matchAll(/ALTER TABLE "([^"]+)" ADD CONSTRAINT "([^"]+)" FOREIGN KEY/g)].map(m => ({ table: m[1], fk: m[2] }));
const dropStatements = [...content.matchAll(/\bDROP\b/gi)];

console.log('\n--- CANONICAL BASELINE SQL VERIFICATION ---');
console.log('Enums Count:', enums.length, enums);
console.log('Tables Count:', tables.length, tables);
console.log('Indexes Count:', indexes.length);
console.log('Foreign Keys Count:', foreignKeys.length);
console.log('DROP Statements Found:', dropStatements.length);

// Verify specific required models and columns
const requiredTables = [
  'User', 'CustomerProfile', 'AdminSession', 'Role', 'Permission',
  'ServiceCategory', 'Service', 'ServiceAddon', 'Staff', 'StaffService',
  'Appointment', 'AppointmentService', 'AppointmentAddon', 'AvailabilityRule',
  'BlockedSlot', 'Review', 'GalleryImage', 'Transformation', 'Offer',
  'Package', 'Enquiry', 'Coupon', 'Video', 'Brand', 'Faq', 'Notification',
  'SiteSetting', 'AuditLog', 'PaymentRecord', 'CalendarSettingRecord',
  'TimeSlotHoldRecord', 'PaymentGatewaySettingRecord', 'RazorpayOrderRecord',
  'PaymentRefundRecord', 'WebhookEventRecord', 'OfflinePaymentRecord',
  '_RolePermissions'
];

const missingTables = requiredTables.filter(t => !tables.includes(t));
console.log('\nMissing Required Tables:', missingTables.length === 0 ? 'NONE (All 37 tables present)' : missingTables);

// Check Appointment columns
const appointmentBlock = content.match(/CREATE TABLE "Appointment" \(([\s\S]*?)\);/);
if (appointmentBlock) {
  const aptCols = [
    'packageId', 'depositAmount', 'remainingAmount', 'depositType',
    'holdToken', 'internalNotes', 'bridalRequirements'
  ];
  console.log('\nChecking Appointment columns in canonical baseline:');
  for (const col of aptCols) {
    const hasCol = appointmentBlock[1].includes(`"${col}"`);
    console.log(`  - "${col}":`, hasCol ? 'PRESENT' : 'MISSING');
  }
}
