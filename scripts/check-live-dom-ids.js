const { execSync } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const cmd = `"${chromePath}" --headless --disable-gpu --virtual-time-budget=3000 --dump-dom http://localhost:3000/`;

const html = execSync(cmd).toString('utf8');

const requiredIds = [
  'availability',
  'packages',
  'services',
  'gallery',
  'bridal-videos',
  'products',
  'transformations',
  'reviews',
  'brands-marquee',
  'how-it-works',
  'faq',
  'contact',
  'reserve'
];

console.log('=== VERIFYING SECTION IDS IN LIVE HOMEPAGE DOM ===');
requiredIds.forEach(id => {
  const hasId = html.includes(`id="${id}"`);
  console.log(`Section #${id.padEnd(16)} -> ${hasId ? '✅ FOUND IN LIVE DOM' : '❌ NOT FOUND'}`);
});
