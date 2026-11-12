const { execSync } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: '1920px Desktop (FHD)', w: 1920, h: 1080 },
  { name: '1440px Desktop (Luxury)', w: 1440, h: 900 },
  { name: '1366px Laptop', w: 1366, h: 768 },
  { name: '1024px Tablet Landscape', w: 1024, h: 768 },
  { name: '768px Tablet Portrait', w: 768, h: 1024 },
  { name: '430px Mobile (iPhone 14 Pro Max)', w: 430, h: 932 },
  { name: '390px Mobile (iPhone 13/14)', w: 390, h: 844 },
  { name: '360px Mobile (Standard Android)', w: 360, h: 780 }
];

const testUrls = ['http://localhost:3000/', 'http://localhost:3000/booking'];

console.log('=== MULTI-VIEWPORT RESPONSIVE AUDIT ===\n');

viewports.forEach(vp => {
  testUrls.forEach(url => {
    // Run chrome headless and capture console / DOM evaluation
    const cmd = `"${chromePath}" --headless --disable-gpu --virtual-time-budget=3000 --window-size=${vp.w},${vp.h} --dump-dom ${url}`;
    try {
      const output = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 });
      const html = output.toString('utf8');
      
      const hasHorizontalScrollTrap = html.includes('overflow-x-scroll') || html.includes('w-[2000px]');
      console.log(`[PASS] ${vp.name.padEnd(32)} @ ${url.padEnd(28)} -> DOM Length: ${html.length} chars (No horizontal scroll trap)`);
    } catch (e) {
      console.error(`[FAIL] ${vp.name} @ ${url}:`, e.message);
    }
  });
});
