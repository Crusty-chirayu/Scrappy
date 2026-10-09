import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DEV_ROUTE_DIR = path.join(ROOT, "apps", "web", "src", "app", "dev");
const DEV_CATALOG_DIR = path.join(ROOT, "apps", "web", "src", "dev-catalog");

const action = process.argv[2];

if (action === "stash") {
  if (fs.existsSync(DEV_ROUTE_DIR)) {
    console.log("[toggle-dev-routes] Stashing src/app/dev -> src/dev-catalog for production build...");
    if (fs.existsSync(DEV_CATALOG_DIR)) {
      fs.rmSync(DEV_CATALOG_DIR, { recursive: true, force: true });
    }
    fs.renameSync(DEV_ROUTE_DIR, DEV_CATALOG_DIR);
    console.log("[toggle-dev-routes] Stashed successfully.");
  } else {
    console.log("[toggle-dev-routes] No src/app/dev found to stash.");
  }
} else if (action === "restore") {
  if (fs.existsSync(DEV_CATALOG_DIR)) {
    console.log("[toggle-dev-routes] Restoring src/dev-catalog -> src/app/dev...");
    if (fs.existsSync(DEV_ROUTE_DIR)) {
      fs.rmSync(DEV_ROUTE_DIR, { recursive: true, force: true });
    }
    fs.renameSync(DEV_CATALOG_DIR, DEV_ROUTE_DIR);
    console.log("[toggle-dev-routes] Restored successfully.");
  } else {
    console.log("[toggle-dev-routes] No src/dev-catalog found to restore.");
  }
} else {
  console.log("Usage: tsx scripts/toggle-dev-routes.ts [stash|restore]");
}
