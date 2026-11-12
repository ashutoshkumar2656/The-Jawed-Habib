const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file === 'route.ts' || file === 'route.js') {
      results.push(full);
    }
  }
  return results;
}

const routes = walk('src/app/api');
const missingDynamic = [];
const missingRuntime = [];

for (const r of routes) {
  const content = fs.readFileSync(r, 'utf-8');
  if (!content.includes('dynamic = "force-dynamic"') && !content.includes("dynamic = 'force-dynamic'")) {
    missingDynamic.push(r);
  }
  if (!content.includes('runtime = "nodejs"') && !content.includes("runtime = 'nodejs'")) {
    missingRuntime.push(r);
  }
}

console.log('Total API routes:', routes.length);
console.log('Missing dynamic ("force-dynamic"):', missingDynamic.length);
missingDynamic.forEach(f => console.log('  missing dynamic:', f));
console.log('Missing runtime ("nodejs"):', missingRuntime.length);
