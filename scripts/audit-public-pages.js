const fs = require('fs');

const publicPages = [
  'src/app/(public)/page.tsx',
  'src/app/(public)/booking/page.tsx',
  'src/app/(public)/services/page.tsx',
  'src/app/(public)/packages/page.tsx',
  'src/app/(public)/about/page.tsx',
  'src/app/(public)/consultation/page.tsx',
  'src/app/(public)/contact/page.tsx',
  'src/app/(public)/faq/page.tsx',
  'src/app/(public)/gallery/page.tsx',
  'src/app/(public)/offers/page.tsx',
  'src/app/(public)/pricing/page.tsx',
  'src/app/(public)/privacy/page.tsx',
  'src/app/(public)/stylists/page.tsx',
  'src/app/(public)/team/page.tsx',
  'src/app/(public)/terms/page.tsx',
  'src/app/(public)/transformations/page.tsx',
];

publicPages.forEach(p => {
  if (!fs.existsSync(p)) {
    console.log(`PAGE MISSING: ${p}`);
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  const hasBrand = content.includes('BRAND_CONFIG') || content.includes('@/lib/constants/brand');
  const hasSerif = content.includes('font-serif');
  const hasGold = content.includes('salon-gold') || content.includes('amber-400') || content.includes('#C6A56B');
  const hasMeta = content.includes('metadata') || content.includes('Metadata');
  const links = [...content.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);

  console.log(`\nPAGE: ${p}`);
  console.log(`  Length: ${content.length} chars | Serif: ${hasSerif} | Gold: ${hasGold} | Brand Import: ${hasBrand} | Metadata: ${hasMeta}`);
  console.log(`  Links count: ${links.length} -> sample: ${links.slice(0, 5).join(', ')}`);
});
