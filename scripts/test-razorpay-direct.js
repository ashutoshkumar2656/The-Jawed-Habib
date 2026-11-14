const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      let v = trimmed.slice(eqIdx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('Testing Razorpay Credentials:');
console.log('Key ID present:', !!keyId, 'Format:', keyId ? keyId.substring(0, 9) + '...' : 'none');
console.log('Key Secret present:', !!keySecret, 'Length:', keySecret ? keySecret.length : 0);

async function testRzp() {
  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  try {
    const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('GET /v1/payments status:', res.status, res.statusText);
    const data = await res.json();
    if (res.ok) {
      console.log('Razorpay Auth: SUCCESS');
      console.log('Payment items returned:', data.items ? data.items.length : 0);
    } else {
      console.log('Razorpay Auth Error:', data.error);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testRzp();
