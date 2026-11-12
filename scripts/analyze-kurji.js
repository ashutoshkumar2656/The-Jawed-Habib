const fs = require('fs');

const html = fs.readFileSync('scratch_kurji.html', 'utf8');

console.log('=== TITLE ===');
const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
console.log(titleMatch ? titleMatch[1] : 'No title');

console.log('\n=== HEADINGS ===');
const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
let match;
while ((match = headingRegex.exec(html)) !== null) {
  const level = match[1];
  const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text) {
    console.log(`H${level}: ${text}`);
  }
}

console.log('\n=== SECTIONS & MAIN IDS ===');
const idRegex = /<(section|div|nav|header|footer)[^>]*\bid=["']([^"']+)["'][^>]*>/gi;
const ids = [];
while ((match = idRegex.exec(html)) !== null) {
  ids.push(`${match[1]}#${match[2]}`);
}
console.log('Found IDs:', ids.join(', '));

console.log('\n=== BUTTONS / CTAS ===');
const buttonRegex = /<(button|a)[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/\1>/gi;
const ctas = [];
while ((match = buttonRegex.exec(html)) !== null) {
  const text = match[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text && text.length < 50 && (text.toLowerCase().includes('book') || text.toLowerCase().includes('whatsapp') || text.toLowerCase().includes('package') || text.toLowerCase().includes('explore') || text.toLowerCase().includes('calendar') || text.toLowerCase().includes('date') || text.toLowerCase().includes('pay') || text.toLowerCase().includes('select'))) {
    ctas.push(`${match[1]}: "${text}"`);
  }
}
console.log('Key CTAs:', [...new Set(ctas)].slice(0, 30));
