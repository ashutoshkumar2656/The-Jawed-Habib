const fs = require('fs');
const html = fs.readFileSync('scratch/scratch_kurji.html', 'utf8');

const regex = /<section[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  const id = m[1];
  const inner = m[2];
  const h2Matches = [...inner.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)].map(h => h[1].replace(/<[^>]+>/g, '').trim());
  console.log(`\nSection #${id}:`);
  console.log(`  Headings: ${h2Matches.slice(0, 3).join(' | ')}`);
}
