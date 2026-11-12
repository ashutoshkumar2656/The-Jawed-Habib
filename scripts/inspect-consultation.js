const fs = require('fs');

const html = fs.readFileSync('scratch_kurji.html', 'utf8');

const match = html.match(/How Your Consultation Works[\s\S]*?<\/section>/i);
if (match) {
  console.log('Consultation section:', match[0].slice(0, 3000));
} else {
  console.log('Not found by direct text, searching for whatsapp or consultation');
  const m2 = html.match(/<section[^>]*id=["'][^"']*consultation[^"']*["'][^>]*>[\s\S]*?<\/section>/i);
  if (m2) console.log(m2[0].slice(0, 3000));
}
