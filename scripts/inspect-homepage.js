const fs = require('fs');
const page = fs.readFileSync('src/app/(public)/page.tsx', 'utf8');

const lines = page.split('\n');
console.log('Total lines in page.tsx:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('SECTION') || line.includes('Section') || line.includes('<section') || line.includes('id=')) {
    if (line.trim().startsWith('{/*') || line.trim().startsWith('<section') || line.includes('id="')) {
      console.log(`L${idx + 1}: ${line.trim().slice(0, 100)}`);
    }
  }
});
