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
const srcFiles = allFiles.filter(f => f.startsWith('src/'));

// 1. Map of file contents for import graph
const fileContents = {};
srcFiles.forEach(f => {
  try {
    fileContents[f] = fs.readFileSync(f, 'utf8');
  } catch (e) {}
});

// Also read config files
['next.config.mjs', 'tailwind.config.ts', 'package.json'].forEach(f => {
  if (fs.existsSync(f)) {
    fileContents[f] = fs.readFileSync(f, 'utf8');
  }
});

console.log('--- COMPONENT IMPORT USAGE ---');
const components = srcFiles.filter(f => f.startsWith('src/components/'));
const componentUsage = {};

components.forEach(comp => {
  const baseName = path.basename(comp, path.extname(comp));
  const relPath = comp.replace('src/', '@/').replace(/\.tsx?$/, '');
  let count = 0;
  const importedBy = [];

  for (const [f, content] of Object.entries(fileContents)) {
    if (f === comp) continue;
    // Check if imported by path or by name
    if (content.includes(relPath) || content.includes(baseName)) {
      count++;
      importedBy.push(f);
    }
  }
  componentUsage[comp] = { count, importedBy };
  console.log(`${comp} -> imported in ${count} files ${count === 0 ? '*** UNUSED ***' : ''}`);
});

console.log('\n--- LIB MODULE IMPORT USAGE ---');
const libs = srcFiles.filter(f => f.startsWith('src/lib/'));
libs.forEach(lib => {
  const baseName = path.basename(lib, path.extname(lib));
  const relPath = lib.replace('src/', '@/').replace(/\.tsx?$/, '');
  let count = 0;
  const importedBy = [];

  for (const [f, content] of Object.entries(fileContents)) {
    if (f === lib) continue;
    if (content.includes(relPath) || content.includes(baseName)) {
      count++;
      importedBy.push(f);
    }
  }
  console.log(`${lib} -> imported in ${count} files ${count === 0 ? '*** UNUSED ***' : ''}`);
});

console.log('\n--- SCANNING ALL LINK TARGETS ACROSS PAGES & COMPONENTS ---');
const linkRegex = /href=["']([^"']+)["']/g;
const linksFound = new Set();
const linkSources = {};

for (const [f, content] of Object.entries(fileContents)) {
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const target = match[1];
    linksFound.add(target);
    if (!linkSources[target]) linkSources[target] = [];
    linkSources[target].push(f);
  }
}

console.log(`Found ${linksFound.size} distinct href targets:`);
const internalLinks = [...linksFound].filter(l => l.startsWith('/') && !l.startsWith('//'));
internalLinks.sort().forEach(l => {
  console.log(`LINK: ${l} (from: ${linkSources[l].slice(0, 2).join(', ')}${linkSources[l].length > 2 ? '...' : ''})`);
});
