const fs = require('fs');

const pairs = [
  ['src/app/admin/page.tsx', 'src/app/admin/dashboard/page.tsx'],
  ['src/app/admin/calendar/page.tsx', 'src/app/admin/calendar-settings/page.tsx'],
  ['src/app/admin/settings/payment-gateway/page.tsx', 'src/app/admin/settings/razorpay/page.tsx'],
  ['src/app/(public)/stylists/page.tsx', 'src/app/(public)/team/page.tsx']
];

pairs.forEach(([f1, f2]) => {
  console.log(`\n=== COMPARING ${f1} vs ${f2} ===`);
  const c1 = fs.existsSync(f1) ? fs.readFileSync(f1, 'utf8') : 'MISSING';
  const c2 = fs.existsSync(f2) ? fs.readFileSync(f2, 'utf8') : 'MISSING';
  console.log(`${f1} length: ${c1.length} chars, preview: ${c1.slice(0, 150).replace(/\n/g, ' ')}`);
  console.log(`${f2} length: ${c2.length} chars, preview: ${c2.slice(0, 150).replace(/\n/g, ' ')}`);
});
