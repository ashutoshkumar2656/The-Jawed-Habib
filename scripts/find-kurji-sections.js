const fs = require('fs');
const html = fs.readFileSync('scratch/scratch_kurji.html', 'utf8');

const regex = /<section[^>]*id=["']([^"']+)["'][^>]*>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Section id:', m[1]);
}
