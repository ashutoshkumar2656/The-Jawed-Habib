const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  let list;
  try {
    list = fs.readdirSync(dir);
  } catch (e) {
    return files;
  }
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.system_generated') continue;
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getFiles(fullPath, files);
      } else {
        files.push(fullPath.replace(/\\/g, '/'));
      }
    } catch (e) {}
  }
  return files;
}

const allFiles = getFiles('.');
console.log('=== PROJECT AUDIT SUMMARY ===');
console.log('Total files across repo:', allFiles.length);

const srcFiles = allFiles.filter(f => f.startsWith('src/'));
console.log('Total files in src/:', srcFiles.length);

const pages = srcFiles.filter(f => f.endsWith('page.tsx'));
const routeHandlers = srcFiles.filter(f => f.endsWith('route.ts'));
const components = srcFiles.filter(f => f.startsWith('src/components/'));
const libs = srcFiles.filter(f => f.startsWith('src/lib/'));
const types = srcFiles.filter(f => f.startsWith('src/types/'));
const tests = srcFiles.filter(f => f.includes('__tests__') || f.includes('.test.ts') || f.includes('.spec.ts'));

console.log('Pages:', pages.length);
console.log('Route Handlers (API):', routeHandlers.length);
console.log('Components:', components.length);
console.log('Lib modules:', libs.length);
console.log('Type definitions:', types.length);
console.log('Test files:', tests.length);

console.log('\n--- ALL PAGES ---');
pages.forEach(p => console.log('PAGE:', p));

console.log('\n--- ALL ROUTE HANDLERS ---');
routeHandlers.forEach(r => console.log('API:', r));

console.log('\n--- ALL COMPONENTS ---');
components.forEach(c => console.log('COMP:', c));

console.log('\n--- ALL LIB FILES ---');
libs.forEach(l => console.log('LIB:', l));
