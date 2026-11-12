const fs = require('fs');
const code = fs.readFileSync('src/components/public/bridal-booking-experience.tsx', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => {
  if (l.includes('SECTION') || l.includes('section') || l.includes('id=')) {
    if (l.includes('{/*') || l.includes('<section') || l.includes('id="')) {
      console.log(`L${i+1}: ${l.trim().slice(0, 90)}`);
    }
  }
});
