const fs = require('fs');

const html = fs.readFileSync('scratch_kurji.html', 'utf8');

function printSection(id) {
  const re = new RegExp(`<section[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i');
  const match = html.match(re);
  if (match) {
    console.log(`\n================== SECTION #${id} ==================`);
    console.log(match[0].slice(0, 2000));
    console.log('\n... (length: ' + match[0].length + ' characters)');
  } else {
    console.log(`Section #${id} not found.`);
  }
}

printSection('availability');
printSection('booking-form-section');
printSection('packages');
