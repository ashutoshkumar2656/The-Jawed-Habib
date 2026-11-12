const fs = require('fs');

const html = fs.readFileSync('scratch_kurji.html', 'utf8');

// Inspect CSS links and style tags
const styleMatches = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Stylesheets:', styleMatches);

// Extract section tags and their immediate children or text
const sections = [...html.matchAll(/<section[^>]*id=["']([^"']+)["'][^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/section>/gi)];
console.log(`\nFound ${sections.length} major sections:`);
sections.forEach(s => {
  const id = s[1];
  const cls = s[2];
  const inner = s[3].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  console.log(`\n--- SECTION id="#${id}" class="${cls.slice(0, 60)}" ---`);
  console.log(`Text preview: ${inner}...`);
});
