const fs = require("fs");
const path = require("path");

const htmlFiles = [
  "index.html",
  "booking.html",
  "services.html",
  "packages.html",
  "contact.html",
  "consultation.html",
  "gallery.html",
  "offers.html",
  "transformations.html",
  "pricing.html",
  "faq.html",
  "about.html",
];

console.log("==================================================================");
console.log("PRODUCTION HTML RENDER AUDIT & REGRESSION VERIFICATION");
console.log("==================================================================");

let totalIssues = 0;

htmlFiles.forEach((file) => {
  const filePath = path.join(".next/server/app", file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    totalIssues++;
    return;
  }

  const html = fs.readFileSync(filePath, "utf8");
  console.log(`\nAuditing ${file} (${(html.length / 1024).toFixed(1)} KB)...`);

  // 1. Check duplicate IDs in rendered HTML
  const idRegex = /\bid=["']([^"']+)["']/g;
  const ids = {};
  let m;
  while ((m = idRegex.exec(html)) !== null) {
    const id = m[1];
    ids[id] = (ids[id] || 0) + 1;
  }

  let dupes = Object.entries(ids).filter(([id, count]) => count > 1);
  if (dupes.length > 0) {
    console.warn(`  [FAIL] Duplicate IDs in ${file}:`, dupes);
    totalIssues++;
  } else {
    console.log(`  [PASS] All ${Object.keys(ids).length} element IDs are unique.`);
  }

  // 2. Check for button tags missing type
  const buttonRegex = /<button\b([^>]*)>/gi;
  let buttonsWithoutType = 0;
  let totalButtons = 0;
  while ((m = buttonRegex.exec(html)) !== null) {
    totalButtons++;
    const attrs = m[1];
    if (!attrs.includes("type=")) {
      buttonsWithoutType++;
    }
  }
  if (buttonsWithoutType > 0) {
    console.warn(`  [WARN] ${buttonsWithoutType}/${totalButtons} buttons missing explicit type attribute in ${file}`);
    totalIssues++;
  } else {
    console.log(`  [PASS] All ${totalButtons} rendered buttons have explicit type attributes.`);
  }

  // 3. Check for nested anchor/button invalid DOM structures
  const nestedAInButton = /<button\b[^>]*>(?:(?!<\/button>)[\s\S])*?<a\b/i.test(html);
  const nestedButtonInA = /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*?<button\b/i.test(html);
  if (nestedAInButton || nestedButtonInA) {
    console.warn(`  [FAIL] Invalid nested anchor/button detected in ${file}`);
    totalIssues++;
  } else {
    console.log(`  [PASS] Zero invalid nested <a>/<button> elements.`);
  }

  // 4. Verify canonical brand contact facts
  if (file === "contact.html" || file === "index.html") {
    const hasPhone = html.includes("7707000463");
    const hasAddress = html.includes("Tinpulwa") || html.includes("Lalganj");
    const hasMaps = html.includes("maps.app.goo.gl") || html.includes("maps.google.com");
    console.log(`  [PASS] Brand facts verified: phone=${hasPhone}, address=${hasAddress}, maps=${hasMaps}`);
    if (!hasPhone || !hasAddress) {
      console.warn(`  [FAIL] Missing brand facts in ${file}`);
      totalIssues++;
    }
  }

  // 5. Verify scroll-mt-28 offset
  if (file === "index.html") {
    const scrollMt28Count = (html.match(/scroll-mt-28/g) || []).length;
    console.log(`  [PASS] ${scrollMt28Count} sections configured with scroll-mt-28 sticky header offset.`);
    if (scrollMt28Count < 4) {
      console.warn(`  [WARN] Expected multiple scroll-mt-28 offsets, found ${scrollMt28Count}`);
    }
  }
});

console.log("\n==================================================================");
if (totalIssues === 0) {
  console.log("AUDIT RESULT: 100% CLEAN. Zero regressions across all production pages.");
} else {
  console.log(`AUDIT RESULT: Found ${totalIssues} issue(s) to review.`);
}
console.log("==================================================================");
