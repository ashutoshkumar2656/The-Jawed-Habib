const fs = require("fs");
const path = require("path");

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) results = results.concat(getFiles(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) results.push(full);
  });
  return results;
}

const files = getFiles("src/app/(public)")
  .concat(getFiles("src/components/public"))
  .concat(getFiles("src/components/layout"));

const idMap = {};

files.forEach(f => {
  const content = fs.readFileSync(f, "utf8");
  const regex = /\bid=["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const id = m[1];
    // Filter out React key or non-anchor/CSS ids like radio inputs
    if (!idMap[id]) idMap[id] = [];
    idMap[id].push(f);
  }
});

console.log("--- DUPLICATE ID SCAN RESULTS ---");
let dupeCount = 0;
for (const [id, fileList] of Object.entries(idMap)) {
  if (fileList.length > 1) {
    console.log(`Duplicate ID "${id}" found in:`);
    fileList.forEach(file => console.log(`  - ${file}`));
    dupeCount++;
  }
}
if (dupeCount === 0) {
  console.log("SUCCESS: Zero duplicate HTML IDs across all public pages & components!");
}
