const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const fullPath = dir + '/' + file;
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) getFiles(fullPath, files);
      else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.mjs')) {
        files.push(fullPath);
      }
    } catch (e) {}
  }
  return files;
}

const codeFiles = getFiles('src').concat(getFiles('scripts'), ['next.config.mjs', 'tailwind.config.ts']);
const allCode = codeFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

console.log('=== DEPENDENCY USAGE AUDIT ===');
const deps = Object.keys(pkg.dependencies || {});
deps.forEach(dep => {
  // Check if imported
  const regex = new RegExp(`from\\s+['"]${dep}['"/]|require\\(['"]${dep}['"/]`, 'g');
  const found = regex.test(allCode) || allCode.includes(dep);
  console.log(`DEP: ${dep.padEnd(30)} -> ${found ? 'USED' : '*** POTENTIALLY UNUSED ***'}`);
});
