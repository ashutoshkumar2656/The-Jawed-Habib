const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file === 'route.ts' || file === 'route.js') {
      results.push(full);
    }
  }
  return results;
}

const routes = walk('src/app/api');
let updatedCount = 0;

for (const r of routes) {
  let content = fs.readFileSync(r, 'utf-8');
  let modified = false;

  const hasDynamic = content.includes('dynamic = "force-dynamic"') || content.includes("dynamic = 'force-dynamic'");
  const hasRuntime = content.includes('runtime = "nodejs"') || content.includes("runtime = 'nodejs'");

  if (!hasDynamic || !hasRuntime) {
    // Find the end of import statements
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('} from ')) {
        lastImportIdx = i;
      }
    }

    const additions = [];
    if (!hasDynamic) {
      additions.push('export const dynamic = "force-dynamic";');
    }
    if (!hasRuntime) {
      additions.push('export const runtime = "nodejs";');
    }

    if (lastImportIdx !== -1) {
      lines.splice(lastImportIdx + 1, 0, '', ...additions);
      content = lines.join('\n');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(r, content, 'utf-8');
    updatedCount++;
    console.log('Updated:', r);
  }
}

console.log(`Total updated routes: ${updatedCount} / ${routes.length}`);
