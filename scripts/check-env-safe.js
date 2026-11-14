const fs = require('fs');
const path = require('path');

const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.log({ error: '.env not found' });
  process.exit(0);
}

const lines = fs.readFileSync(envPath, 'utf8').split('\n');
const env = {};
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
    env[k] = v;
  }
}

// Inspect DATABASE_URL
let dbInfo = null;
if (env.DATABASE_URL) {
  try {
    const u = new URL(env.DATABASE_URL);
    dbInfo = {
      protocol: u.protocol,
      host: u.host,
      database: u.pathname.replace(/^\//, ''),
      searchParams: Object.fromEntries(u.searchParams.entries()),
      hasUser: Boolean(u.username),
      hasPass: Boolean(u.password),
    };
  } catch (e) {
    dbInfo = { error: e.message };
  }
}

// Inspect Razorpay Key
let rzpInfo = null;
if (env.RAZORPAY_KEY_ID) {
  rzpInfo = {
    keyIdPrefix: env.RAZORPAY_KEY_ID.slice(0, 8),
    keyIdLength: env.RAZORPAY_KEY_ID.length,
    isTest: env.RAZORPAY_KEY_ID.startsWith('rzp_test_'),
    isLive: env.RAZORPAY_KEY_ID.startsWith('rzp_live_'),
    hasSecret: Boolean(env.RAZORPAY_KEY_SECRET),
    hasWebhookSecret: Boolean(env.RAZORPAY_WEBHOOK_SECRET),
  };
}

console.log('DB INFO:', JSON.stringify(dbInfo, null, 2));
console.log('RZP INFO:', JSON.stringify(rzpInfo, null, 2));
console.log('NODE_ENV:', env.NODE_ENV);
console.log('APP_URL:', env.APP_URL);
console.log('PAYMENT_ENCRYPTION_KEY exists:', Boolean(env.PAYMENT_ENCRYPTION_KEY));
