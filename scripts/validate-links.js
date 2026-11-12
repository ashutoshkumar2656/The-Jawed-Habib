const fs = require('fs');

const page = fs.readFileSync('src/app/(public)/page.tsx', 'utf8');
const header = fs.readFileSync('src/components/layout/header.tsx', 'utf8');
const footer = fs.readFileSync('src/components/layout/footer.tsx', 'utf8');

// Find all id="..." in page.tsx
const idRegex = /id=["']([^"']+)["']/g;
const declaredIds = new Set();
let m;
while ((m = idRegex.exec(page)) !== null) {
  declaredIds.add(m[1]);
}

console.log('Declared section IDs in page.tsx:', [...declaredIds]);

// Find all internal anchor links in header and page
const combinedCode = page + '\n' + header + '\n' + footer;
const anchorRegex = /href=["']\/#([^"']+)["']/g;
const anchorLinks = new Set();
while ((m = anchorRegex.exec(combinedCode)) !== null) {
  anchorLinks.add(m[1]);
}

console.log('\nAnchor link destinations referenced in navigation / CTAs:', [...anchorLinks]);

const missing = [...anchorLinks].filter(id => !declaredIds.has(id));
if (missing.length === 0) {
  console.log('\n✅ All navigation anchor links resolve to valid section IDs in page.tsx!');
} else {
  console.log('\n❌ Missing anchor targets:', missing);
}
