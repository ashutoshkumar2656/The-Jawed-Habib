const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\vk010\\.gemini\\antigravity\\brain\\cfc33082-9d67-4f97-b641-b0836c4ff7d7\\screenshots';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const targets = [
  { name: 'homepage_desktop_1440.png', url: 'http://localhost:3000/', w: 1440, h: 1000 },
  { name: 'homepage_mobile_390.png', url: 'http://localhost:3000/', w: 390, h: 844 },
  { name: 'booking_desktop_1440.png', url: 'http://localhost:3000/booking', w: 1440, h: 1000 },
  { name: 'booking_mobile_390.png', url: 'http://localhost:3000/booking', w: 390, h: 844 }
];

targets.forEach(t => {
  const dest = path.join(outDir, t.name);
  console.log('Capturing:', t.name, `(${t.w}x${t.h})`);
  const cmd = `"${chromePath}" --headless --disable-gpu --virtual-time-budget=5000 --window-size=${t.w},${t.h} --screenshot="${dest}" ${t.url}`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    const stat = fs.statSync(dest);
    console.log('✅ Successfully saved:', t.name, 'size:', stat.size, 'bytes');
  } catch (e) {
    console.error('❌ Error capturing', t.name, e.message);
  }
});
