const fs = require('fs');
const path = require('path');

function mirrorDirs(srcDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const srcSub = path.join(srcDir, entry.name);
      const targetSub = path.join(targetDir, entry.name);
      mirrorDirs(srcSub, targetSub);
    }
  }
}

const srcApp = path.resolve('src/app');
const targetApp = path.resolve('.next/server/app');
mirrorDirs(srcApp, targetApp);
const targetTypes = path.resolve('.next/types/app');
mirrorDirs(srcApp, targetTypes);
console.log('Successfully precreated .next/server/app and .next/types/app directory trees');
