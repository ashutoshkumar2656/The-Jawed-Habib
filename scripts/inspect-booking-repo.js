const fs = require('fs');
const repo = fs.readFileSync('src/lib/db/repo.ts', 'utf8');
const lines = repo.split('\n');
lines.forEach((l, i) => {
  if (l.includes('createAppointment') || l.includes('generateBookingReference') || l.includes('JH-') || l.includes('JHL-')) {
    console.log(`L${i+1}: ${l.trim().slice(0, 100)}`);
  }
});
