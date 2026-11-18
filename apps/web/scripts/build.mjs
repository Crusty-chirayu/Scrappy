import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const devDir = path.resolve("src/app/dev");
const catalogDir = path.resolve("src/dev-catalog");

let moved = false;
try {
  if (fs.existsSync(devDir)) {
    console.log("[build] Excluding /dev/* routes from production build...");
    if (fs.existsSync(catalogDir)) {
      fs.rmSync(catalogDir, { recursive: true, force: true });
    }
    fs.renameSync(devDir, catalogDir);
    moved = true;
  }
} catch {
  console.warn(
    "[build] Dev route rename bypassed (file watcher active); dev layout returns notFound() in production.",
  );
}

try {
  execSync("next build", { stdio: "inherit" });
} finally {
  if (moved && fs.existsSync(catalogDir)) {
    console.log("[build] Restoring /dev/* routes for local development...");
    if (fs.existsSync(devDir)) {
      fs.rmSync(devDir, { recursive: true, force: true });
    }
    fs.renameSync(catalogDir, devDir);
  }
}
