import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("scripts/dev-noise-raw.json", "utf8"));
console.log("Total runs:", data.length);
let totalConsole = 0, totalErrors = 0, totalFailedReqs = 0;
const distinctMsgs = new Map();

for (const d of data) {
  for (const c of d.consoleEvents) {
    totalConsole++;
    const key = `[${c.type}] ${c.text}`;
    if (!distinctMsgs.has(key)) {
      distinctMsgs.set(key, { count: 0, routes: new Set(), loc: c.location });
    }
    const item = distinctMsgs.get(key);
    item.count++;
    item.routes.add(`${d.route} (${d.viewport})`);
  }
  for (const e of d.pageErrors) {
    totalErrors++;
    console.log("PAGE ERROR:", d.route, d.viewport, e);
  }
  for (const r of d.failedRequests) {
    totalFailedReqs++;
    console.log("FAILED REQ:", d.route, d.viewport, r);
  }
}

console.log("\nSummary:\nConsole events:", totalConsole);
console.log("Page errors:", totalErrors);
console.log("Failed reqs:", totalFailedReqs);
console.log("\nDistinct console messages:");
for (const [k, v] of distinctMsgs.entries()) {
  console.log(`- ${k} (occurred ${v.count} times, loc: ${JSON.stringify(v.loc)})`);
  console.log(`  Routes: ${Array.from(v.routes).slice(0, 3).join(", ")}${v.routes.size > 3 ? "..." : ""}`);
}
